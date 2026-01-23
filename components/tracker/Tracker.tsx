import React from 'react';
import { CategoryType } from './types';
import { ShipIcon, PlaneIcon, TruckIcon, MailIcon, TrainIcon, PackageIcon } from './icons';
import TrackerContainer, { containerCarriers } from './TrackerContainer';
import TrackerAir, { airCarriers } from './TrackerAir';
import TrackerCourier, { courierCarriers } from './TrackerCourier';
import TrackerPost, { postCarriers } from './TrackerPost';
import TrackerRail, { railCarriers } from './TrackerRail';

// 전체 운송사 수 계산
const totalCarriers = containerCarriers.length + airCarriers.length + courierCarriers.length + postCarriers.length + railCarriers.length;

const categories = [
  { id: 'container' as CategoryType, label: '컨테이너 선사', icon: ShipIcon, count: containerCarriers.length },
  { id: 'air' as CategoryType, label: '항공화물', icon: PlaneIcon, count: airCarriers.length },
  { id: 'courier' as CategoryType, label: '특송/택배', icon: TruckIcon, count: courierCarriers.length },
  { id: 'post' as CategoryType, label: '우편/EMS', icon: MailIcon, count: postCarriers.length },
  { id: 'rail' as CategoryType, label: '철도화물', icon: TrainIcon, count: railCarriers.length },
];

interface TrackerProps {
  // 현재 카테고리 (URL에서 전달받음)
  category?: CategoryType;
  // 카테고리 변경 시 URL 업데이트 함수
  onNavigate?: (category: CategoryType) => void;
  // 콘텐츠 상단 인피드 광고 (탭 전환해도 유지)
  contentAdSlot?: React.ReactNode;
  // 사이드 레일 광고 (좌/우)
  leftSideAdSlot?: React.ReactNode;
  rightSideAdSlot?: React.ReactNode;
  // 하단 멀티플렉스 광고
  bottomAdSlot?: React.ReactNode;
}

const Tracker: React.FC<TrackerProps> = ({
  category = 'container',
  onNavigate,
  contentAdSlot,
  leftSideAdSlot,
  rightSideAdSlot,
  bottomAdSlot,
}) => {
  const handleCategoryChange = (newCategory: CategoryType) => {
    if (onNavigate) {
      onNavigate(newCategory);
    }
  };

  const renderContent = () => {
    switch (category) {
      case 'container':
        return <TrackerContainer />;
      case 'air':
        return <TrackerAir />;
      case 'courier':
        return <TrackerCourier />;
      case 'post':
        return <TrackerPost />;
      case 'rail':
        return <TrackerRail />;
      default:
        return <TrackerContainer />;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <PackageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">화물 추적 포털</h1>
              <p className="text-slate-400 text-xs">전세계 {totalCarriers}개+ 운송사 추적 링크</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                    category === cat.id
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                    category === cat.id ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content with Side Rails */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Side Rail Ad - Desktop Only */}
          {leftSideAdSlot && (
            <div className="hidden lg:block w-[160px] shrink-0">
              <div className="sticky top-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {leftSideAdSlot}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Infeed Ad - 탭 전환해도 유지됨 */}
            {contentAdSlot && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {contentAdSlot}
              </div>
            )}

            {renderContent()}

            {/* Info Cards - Compact */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                <ShipIcon className="w-3 h-3 text-blue-500" />
                <span><b>컨테이너:</b> MAEU1234567</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                <ShipIcon className="w-3 h-3 text-emerald-500" />
                <span><b>B/L:</b> 선사별 형식</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                <PlaneIcon className="w-3 h-3 text-purple-500" />
                <span><b>AWB:</b> 180-12345678</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                <TruckIcon className="w-3 h-3 text-orange-500" />
                <span><b>운송장:</b> 10-20자리</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 text-center mt-4">
              각 운송사의 공식 웹사이트로 연결됩니다
            </p>

            {/* Bottom Multiplex Ad */}
            {bottomAdSlot && (
              <div className="mt-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {bottomAdSlot}
              </div>
            )}
          </div>

          {/* Right Side Rail Ad - Desktop Only */}
          {rightSideAdSlot && (
            <div className="hidden lg:block w-[160px] shrink-0">
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

export default Tracker;
