import React, { useState } from 'react';

interface IncotermsProps {
  leftSideAdSlot?: React.ReactNode;
  rightSideAdSlot?: React.ReactNode;
}

interface IncoTerm {
  code: string;
  name: string;
  fullName: string;
  category: 'any' | 'sea';
  description: string;
  // 비용/위험 부담 주체 (true = 매도인, false = 매수인)
  exportPacking: boolean;      // 수출포장
  exportCustoms: boolean;      // 수출통관
  originLoading: boolean;      // 상차비
  originFreight: boolean;      // 내륙운송(출발지)
  exportTerminal: boolean;     // 수출터미널비
  loading: boolean;            // 선적비
  mainFreight: boolean;        // 해상/항공운임
  insurance: boolean | 'optional'; // 보험
  unloading: boolean;          // 양하비
  importTerminal: boolean;     // 수입터미널비
  destFreight: boolean;        // 내륙운송(도착지)
  destUnloading: boolean;      // 하차비
  importCustoms: boolean;      // 수입통관
  importDuties: boolean;       // 관세
  riskTransferPoint: string;   // 위험 이전 시점
}

const INCOTERMS_2020: IncoTerm[] = [
  {
    code: 'EXW',
    name: 'Ex Works',
    fullName: '공장인도',
    category: 'any',
    description: '매도인이 자신의 영업장소에서 물품을 매수인에게 인도. 매도인의 의무가 가장 적은 조건.',
    exportPacking: true,
    exportCustoms: false,
    originLoading: false,
    originFreight: false,
    exportTerminal: false,
    loading: false,
    mainFreight: false,
    insurance: 'optional',
    unloading: false,
    importTerminal: false,
    destFreight: false,
    destUnloading: false,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '공장/창고',
  },
  {
    code: 'FCA',
    name: 'Free Carrier',
    fullName: '운송인인도',
    category: 'any',
    description: '매도인이 지정된 장소에서 매수인이 지정한 운송인에게 수출통관된 물품을 인도.',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: false,
    loading: false,
    mainFreight: false,
    insurance: 'optional',
    unloading: false,
    importTerminal: false,
    destFreight: false,
    destUnloading: false,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '지정장소',
  },
  {
    code: 'CPT',
    name: 'Carriage Paid To',
    fullName: '운송비지급인도',
    category: 'any',
    description: '매도인이 지정 목적지까지의 운송비를 지급하지만, 위험은 최초 운송인에게 인도 시 이전.',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: true,
    loading: true,
    mainFreight: true,
    insurance: 'optional',
    unloading: false,
    importTerminal: false,
    destFreight: false,
    destUnloading: false,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '최초운송인',
  },
  {
    code: 'CIP',
    name: 'Carriage and Insurance Paid To',
    fullName: '운송비·보험료지급인도',
    category: 'any',
    description: 'CPT와 동일하나, 매도인이 운송 중 물품에 대한 보험도 부보해야 함 (ICC A조건).',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: true,
    loading: true,
    mainFreight: true,
    insurance: true,
    unloading: false,
    importTerminal: false,
    destFreight: false,
    destUnloading: false,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '최초운송인',
  },
  {
    code: 'DAP',
    name: 'Delivered at Place',
    fullName: '도착장소인도',
    category: 'any',
    description: '매도인이 지정 목적지에서 양하 준비된 상태로 물품을 인도. 수입통관은 매수인 책임.',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: true,
    loading: true,
    mainFreight: true,
    insurance: 'optional',
    unloading: true,
    importTerminal: true,
    destFreight: true,
    destUnloading: false,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '목적지',
  },
  {
    code: 'DPU',
    name: 'Delivered at Place Unloaded',
    fullName: '도착지양하인도',
    category: 'any',
    description: '매도인이 지정 목적지에서 양하까지 완료하여 물품을 인도. 유일하게 양하 의무가 있는 조건.',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: true,
    loading: true,
    mainFreight: true,
    insurance: 'optional',
    unloading: true,
    importTerminal: true,
    destFreight: true,
    destUnloading: true,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '목적지(양하)',
  },
  {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    fullName: '관세지급인도',
    category: 'any',
    description: '매도인이 목적지까지 모든 비용과 위험을 부담. 수입통관과 관세도 매도인 책임. 매도인 의무 최대.',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: true,
    loading: true,
    mainFreight: true,
    insurance: 'optional',
    unloading: true,
    importTerminal: true,
    destFreight: true,
    destUnloading: true,
    importCustoms: true,
    importDuties: true,
    riskTransferPoint: '목적지',
  },
  {
    code: 'FAS',
    name: 'Free Alongside Ship',
    fullName: '선측인도',
    category: 'sea',
    description: '매도인이 지정 선적항에서 본선 선측에 물품을 인도.',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: true,
    loading: false,
    mainFreight: false,
    insurance: 'optional',
    unloading: false,
    importTerminal: false,
    destFreight: false,
    destUnloading: false,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '본선 선측',
  },
  {
    code: 'FOB',
    name: 'Free On Board',
    fullName: '본선인도',
    category: 'sea',
    description: '매도인이 지정 선적항에서 본선에 물품을 적재하여 인도.',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: true,
    loading: true,
    mainFreight: false,
    insurance: 'optional',
    unloading: false,
    importTerminal: false,
    destFreight: false,
    destUnloading: false,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '본선 적재',
  },
  {
    code: 'CFR',
    name: 'Cost and Freight',
    fullName: '운임포함인도',
    category: 'sea',
    description: '매도인이 목적항까지 운임을 지급하지만, 위험은 선적항에서 본선 적재 시 이전.',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: true,
    loading: true,
    mainFreight: true,
    insurance: 'optional',
    unloading: false,
    importTerminal: false,
    destFreight: false,
    destUnloading: false,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '본선 적재',
  },
  {
    code: 'CIF',
    name: 'Cost, Insurance and Freight',
    fullName: '운임·보험료포함인도',
    category: 'sea',
    description: 'CFR과 동일하나, 매도인이 해상 보험도 부보해야 함 (ICC C조건).',
    exportPacking: true,
    exportCustoms: true,
    originLoading: true,
    originFreight: true,
    exportTerminal: true,
    loading: true,
    mainFreight: true,
    insurance: true,
    unloading: false,
    importTerminal: false,
    destFreight: false,
    destUnloading: false,
    importCustoms: false,
    importDuties: false,
    riskTransferPoint: '본선 적재',
  },
];

const COST_ITEMS = [
  { key: 'exportPacking', label: '수출포장', short: '포장' },
  { key: 'exportCustoms', label: '수출통관', short: '수출' },
  { key: 'originLoading', label: '상차비', short: '상차' },
  { key: 'originFreight', label: '내륙운송(출발)', short: '내륙' },
  { key: 'exportTerminal', label: '터미널(출발)', short: '터미널' },
  { key: 'loading', label: '선적비', short: '선적' },
  { key: 'mainFreight', label: '해상/항공운임', short: '운임' },
  { key: 'insurance', label: '적하보험', short: '보험' },
  { key: 'unloading', label: '양하비', short: '양하' },
  { key: 'importTerminal', label: '터미널(도착)', short: '터미널' },
  { key: 'destFreight', label: '내륙운송(도착)', short: '내륙' },
  { key: 'destUnloading', label: '하차비', short: '하차' },
  { key: 'importCustoms', label: '수입통관', short: '수입' },
  { key: 'importDuties', label: '관세', short: '관세' },
] as const;

// 모바일용 간소화된 비용 항목 (주요 단계만)
const COST_ITEMS_MOBILE = [
  { key: 'exportCustoms', label: '수출통관', short: '수출' },
  { key: 'loading', label: '선적비', short: '선적' },
  { key: 'mainFreight', label: '운임', short: '운임' },
  { key: 'insurance', label: '보험', short: '보험' },
  { key: 'unloading', label: '양하비', short: '양하' },
  { key: 'importCustoms', label: '수입통관', short: '수입' },
  { key: 'importDuties', label: '관세', short: '관세' },
] as const;

const Incoterms: React.FC<IncotermsProps> = ({
  leftSideAdSlot,
  rightSideAdSlot,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<IncoTerm | null>(null);
  const [filter, setFilter] = useState<'all' | 'any' | 'sea'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredTerms = INCOTERMS_2020.filter(term =>
    filter === 'all' ? true : term.category === filter
  );

  const getCategoryColor = (category: 'any' | 'sea') => {
    return category === 'any'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-blue-100 text-blue-700';
  };

  const getCategoryLabel = (category: 'any' | 'sea') => {
    return category === 'any' ? '복합' : '해상';
  };

  const getCellStyle = (value: boolean | 'optional') => {
    if (value === true) return 'bg-emerald-500';
    if (value === false) return 'bg-orange-400';
    return 'bg-slate-300';
  };

  const getCellText = (value: boolean | 'optional') => {
    if (value === true) return 'S';
    if (value === false) return 'B';
    return '-';
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">인코텀즈 2020</h1>
                <p className="text-slate-400 text-xs">국제상업회의소(ICC) 무역거래조건 (10년마다 개정)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="inline-flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  표
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  카드
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="inline-flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilter('any')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filter === 'any'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  복합운송
                </button>
                <button
                  onClick={() => setFilter('sea')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filter === 'sea'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  해상전용
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Side Rails */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Side Rail Ad - Desktop Only */}
          {leftSideAdSlot && (
            <div className="hidden xl:block w-[160px] shrink-0">
              <div className="sticky top-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {leftSideAdSlot}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Legend - 데스크톱만 */}
        <div className="hidden md:flex mb-4 flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-emerald-500 text-white font-bold text-[11px]">S</span>
            <span className="text-slate-600">매도인(Seller) 부담</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-orange-400 text-white font-bold text-[11px]">B</span>
            <span className="text-slate-600">매수인(Buyer) 부담</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-300 text-white font-bold text-[11px]">-</span>
            <span className="text-slate-600">선택/협의</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">복합</span>
            <span className="text-slate-500">모든 운송수단</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">해상</span>
            <span className="text-slate-500">해상/내수로 전용</span>
          </div>
        </div>

        {/* Legend - 모바일용 간소화 */}
        <div className="md:hidden mb-3 flex items-center justify-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded flex items-center justify-center bg-emerald-500 text-white font-bold text-[9px]">S</span>
            <span className="text-slate-600">매도인</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded flex items-center justify-center bg-orange-400 text-white font-bold text-[9px]">B</span>
            <span className="text-slate-600">매수인</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded flex items-center justify-center bg-slate-300 text-white font-bold text-[9px]">-</span>
            <span className="text-slate-600">선택</span>
          </div>
        </div>

        {viewMode === 'table' ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="sticky left-0 bg-slate-50 px-3 py-2.5 text-center font-bold text-slate-700 min-w-[100px] z-20 border-r border-slate-200">조건</th>
                      <th className="sticky left-[100px] bg-slate-50 px-3 py-2.5 text-center font-bold text-slate-700 min-w-[120px] z-10 border-r border-slate-200">명칭</th>
                      {COST_ITEMS.map((item) => (
                        <th key={item.key} className="px-1 py-2.5 text-center font-medium text-slate-600 min-w-[42px]">
                          <span className="text-[11px] leading-tight">{item.short}</span>
                        </th>
                      ))}
                      <th className="px-2 py-2.5 text-center font-bold text-slate-700 min-w-[80px] border-l border-slate-200">위험이전</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTerms.map((term, idx) => (
                      <tr
                        key={term.code}
                        onClick={() => setSelectedTerm(term)}
                        className={`border-b border-slate-100 cursor-pointer transition-colors ${
                          selectedTerm?.code === term.code
                            ? 'bg-indigo-50'
                            : idx % 2 === 0
                            ? 'bg-white hover:bg-slate-50'
                            : 'bg-slate-50/50 hover:bg-slate-100/50'
                        }`}
                      >
                        <td className={`sticky left-0 px-3 py-2 z-20 border-r border-slate-200 ${
                          selectedTerm?.code === term.code
                            ? 'bg-indigo-50'
                            : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50/50'
                        }`}>
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-black text-slate-800 text-sm">{term.code}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getCategoryColor(term.category)}`}>
                              {getCategoryLabel(term.category)}
                            </span>
                          </div>
                        </td>
                        <td className={`sticky left-[100px] px-3 py-2 z-10 border-r border-slate-200 text-center ${
                          selectedTerm?.code === term.code
                            ? 'bg-indigo-50'
                            : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50/50'
                        }`}>
                          <span className="text-xs text-slate-700 font-medium">{term.fullName}</span>
                        </td>
                        {COST_ITEMS.map((item) => {
                          const value = term[item.key as keyof IncoTerm] as boolean | 'optional';
                          return (
                            <td key={item.key} className="px-1 py-2 text-center">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-white font-bold text-[11px] ${getCellStyle(value)}`}>
                                {getCellText(value)}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 text-center border-l border-slate-200">
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {term.riskTransferPoint}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Table View - 간소화 버전 */}
            <div className="md:hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-2 py-2 text-center font-bold text-slate-700 w-[60px] border-r border-slate-200">조건</th>
                    {COST_ITEMS_MOBILE.map((item) => (
                      <th key={item.key} className="px-0.5 py-2 text-center font-medium text-slate-600">
                        <span className="text-[10px]">{item.short}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTerms.map((term, idx) => (
                    <tr
                      key={term.code}
                      onClick={() => setSelectedTerm(term)}
                      className={`border-b border-slate-100 cursor-pointer active:bg-indigo-50 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-2 py-1.5 border-r border-slate-200">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-black text-slate-800 text-xs">{term.code}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${term.category === 'any' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                        </div>
                      </td>
                      {COST_ITEMS_MOBILE.map((item) => {
                        const value = term[item.key as keyof IncoTerm] as boolean | 'optional';
                        return (
                          <td key={item.key} className="px-0.5 py-1.5 text-center">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-white font-bold text-[10px] ${getCellStyle(value)}`}>
                              {getCellText(value)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 복합운송</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 해상전용</span>
                <span>탭하여 상세보기</span>
              </div>
            </div>
          </>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTerms.map((term) => (
              <div
                key={term.code}
                onClick={() => setSelectedTerm(term)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTerm?.code === term.code
                    ? 'border-indigo-300 ring-2 ring-indigo-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-black text-slate-800">{term.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(term.category)}`}>
                    {getCategoryLabel(term.category)}
                  </span>
                  {term.insurance === true && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                      보험필수
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-2">{term.name} · {term.fullName}</p>

                {/* Mini cost bar */}
                <div className="flex gap-0.5 mb-3">
                  {COST_ITEMS.map((item) => {
                    const value = term[item.key as keyof IncoTerm] as boolean | 'optional';
                    return (
                      <div
                        key={item.key}
                        className={`flex-1 h-2 rounded-sm ${getCellStyle(value)}`}
                        title={item.label}
                      />
                    );
                  })}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{term.description}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">위험이전</span>
                  <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {term.riskTransferPoint}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Term Detail Modal */}
        {selectedTerm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTerm(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="px-6 py-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-white drop-shadow-sm">{selectedTerm.code}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white">
                      {getCategoryLabel(selectedTerm.category)}
                    </span>
                    {selectedTerm.insurance === true && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/90 text-amber-900">
                        보험필수
                      </span>
                    )}
                  </div>
                  <p className="text-blue-200 text-sm mt-2">{selectedTerm.name}</p>
                  <p className="text-white font-semibold text-lg mt-0.5">{selectedTerm.fullName}</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[75vh]">
                {/* Description */}
                <p className="text-sm text-slate-700 leading-relaxed mb-6">{selectedTerm.description}</p>

                {/* Cost Responsibility Visual */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">비용 부담 구분</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {COST_ITEMS.map((item) => {
                      const value = selectedTerm[item.key as keyof IncoTerm] as boolean | 'optional';
                      return (
                        <div key={item.key} className="text-center">
                          <div className={`h-8 rounded flex items-center justify-center text-white font-bold text-xs ${getCellStyle(value)}`}>
                            {getCellText(value)}
                          </div>
                          <p className="text-[9px] text-slate-500 mt-1 leading-tight">{item.short}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Risk & Cost Transfer */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">위험 이전 시점</h4>
                    <p className="text-sm font-medium text-red-800">{selectedTerm.riskTransferPoint}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">운송 유형</h4>
                    <p className="text-sm font-medium text-blue-800">
                      {selectedTerm.category === 'any' ? '모든 운송수단 (복합운송)' : '해상/내수로 전용'}
                    </p>
                  </div>
                </div>

                {/* Seller vs Buyer Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/50">
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">S</span>
                      매도인 부담
                    </h4>
                    <ul className="space-y-1">
                      {COST_ITEMS.filter(item => selectedTerm[item.key as keyof IncoTerm] === true).map(item => (
                        <li key={item.key} className="text-xs text-emerald-700 flex items-center gap-1">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
                    <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-orange-400 text-white text-[10px] flex items-center justify-center font-bold">B</span>
                      매수인 부담
                    </h4>
                    <ul className="space-y-1">
                      {COST_ITEMS.filter(item => selectedTerm[item.key as keyof IncoTerm] === false).map(item => (
                        <li key={item.key} className="text-xs text-orange-700 flex items-center gap-1">
                          <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Insurance Notice */}
                {selectedTerm.insurance === true && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-amber-800">보험 부보 의무</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {selectedTerm.code === 'CIP'
                            ? 'ICC(A) 약관 기준 최소 계약 금액의 110% 부보 (최대담보)'
                            : 'ICC(C) 약관 기준 최소 계약 금액의 110% 부보 (최소담보)'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

            {/* Info Section */}
            <div className="mt-6 bg-slate-50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-2">인코텀즈(Incoterms)란?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                인코텀즈(Incoterms)는 국제상업회의소(ICC)가 제정한 국제무역거래조건의 해석에 관한 국제규칙입니다.
                매도인과 매수인 간의 물품 인도, 위험 이전, 비용 분담에 관한 의무를 명확히 규정하여 국제거래에서 발생할 수 있는
                오해와 분쟁을 예방합니다. 현재 사용되는 인코텀즈 2020은 2020년 1월 1일부터 시행되었습니다.
              </p>
            </div>
          </div>

          {/* Right Side Rail Ad - Desktop Only */}
          {rightSideAdSlot && (
            <div className="hidden xl:block w-[160px] shrink-0">
              <div className="sticky top-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {rightSideAdSlot}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Incoterms;
