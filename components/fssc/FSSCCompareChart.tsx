import React, { useMemo, useState } from 'react';
import { FSSCRecord, CurrencyType, AIRLINE_CODES } from '../../types/fssc';

interface FSSCCompareChartProps {
  records: FSSCRecord[];
}

// 환율
const EXCHANGE_RATES: Record<CurrencyType, number> = {
  KRW: 1,
  USD: 1450,
  EUR: 1580,
  JPY: 9.5,
  CNY: 200,
};

const FSSCCompareChart: React.FC<FSSCCompareChartProps> = ({ records }) => {
  const [chartType, setChartType] = useState<'FS' | 'SC'>('FS');
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');

  // 유효한 레코드만 (현재 날짜 기준)
  const validRecords = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return records.filter(r =>
      r.start_date <= today &&
      r.end_date >= today &&
      r.type === chartType
    );
  }, [records, chartType]);

  // 항공사별 평균 요금 (KRW 환산)
  const carrierData = useMemo(() => {
    const grouped: Record<string, { total: number; count: number; records: FSSCRecord[] }> = {};

    validRecords.forEach(r => {
      if (!r.over_charge) return;
      const krwRate = (r.over_charge || 0) * EXCHANGE_RATES[r.currency];

      if (!grouped[r.carrier_code]) {
        grouped[r.carrier_code] = { total: 0, count: 0, records: [] };
      }
      grouped[r.carrier_code].total += krwRate;
      grouped[r.carrier_code].count++;
      grouped[r.carrier_code].records.push(r);
    });

    const result = Object.entries(grouped).map(([code, data]) => ({
      code,
      name: AIRLINE_CODES[code] || code,
      avgRate: data.total / data.count,
      count: data.count,
      records: data.records,
    }));

    return result.sort((a, b) =>
      sortBy === 'desc' ? b.avgRate - a.avgRate : a.avgRate - b.avgRate
    );
  }, [validRecords, sortBy]);

  // 최대값 (차트 스케일용)
  const maxRate = useMemo(() => {
    return Math.max(...carrierData.map(d => d.avgRate), 1);
  }, [carrierData]);

  // 상위 10개만 표시
  const displayData = carrierData.slice(0, 10);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">항공사별 비교</h3>
            <p className="text-xs text-slate-500">kg당 요금 기준 (KRW 환산)</p>
          </div>
        </div>

        <div className="flex gap-2">
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
          <button
            onClick={() => setSortBy(sortBy === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            title={sortBy === 'desc' ? '높은순' : '낮은순'}
          >
            <svg className={`w-4 h-4 text-slate-600 transition-transform ${sortBy === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 차트 */}
      {displayData.length > 0 ? (
        <div className="space-y-2">
          {displayData.map((item, index) => {
            const percentage = (item.avgRate / maxRate) * 100;
            const isTop3 = index < 3 && sortBy === 'desc';
            const isBottom3 = index < 3 && sortBy === 'asc';

            return (
              <div key={item.code} className="group">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-6 text-xs font-bold ${
                    isTop3 ? 'text-red-500' : isBottom3 ? 'text-green-500' : 'text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="w-8 font-bold text-slate-900 text-sm">{item.code}</span>
                  <span className="text-xs text-slate-400 truncate flex-1">{item.name}</span>
                  <span className="text-xs font-medium text-slate-600">
                    ₩{item.avgRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/kg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6"></div>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        chartType === 'FS' ? 'bg-blue-500' : 'bg-green-500'
                      } ${isTop3 ? 'opacity-100' : 'opacity-70'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm">
          비교할 데이터가 없습니다
        </div>
      )}

      {/* 통계 요약 */}
      {carrierData.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] text-slate-400">최저</p>
            <p className="text-sm font-bold text-green-600">
              {carrierData[carrierData.length - 1]?.code}
            </p>
            <p className="text-[10px] text-slate-500">
              ₩{carrierData[carrierData.length - 1]?.avgRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">평균</p>
            <p className="text-sm font-bold text-slate-600">
              ₩{(carrierData.reduce((s, c) => s + c.avgRate, 0) / carrierData.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-slate-500">
              {carrierData.length}개 항공사
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">최고</p>
            <p className="text-sm font-bold text-red-600">
              {carrierData[0]?.code}
            </p>
            <p className="text-[10px] text-slate-500">
              ₩{carrierData[0]?.avgRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FSSCCompareChart;
