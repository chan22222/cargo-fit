import React, { useState, useMemo } from 'react';
import { Carrier } from './types';
import { SearchIcon, getCategoryIcon, getCategoryColor } from './icons';

interface CarrierGridProps {
  carriers: Carrier[];
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgClass: string;
  adSlot?: React.ReactNode; // AdSense 광고 슬롯
}

const CarrierGrid: React.FC<CarrierGridProps> = ({
  carriers,
  title,
  subtitle,
  icon,
  iconBgClass,
  adSlot,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMajorOnly, setShowMajorOnly] = useState(false);

  const filteredCarriers = useMemo(() => {
    return carriers.filter(carrier => {
      const matchesSearch =
        carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carrier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (carrier.region?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesMajor = !showMajorOnly || carrier.isMajor;
      return matchesSearch && matchesMajor;
    });
  }, [carriers, searchTerm, showMajorOnly]);

  const sortedCarriers = useMemo(() => {
    return [...filteredCarriers].sort((a, b) => {
      // 주요 항목 먼저
      if (a.isMajor && !b.isMajor) return -1;
      if (!a.isMajor && b.isMajor) return 1;
      // 그 다음 이름순
      return a.name.localeCompare(b.name);
    });
  }, [filteredCarriers]);

  const handleTrack = (carrier: Carrier) => {
    window.open(carrier.trackingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 ${iconBgClass} rounded-xl shadow-lg`}>
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <p className="text-slate-400 text-xs">{subtitle}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="운송사, 코드, 지역 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 pl-9 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Ad Slot */}
      {adSlot && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          {adSlot}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Results Count & Major Filter */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-500">
              {searchTerm && <span className="font-medium">"{searchTerm}" 검색 결과: </span>}
              <span className="font-bold text-slate-700">{sortedCarriers.length}개</span> 운송사
            </p>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showMajorOnly}
                onChange={(e) => setShowMajorOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500/20 cursor-pointer"
              />
              <span className="text-sm text-slate-600 font-medium">주요 항목만</span>
            </label>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
            >
              검색 초기화
            </button>
          )}
        </div>

        {/* Carrier Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
          {sortedCarriers.map((carrier, idx) => (
            <button
              key={`${carrier.code}-${idx}`}
              onClick={() => handleTrack(carrier)}
              className={`bg-white rounded border px-2 py-1.5 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left group flex items-center gap-1.5 ${
                carrier.isMajor ? 'border-indigo-200' : 'border-slate-200'
              }`}
            >
              <div className={`w-5 h-5 ${getCategoryColor(carrier.category)} rounded flex items-center justify-center text-white shrink-0`}>
                {getCategoryIcon(carrier.category)}
              </div>
              <span className={`text-xs truncate flex-1 ${
                carrier.isMajor ? 'font-bold text-slate-800' : 'text-slate-700'
              }`}>{carrier.name}</span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{carrier.code}</span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {sortedCarriers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <SearchIcon className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">검색 결과 없음</h3>
            <p className="text-sm text-slate-500 mb-3">"{searchTerm}"에 해당하는 운송사를 찾을 수 없습니다.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 transition-colors"
            >
              전체 목록 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarrierGrid;
