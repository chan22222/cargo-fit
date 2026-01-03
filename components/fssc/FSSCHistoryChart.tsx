import React, { useMemo, useState, useEffect } from 'react';
import { FSSCRecord, CurrencyType, AIRLINE_CODES } from '../../types/fssc';

interface FSSCHistoryChartProps {
  records: FSSCRecord[];
}

// 기본 환율 (localStorage에 없을 경우 사용)
const DEFAULT_RATES: Record<CurrencyType, number> = {
  KRW: 1,
  USD: 1450,
  EUR: 1580,
  JPY: 9.5,
  CNY: 200,
};

const FSSCHistoryChart: React.FC<FSSCHistoryChartProps> = ({ records }) => {
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [chartType, setChartType] = useState<'FS' | 'SC'>('FS');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(DEFAULT_RATES);

  // localStorage에서 환율 가져오기
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const cached = localStorage.getItem(`unipass_rates_${today}`);
    if (cached) {
      try {
        const rates = JSON.parse(cached);
        setExchangeRates({ ...DEFAULT_RATES, ...rates });
      } catch (e) {
        // 파싱 실패 시 기본값 사용
      }
    }
  }, []);

  // 고유 항공사 목록
  const uniqueCarriers = useMemo(() => {
    const carriers = new Set(records.map(r => r.carrier_code));
    return Array.from(carriers).sort();
  }, [records]);

  // 월별 데이터 집계
  const monthlyData = useMemo(() => {
    let filtered = records.filter(r => r.type === chartType);
    if (selectedCarrier) {
      filtered = filtered.filter(r => r.carrier_code === selectedCarrier);
    }

    // 시작일 기준으로 월별 그룹화
    const grouped: Record<string, { total: number; count: number; min: number; max: number }> = {};

    filtered.forEach(r => {
      if (!r.over_charge) return;
      const month = r.start_date.slice(0, 7); // YYYY-MM
      const rate = exchangeRates[r.currency] || DEFAULT_RATES[r.currency] || 1;
      const krwRate = r.over_charge * rate;

      if (!grouped[month]) {
        grouped[month] = { total: 0, count: 0, min: Infinity, max: -Infinity };
      }
      grouped[month].total += krwRate;
      grouped[month].count++;
      grouped[month].min = Math.min(grouped[month].min, krwRate);
      grouped[month].max = Math.max(grouped[month].max, krwRate);
    });

    // 최근 12개월만
    return Object.entries(grouped)
      .map(([month, data]) => ({
        month,
        label: month.slice(2).replace('-', '.'),
        avg: data.total / data.count,
        min: data.min === Infinity ? 0 : data.min,
        max: data.max === -Infinity ? 0 : data.max,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }, [records, selectedCarrier, chartType, exchangeRates]);

  // 차트 스케일 (최소~최대 범위 기준)
  const { minValue, maxValue } = useMemo(() => {
    const values = monthlyData.map(d => d.avg).filter(v => v > 0);
    if (values.length === 0) return { minValue: 0, maxValue: 1 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { minValue: min, maxValue: max };
  }, [monthlyData]);

  // 변동률 계산
  const changeRate = useMemo(() => {
    if (monthlyData.length < 2) return null;
    const first = monthlyData[0].avg;
    const last = monthlyData[monthlyData.length - 1].avg;
    return ((last - first) / first) * 100;
  }, [monthlyData]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">요금 추이</h3>
            <p className="text-xs text-slate-500">월별 변동 현황</p>
          </div>
        </div>

        {changeRate !== null && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            changeRate > 0
              ? 'bg-red-100 text-red-600'
              : changeRate < 0
                ? 'bg-green-100 text-green-600'
                : 'bg-slate-100 text-slate-600'
          }`}>
            {changeRate > 0 ? '+' : ''}{changeRate.toFixed(1)}%
          </div>
        )}
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4">
        <select
          value={selectedCarrier}
          onChange={(e) => setSelectedCarrier(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
        >
          <option value="">전체 항공사</option>
          {uniqueCarriers.map(code => (
            <option key={code} value={code}>{code} - {AIRLINE_CODES[code] || code}</option>
          ))}
        </select>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setChartType('FS')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              chartType === 'FS'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FSC
          </button>
          <button
            onClick={() => setChartType('SC')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              chartType === 'SC'
                ? 'bg-green-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SCC
          </button>
        </div>
      </div>

      {/* 차트 */}
      {monthlyData.length > 0 ? (
        <div>
          <div className="flex items-end gap-1 h-[160px] mb-2">
            {monthlyData.map((data, index) => {
              // 최소값~최대값 범위에서 20%~100%로 스케일링
              const range = maxValue - minValue;
              const height = range > 0
                ? ((data.avg - minValue) / range) * 80 + 20
                : 50;
              const isLast = index === monthlyData.length - 1;

              return (
                <div
                  key={data.month}
                  className="flex-1 flex flex-col items-end justify-end group relative h-full"
                >
                  {/* 툴팁 */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                      <div className="font-medium">{data.month}</div>
                      <div>평균: ₩{data.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      <div className="text-slate-300">
                        {data.min.toLocaleString(undefined, { maximumFractionDigits: 0 })} ~ {data.max.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>

                  {/* 바 */}
                  <div
                    className={`w-full rounded-t transition-all duration-300 cursor-pointer ${
                      chartType === 'FS' ? 'bg-blue-500' : 'bg-green-500'
                    } ${isLast ? 'opacity-100' : 'opacity-60'} hover:opacity-100`}
                    style={{ height: `${Math.round(height * 1.6)}px` }}
                  />
                </div>
              );
            })}
          </div>

          {/* X축 레이블 */}
          <div className="flex gap-1">
            {monthlyData.map((data, index) => (
              <div
                key={data.month}
                className={`flex-1 text-center text-[9px] ${
                  index === monthlyData.length - 1 ? 'text-slate-900 font-medium' : 'text-slate-400'
                }`}
              >
                {data.label}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm">
          표시할 데이터가 없습니다
        </div>
      )}

      {/* 범례 */}
      {monthlyData.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded ${chartType === 'FS' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
              <span>월 평균 요금 (kg당)</span>
            </div>
          </div>
          <div>
            데이터: {monthlyData.reduce((s, d) => s + d.count, 0)}건
          </div>
        </div>
      )}
    </div>
  );
};

export default FSSCHistoryChart;
