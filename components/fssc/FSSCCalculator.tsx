import React, { useState, useMemo, useEffect } from 'react';
import { FSSCRecord, AIRLINE_CODES } from '../../types/fssc';
import { db } from '../../lib/supabase';

interface FSSCCalculatorProps {
  records: FSSCRecord[];
  onRefresh?: () => void;
}

const FSSCCalculator: React.FC<FSSCCalculatorProps> = ({ records: initialRecords, onRefresh }) => {
  const [selectedCarriers, setSelectedCarriers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [referenceDate, setReferenceDate] = useState(() => new Date().toISOString().split('T')[0]); // 날짜 선택용
  const [appliedDate, setAppliedDate] = useState(() => new Date().toISOString().split('T')[0]); // 실제 필터링용
  const [isFetching, setIsFetching] = useState(false);
  const [localRecords, setLocalRecords] = useState<FSSCRecord[]>(initialRecords);

  // 부모 records가 변경되면 로컬에도 반영
  useEffect(() => {
    setLocalRecords(initialRecords);
  }, [initialRecords]);

  // 적용된 기준일 기준으로 유효한 레코드만 필터링
  const validRecords = useMemo(() => {
    return localRecords.filter(r => r.start_date <= appliedDate && r.end_date >= appliedDate);
  }, [localRecords, appliedDate]);

  // 조회 버튼 클릭 시 동기화 및 적용
  const handleSearch = async () => {
    if (isFetching) return;

    const targetDate = referenceDate;
    setAppliedDate(targetDate);
    setIsFetching(true);

    try {
      // 외부 데이터 동기화
      await db.fssc.fetchFromExternal(targetDate);
      // DB에서 직접 데이터 가져오기
      const { data } = await db.fssc.getAll();
      if (data) {
        setLocalRecords(data);
      }
      onRefresh?.(); // 부모도 갱신
    } catch (e) {
      // 조용히 실패
    } finally {
      setIsFetching(false);
    }
  };

  // 선택된 항공사의 레코드 (검색 필터 + 최신순 정렬)
  const selectedRecords = useMemo(() => {
    if (selectedCarriers.size === 0) return [];
    const query = searchQuery.toLowerCase().trim();
    return validRecords
      .filter(r => {
        if (!selectedCarriers.has(r.carrier_code)) return false;
        if (!query) return true;
        const name = AIRLINE_CODES[r.carrier_code] || '';
        return r.carrier_code.toLowerCase().includes(query) || name.toLowerCase().includes(query);
      })
      .sort((a, b) => b.start_date.localeCompare(a.start_date));
  }, [validRecords, selectedCarriers, searchQuery]);

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const year = parseInt(dateStr.split('-')[0]);
    if (year >= 2050) return '기한없음';
    const [y, m, d] = dateStr.split('-');
    return `${y.slice(-2)}.${m}.${d}`;
  };

  // 고유 항공사 목록 (전체 레코드에서 추출, A-Z 정렬)
  const uniqueCarriers = useMemo(() => {
    const carriers = new Set(localRecords.map(r => r.carrier_code));
    return Array.from(carriers).sort();
  }, [localRecords]);

  // 검색 필터링된 항공사
  const filteredCarriers = useMemo(() => {
    if (!searchQuery.trim()) return uniqueCarriers;
    const query = searchQuery.toLowerCase();
    return uniqueCarriers.filter(code => {
      const name = AIRLINE_CODES[code] || '';
      return code.toLowerCase().includes(query) || name.toLowerCase().includes(query);
    });
  }, [uniqueCarriers, searchQuery]);

  // 항공사 선택 토글
  const toggleCarrier = (code: string) => {
    setSelectedCarriers(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">FSC/SCC 조회</h3>
            <p className="text-xs text-slate-500">항공사별 유류할증료 및 보안료</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">기준일</label>
            <input
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isFetching}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isFetching ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                조회 중...
              </>
            ) : (
              '조회'
            )}
          </button>
        </div>
      </div>

      {/* 검색 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="항공사 코드 또는 이름 검색..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {selectedCarriers.size > 0 && (
          <span className="text-xs text-blue-600 font-medium whitespace-nowrap">{selectedCarriers.size}개 선택</span>
        )}
      </div>

      {/* 항공사 선택 - 카드 그리드 */}
      <div className="mb-4 max-h-[160px] overflow-y-auto border border-slate-200 rounded-lg p-2">
        {isFetching ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">데이터 동기화 중...</p>
          </div>
        ) : uniqueCarriers.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-sm">
            {appliedDate} 기준 데이터가 없습니다
          </div>
        ) : filteredCarriers.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1">
            {filteredCarriers.map(code => {
              const isSelected = selectedCarriers.has(code);
              const name = AIRLINE_CODES[code] || '';
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleCarrier(code)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold">{code}</span>
                  <span className={`text-[9px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                    {name}
                  </span>
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-3 text-slate-400 text-sm">
            '{searchQuery}' 검색 결과가 없습니다
          </div>
        )}
      </div>

      {/* 결과 테이블 */}
      {selectedRecords.length > 0 ? (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-1 py-2 text-center font-semibold text-slate-700">유형</th>
                  <th className="px-1 py-2 text-center font-semibold text-slate-700">항공사</th>
                  <th className="px-1 py-2 text-center font-semibold text-slate-700 hidden sm:table-cell">통화</th>
                  <th className="px-1 py-2 text-center font-semibold text-slate-700 hidden md:table-cell">최소</th>
                  <th className="px-1 py-2 text-center font-semibold text-slate-700">초과</th>
                  <th className="px-2 py-2 text-center font-semibold text-slate-700 hidden sm:table-cell w-[270px]">적용구간</th>
                  <th className="px-1 py-2 text-center font-semibold text-slate-700">시작일</th>
                  <th className="px-1 py-2 text-center font-semibold text-slate-700">종료일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedRecords.map((record) => {
                  const isNoExpiry = parseInt(record.end_date.split('-')[0]) >= 2050;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-1 py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          record.type === 'FS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-1 py-2 text-center">
                        <span className="font-medium">{record.carrier_code}</span>
                        <span className="text-slate-400 text-[10px] block">
                          {record.carrier_name || AIRLINE_CODES[record.carrier_code] || ''}
                        </span>
                      </td>
                      <td className="px-1 py-2 text-center text-slate-500 hidden sm:table-cell">{record.currency}</td>
                      <td className="px-1 py-2 text-center text-slate-600 hidden md:table-cell">
                        {record.min_charge?.toLocaleString() || '-'}
                      </td>
                      <td className="px-1 py-2 text-center text-slate-900 font-medium">
                        {record.over_charge?.toLocaleString() || '-'}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-600 hidden sm:table-cell w-[270px] truncate" title={record.route}>
                        {record.route}
                      </td>
                      <td className="px-1 py-2 text-center text-slate-600">{formatDate(record.start_date)}</td>
                      <td className="px-1 py-2 text-center text-slate-600">
                        {isNoExpiry ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-600">기한없음</span>
                        ) : formatDate(record.end_date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 text-sm">
          <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          위에서 항공사를 선택하면 FSC/SCC 정보가 표시됩니다
        </div>
      )}
    </div>
  );
};

export default FSSCCalculator;
