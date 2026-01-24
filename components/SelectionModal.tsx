import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'container' | 'pallet') => void;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedType, setSelectedType] = useState<'container' | 'pallet' | null>(null);
  const [hoveredType, setHoveredType] = useState<'container' | 'pallet' | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedType) {
      onSelect(selectedType);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="selection-modal-title">
      {/* Backdrop with animation */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-blue-900/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal with animation */}
      <div className="relative bg-white rounded-[32px] p-4 sm:p-6 lg:p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-6 sm:right-6 p-2 sm:p-2.5 bg-white hover:bg-gray-100 rounded-2xl transition-all duration-150 hover:scale-105 group z-10 shadow-md"
          aria-label="닫기"
        >
          <X className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600 group-hover:text-gray-800" />
        </button>

        {/* Header with gradient text */}
        <div className="text-center mb-8">
          <h2 id="selection-modal-title" className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-3">
            시뮬레이션 선택
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">최적의 화물 적재 방식을 선택하세요</p>
        </div>

        {/* Desktop Only Notice - Mobile Only */}
        {isMobile && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 mb-1">PC 환경 권장</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  시뮬레이션은 <span className="font-semibold">1000px 이상의 PC 환경</span>에서 최적화되어 있습니다.
                  모바일에서는 일부 기능이 제한될 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-8">
          {/* Container Option */}
          <div
            className={`relative rounded-3xl border-2 transition-all duration-150 transform ${
              isMobile
                ? 'cursor-not-allowed opacity-50 border-gray-200 bg-gray-50'
                : `cursor-pointer ${
                    selectedType === 'container'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-sky-50 scale-[1.02] shadow-lg shadow-blue-200/50'
                      : hoveredType === 'container'
                      ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 scale-[1.01] shadow-md'
                      : 'border-gray-200 bg-white hover:shadow-lg'
                  }`
            }`}
            onClick={() => !isMobile && setSelectedType('container')}
            onMouseEnter={() => !isMobile && setHoveredType('container')}
            onMouseLeave={() => !isMobile && setHoveredType(null)}
          >
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Container Illustration */}
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 flex items-center justify-center">
                  {/* Clean Container Icon */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* 3D Container Effect */}
                    <g transform="translate(15, 30)">
                      {/* Back face */}
                      <rect x="8" y="0" width="60" height="40" fill="#93c5fd" rx="1" />

                      {/* Top face */}
                      <path d="M 0 0 L 8 0 L 68 0 L 60 0 Z" fill="#dbeafe" />

                      {/* Right side */}
                      <path d="M 68 0 L 70 2 L 70 42 L 68 40 Z" fill="#60a5fa" />

                      {/* Front face - main container */}
                      <rect x="0" y="2" width="68" height="40" fill="#3b82f6" rx="1" />

                      {/* Container ridges/corrugation */}
                      <rect x="5" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="10" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="15" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="20" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="25" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="30" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="35" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="40" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="45" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="50" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="55" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />
                      <rect x="60" y="7" width="2" height="30" fill="#2563eb" opacity="0.5" />

                      {/* Door handles */}
                      <rect x="30" y="18" width="8" height="2" fill="#1e40af" />
                      <rect x="30" y="22" width="8" height="2" fill="#1e40af" />

                      {/* Bottom edge highlight */}
                      <rect x="0" y="40" width="68" height="2" fill="#1e40af" opacity="0.3" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">컨테이너 적재</h3>
                <p className="text-[10px] sm:text-sm text-gray-600 mb-2 sm:mb-4">
                  20ft, 40ft 컨테이너에 화물을 최적으로 배치합니다
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full">
                    수출입 화물
                  </span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full">
                    해상 운송
                  </span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full">
                    3D 최적화
                  </span>
                </div>
              </div>
            </div>
            {selectedType === 'container' && (
              <div className="absolute top-4 right-4 animate-scale-in">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Pallet Option */}
          <div
            className={`relative rounded-3xl border-2 transition-all duration-150 transform ${
              isMobile
                ? 'cursor-not-allowed opacity-50 border-gray-200 bg-gray-50'
                : `cursor-pointer ${
                    selectedType === 'pallet'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 scale-[1.02] shadow-lg shadow-green-200/50'
                      : hoveredType === 'pallet'
                      ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 scale-[1.01] shadow-md'
                      : 'border-gray-200 bg-white hover:shadow-lg'
                  }`
            }`}
            onClick={() => !isMobile && setSelectedType('pallet')}
            onMouseEnter={() => !isMobile && setHoveredType('pallet')}
            onMouseLeave={() => !isMobile && setHoveredType(null)}
          >
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Pallet Illustration */}
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 flex items-center justify-center">
                  {/* Clean Pallet Icon */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <g transform="translate(20, 25) scale(0.9)">
                      {/* Pallet Base - Wood Structure */}
                      {/* Top planks */}
                      <rect x="0" y="50" width="70" height="3" fill="#92400e" />
                      <rect x="0" y="54" width="70" height="3" fill="#78350f" />
                      <rect x="0" y="58" width="70" height="3" fill="#92400e" />

                      {/* Support blocks */}
                      <rect x="5" y="61" width="10" height="5" fill="#451a03" />
                      <rect x="30" y="61" width="10" height="5" fill="#451a03" />
                      <rect x="55" y="61" width="10" height="5" fill="#451a03" />

                      {/* 3D Box Stack */}
                      {/* Bottom layer - 3 boxes */}
                      <g>
                        {/* Box 1 */}
                        <rect x="2" y="36" width="20" height="14" fill="#10b981" />
                        <path d="M 2 36 L 4 34 L 24 34 L 22 36 Z" fill="#34d399" />
                        <path d="M 22 36 L 24 34 L 24 48 L 22 50 Z" fill="#059669" />

                        {/* Box 2 */}
                        <rect x="24" y="36" width="22" height="14" fill="#10b981" />
                        <path d="M 24 36 L 26 34 L 48 34 L 46 36 Z" fill="#34d399" />
                        <path d="M 46 36 L 48 34 L 48 48 L 46 50 Z" fill="#059669" />

                        {/* Box 3 */}
                        <rect x="48" y="36" width="20" height="14" fill="#10b981" />
                        <path d="M 48 36 L 50 34 L 70 34 L 68 36 Z" fill="#34d399" />
                        <path d="M 68 36 L 70 34 L 70 48 L 68 50 Z" fill="#059669" />
                      </g>

                      {/* Middle layer - 2 boxes */}
                      <g>
                        {/* Box 4 */}
                        <rect x="12" y="22" width="22" height="14" fill="#22c55e" />
                        <path d="M 12 22 L 14 20 L 36 20 L 34 22 Z" fill="#4ade80" />
                        <path d="M 34 22 L 36 20 L 36 34 L 34 36 Z" fill="#16a34a" />

                        {/* Box 5 */}
                        <rect x="36" y="22" width="22" height="14" fill="#22c55e" />
                        <path d="M 36 22 L 38 20 L 60 20 L 58 22 Z" fill="#4ade80" />
                        <path d="M 58 22 L 60 20 L 60 34 L 58 36 Z" fill="#16a34a" />
                      </g>

                      {/* Top layer - 1 box */}
                      <g>
                        <rect x="24" y="8" width="22" height="14" fill="#4ade80" />
                        <path d="M 24 8 L 26 6 L 48 6 L 46 8 Z" fill="#86efac" />
                        <path d="M 46 8 L 48 6 L 48 20 L 46 22 Z" fill="#22c55e" />

                        {/* Tape cross on top box */}
                        <line x1="24" y1="15" x2="46" y2="15" stroke="#16a34a" strokeWidth="0.5" opacity="0.3" />
                        <line x1="35" y1="8" x2="35" y2="22" stroke="#16a34a" strokeWidth="0.5" opacity="0.3" />
                      </g>
                    </g>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">팔레트 적재</h3>
                <p className="text-[10px] sm:text-sm text-gray-600 mb-2 sm:mb-4">
                  표준 팔레트에 박스를 효율적으로 적재합니다
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium rounded-full">
                    창고 관리
                  </span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium rounded-full">
                    육상 운송
                  </span>
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium rounded-full">
                    적재 패턴
                  </span>
                </div>
              </div>
            </div>
            {selectedType === 'pallet' && (
              <div className="absolute top-4 right-4 animate-scale-in">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons - PC only */}
        {!isMobile && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-50 rounded-2xl transition-all duration-150 hover:scale-[1.02] order-2 sm:order-1"
            >
              취소
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedType}
              className={`px-8 py-3.5 font-bold rounded-2xl transition-all duration-150 transform order-1 sm:order-2 ${
                selectedType
                  ? selectedType === 'container'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] shadow-lg shadow-blue-500/25'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-[1.02] shadow-lg shadow-green-500/25'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              시뮬레이션 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionModal;