import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'npm:xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { date, force } = await req.json();

    if (!date) {
      return new Response(JSON.stringify({ error: 'date required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 환경변수가 설정되지 않았습니다');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 강제 동기화가 아닌 경우에만 이미 동기화된 날짜인지 확인
    if (!force) {
      const { data: syncLog } = await supabase
        .from('fssc_sync_log')
        .select('synced_at')
        .eq('sync_date', date)
        .single();

      if (syncLog) {
        return new Response(JSON.stringify({ success: true, count: 0, skipped: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    const allRecords: any[] = [];

    // FS, SC 둘 다 가져오기
    for (const type of ['FS', 'SC']) {
      try {
        const url = `https://www.cosmoair.com/zservice/z_fsc_excel.html?types=${type}&sdate=${date}&carr=`;

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Referer': 'https://www.cosmoair.com/z_fsc',
          }
        });

        if (!res.ok) continue;

        const buffer = await res.arrayBuffer();
        if (buffer.byteLength < 100) continue;

        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[0]) continue;

          const parseDate = (val: any): string => {
            if (!val) return '';
            if (typeof val === 'number') {
              const excelEpoch = new Date(1899, 11, 30);
              const d = new Date(excelEpoch.getTime() + val * 86400000);
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              if (y > 2100) return '2099-12-31';
              return `${y}-${m}-${day}`;
            }
            const str = String(val).trim();
            if (str.includes('9999') || str.includes('99-99')) return '2099-12-31';
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
              const [y] = str.split('-').map(Number);
              if (y > 2100) return '2099-12-31';
              return str;
            }
            const match = str.match(/^(\d{4})[.\/](\d{1,2})[.\/](\d{1,2})$/);
            if (match) {
              const y = Number(match[1]);
              if (y > 2100) return '2099-12-31';
              return `${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}`;
            }
            return '';
          };

          const parseNum = (val: any): number | null => {
            if (val === null || val === undefined || val === '') return null;
            const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/[,\s]/g, ''));
            return isNaN(n) ? null : n;
          };

          // Excel 구조: [타입, 항공사코드, 시작일, 종료일, 통화, MIN, OVER, 적용대상, 비고]
          // row[0] = FS/SC (타입)
          // row[1] = 항공사 코드
          // row[2] = 시작일
          // row[3] = 종료일
          // row[4] = 통화
          // row[5] = MIN
          // row[6] = OVER
          // row[7] = 적용대상
          // row[8] = 비고

          const carrierCode = String(row[1] || '').trim().substring(0, 3);
          if (!carrierCode) continue;

          const startDate = parseDate(row[2]);
          if (!startDate) continue;

          allRecords.push({
            type: String(type).substring(0, 2),
            carrier_code: carrierCode,
            carrier_name: '', // 외부 소스에서 항공사명 미제공
            start_date: startDate,
            end_date: parseDate(row[3]) || '2099-12-31',
            currency: String(row[4] || 'KRW').trim().toUpperCase().substring(0, 3),
            min_charge: parseNum(row[5]),
            over_charge: parseNum(row[6]),
            route: String(row[7] || '').trim().substring(0, 255),
            remark: String(row[8] || '').trim().substring(0, 255),
            charge_code: (type === 'FS' ? 'FSC' : 'SCC').substring(0, 3),
          });
        }
      } catch (e) {
        // 개별 타입 에러는 무시하고 계속 진행
      }
    }

    if (allRecords.length > 0) {
      // 중복 방지: 같은 type + start_date + carrier_code + route 조합의 기존 레코드만 삭제
      // 기존에는 type + start_date만으로 삭제해서 다른 항공사 데이터까지 삭제되는 문제가 있었음
      for (const record of allRecords) {
        await supabase
          .from('fssc')
          .delete()
          .eq('type', record.type)
          .eq('start_date', record.start_date)
          .eq('carrier_code', record.carrier_code)
          .eq('route', record.route);
      }

      // 새 데이터 저장
      const { error } = await supabase.from('fssc').insert(allRecords);
      if (error) throw error;

      // 동기화 로그 저장
      await supabase.from('fssc_sync_log').insert({
        sync_date: date,
        record_count: allRecords.length,
        synced_at: new Date().toISOString()
      });
    }

    return new Response(JSON.stringify({ success: true, count: allRecords.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
