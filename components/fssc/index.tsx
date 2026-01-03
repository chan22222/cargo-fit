import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import { FSSCRecord } from '../../types/fssc';
import FSSCCalculator from './FSSCCalculator';
import FSSCCompareChart from './FSSCCompareChart';
import FSSCHistoryChart from './FSSCHistoryChart';

const FSSC: React.FC = () => {
  const [records, setRecords] = useState<FSSCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await db.fssc.getAll();
      if (fetchError) throw new Error(fetchError.message);
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">FSC/SCC 분석</h1>
              <p className="text-slate-400 text-xs">Fuel Surcharge & Security Charge</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 로딩 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          /* 분석 도구 - 1열 레이아웃 */
          <div className="space-y-4">
            <FSSCCalculator records={records} />
            <FSSCCompareChart records={records} />
            <FSSCHistoryChart records={records} />
          </div>
        )}

        {/* 안내 문구 */}
        <div className="mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-slate-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-slate-600">
              <p className="font-semibold mb-1">안내</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-xs">
                <li>FSC: Fuel Surcharge (유류할증료) - 유가 변동에 따른 추가 요금</li>
                <li>SCC: Security Surcharge (보안료) - 항공 보안 관련 추가 요금</li>
                <li>금액은 KRW 환산 기준이며, 실제 적용 금액은 항공사에 확인하시기 바랍니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FSSC;
