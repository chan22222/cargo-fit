import React, { useState, useEffect } from 'react';
import { ContainerSpec, CargoItem, PackedItem } from '../types';

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  icon: string;
  result: PackedItem[] | null;
  efficiency: number;
  itemCount: number;
  maxHeight: number;
}

interface OptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: PackedItem[]) => void;
  onPreview: (items: PackedItem[]) => void;
  container: ContainerSpec;
  cargoList: CargoItem[];
  packingMode: 'bottom-first' | 'inner-first';
}

const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onPreview,
  container,
  cargoList,
  packingMode
}) => {
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // 모든 회전 방향 가져오기
  const getAllOrientations = (dims: { width: number, height: number, length: number }) => {
    const { width: w, height: h, length: l } = dims;
    return [
      { width: w, height: h, length: l },
      { width: l, height: h, length: w },
      { width: w, height: l, length: h },
      { width: h, height: l, length: w },
      { width: l, height: w, length: h },
      { width: h, height: w, length: l },
    ];
  };

  // 지지율 계산
  const calculateSupportRatio = (
    pos: { x: number, y: number, z: number },
    dims: { width: number, height: number, length: number },
    existingItems: PackedItem[]
  ): number => {
    const itemArea = dims.width * dims.length;
    if (pos.y <= 0) return 1.0;

    const itemLeft = pos.x;
    const itemRight = pos.x + dims.width;
    const itemFront = pos.z;
    const itemBack = pos.z + dims.length;

    let supportedArea = 0;

    for (const item of existingItems) {
      const itemTop = item.position.y + item.dimensions.height;
      if (Math.abs(itemTop - pos.y) < 1) {
        const overlapLeft = Math.max(itemLeft, item.position.x);
        const overlapRight = Math.min(itemRight, item.position.x + item.dimensions.width);
        const overlapFront = Math.max(itemFront, item.position.z);
        const overlapBack = Math.min(itemBack, item.position.z + item.dimensions.length);

        if (overlapRight > overlapLeft && overlapBack > overlapFront) {
          supportedArea += (overlapRight - overlapLeft) * (overlapBack - overlapFront);
        }
      }
    }

    return supportedArea / itemArea;
  };

  // 위치 찾기 함수
  const findBestPosition = (
    existingItems: PackedItem[],
    dims: { width: number, height: number, length: number },
    mode: 'bottom-first' | 'inner-first'
  ) => {
    const candidatePoints: { x: number, y: number, z: number }[] = [];

    // 초기 후보점 추가 - 바닥 레벨에서 여러 시작점
    if (mode === 'inner-first') {
      // 안쪽(뒤)에서 시작하는 점들
      const startZ = Math.max(0, container.length - dims.length);
      candidatePoints.push({ x: 0, y: 0, z: startZ });
      candidatePoints.push({ x: container.width - dims.width, y: 0, z: startZ });
    } else {
      // 바닥 앞에서 시작
      candidatePoints.push({ x: 0, y: 0, z: 0 });
      candidatePoints.push({ x: container.width - dims.width, y: 0, z: 0 });
    }

    // 기존 아이템들 기반 후보점 추가 (빈틈 채우기 포함)
    for (const item of existingItems) {
      const itemTop = item.position.y + item.dimensions.height;

      // 오른쪽으로 확장
      candidatePoints.push({ x: item.position.x + item.dimensions.width, y: item.position.y, z: item.position.z });
      // 왼쪽 빈틈 채우기
      candidatePoints.push({ x: item.position.x - dims.width, y: item.position.y, z: item.position.z });

      // 앞쪽으로 확장
      candidatePoints.push({ x: item.position.x, y: item.position.y, z: item.position.z + item.dimensions.length });
      // 뒤쪽 빈틈 채우기
      candidatePoints.push({ x: item.position.x, y: item.position.y, z: item.position.z - dims.length });

      // 대각선들
      candidatePoints.push({ x: item.position.x + item.dimensions.width, y: item.position.y, z: item.position.z + item.dimensions.length });
      candidatePoints.push({ x: item.position.x - dims.width, y: item.position.y, z: item.position.z + item.dimensions.length });
      candidatePoints.push({ x: item.position.x + item.dimensions.width, y: item.position.y, z: item.position.z - dims.length });

      // 위로 쌓기
      candidatePoints.push({ x: item.position.x, y: itemTop, z: item.position.z });
    }

    let bestPosition = null;
    let bestScore = Infinity;

    for (const { x, y: baseY, z } of candidatePoints) {
      if (x < 0 || z < 0 || x + dims.width > container.width || z + dims.length > container.length) {
        continue;
      }

      let maxY = baseY;
      for (const item of existingItems) {
        if (x < item.position.x + item.dimensions.width &&
            x + dims.width > item.position.x &&
            z < item.position.z + item.dimensions.length &&
            z + dims.length > item.position.z) {
          const itemTop = item.position.y + item.dimensions.height;
          maxY = Math.max(maxY, itemTop);
        }
      }

      if (maxY + dims.height <= container.height) {
        const pos = { x, y: maxY, z };
        const supportRatio = calculateSupportRatio(pos, dims, existingItems);
        if (supportRatio >= 1.0) {
          const score = mode === 'inner-first'
            ? (container.length - z - dims.length) * 1000000 + maxY * 1000 + x
            : maxY * 1000000 + z * 1000 + x;

          if (score < bestScore) {
            bestScore = score;
            bestPosition = pos;
          }
        }
      }
    }

    return bestPosition;
  };

  // 전략별 배치 실행
  const runStrategy = (
    sortedCargo: CargoItem[],
    strategyName: string
  ): { items: PackedItem[], efficiency: number, maxHeight: number } => {
    const arrangedItems: PackedItem[] = [];

    for (const cargo of sortedCargo) {
      for (let i = 0; i < cargo.quantity; i++) {
        const orientations = getAllOrientations(cargo.dimensions);
        let bestPosition = null;
        let bestOrientation = cargo.dimensions;
        let bestScore = Infinity;

        for (const orientation of orientations) {
          const position = findBestPosition(arrangedItems, orientation, packingMode);

          if (position) {
            const score = packingMode === 'inner-first'
              ? (container.length - position.z - orientation.length) * 1000000 + position.y * 1000 + position.x
              : position.y * 1000000 + position.z * 1000 + position.x;

            if (score < bestScore) {
              bestScore = score;
              bestPosition = position;
              bestOrientation = orientation;
            }
          }
        }

        if (bestPosition) {
          arrangedItems.push({
            ...cargo,
            uniqueId: `${cargo.id}-${i}-${Date.now()}-${strategyName}`,
            dimensions: bestOrientation,
            weight: cargo.weight,
            position: bestPosition
          });
        }
      }
    }

    const totalVolume = container.width * container.height * container.length;
    const usedVolume = arrangedItems.reduce((acc, i) =>
      acc + (i.dimensions.width * i.dimensions.height * i.dimensions.length), 0);
    const efficiency = totalVolume > 0 ? (usedVolume / totalVolume) * 100 : 0;

    const maxHeight = arrangedItems.reduce((max, item) =>
      Math.max(max, item.position.y + item.dimensions.height), 0);

    return { items: arrangedItems, efficiency, maxHeight };
  };

  // 전략 계산
  useEffect(() => {
    if (!isOpen || cargoList.length === 0) return;

    setIsCalculating(true);
    setSelectedStrategy(null);

    // 비동기로 전략 계산
    setTimeout(() => {
      // 1. 부피 우선 (큰 것부터)
      const volumeSorted = [...cargoList].sort((a, b) => {
        const volA = a.dimensions.width * a.dimensions.height * a.dimensions.length;
        const volB = b.dimensions.width * b.dimensions.height * b.dimensions.length;
        return volB - volA;
      });
      const volumeResult = runStrategy(volumeSorted, 'volume');

      // 2. 무게 우선 (무거운 것부터 - 안정성)
      const weightSorted = [...cargoList].sort((a, b) => (b.weight || 0) - (a.weight || 0));
      const weightResult = runStrategy(weightSorted, 'weight');

      // 3. 높이 우선 (낮은 것부터 - 층 쌓기)
      const heightSorted = [...cargoList].sort((a, b) => a.dimensions.height - b.dimensions.height);
      const heightResult = runStrategy(heightSorted, 'height');

      // 4. 바닥면적 우선 (넓은 것부터 - 기반 우선)
      const areaSorted = [...cargoList].sort((a, b) => {
        const areaA = a.dimensions.width * a.dimensions.length;
        const areaB = b.dimensions.width * b.dimensions.length;
        return areaB - areaA;
      });
      const areaResult = runStrategy(areaSorted, 'area');

      // 5. 밀집 우선 (작은 것부터 - 틈새 채우기)
      const compactSorted = [...cargoList].sort((a, b) => {
        const volA = a.dimensions.width * a.dimensions.height * a.dimensions.length;
        const volB = b.dimensions.width * b.dimensions.height * b.dimensions.length;
        return volA - volB;
      });
      const compactResult = runStrategy(compactSorted, 'compact');

      // 6. 층별 정렬 (같은 높이끼리 그룹핑 - 깔끔한 층 형성)
      const layerSorted = [...cargoList].sort((a, b) => {
        // 높이가 같으면 바닥면적 큰 순
        if (a.dimensions.height === b.dimensions.height) {
          const areaA = a.dimensions.width * a.dimensions.length;
          const areaB = b.dimensions.width * b.dimensions.length;
          return areaB - areaA;
        }
        // 높이가 낮은 것부터 (층을 균일하게)
        return a.dimensions.height - b.dimensions.height;
      });
      const layerResult = runStrategy(layerSorted, 'layer');

      // 7. 상단 평탄화 (큰 것 먼저 + 높이 비슷한 것끼리)
      const flatTopSorted = [...cargoList].sort((a, b) => {
        // 먼저 높이로 그룹화 (10cm 단위)
        const heightGroupA = Math.floor(a.dimensions.height / 10);
        const heightGroupB = Math.floor(b.dimensions.height / 10);
        if (heightGroupA !== heightGroupB) {
          return heightGroupA - heightGroupB;
        }
        // 같은 높이 그룹 내에서는 바닥면적 큰 순
        const areaA = a.dimensions.width * a.dimensions.length;
        const areaB = b.dimensions.width * b.dimensions.length;
        return areaB - areaA;
      });
      const flatTopResult = runStrategy(flatTopSorted, 'flatTop');

      // 8. 균형 배치 (높이 + 면적 조합 점수)
      const balancedSorted = [...cargoList].sort((a, b) => {
        // 바닥면적 대비 높이 비율이 낮은 것 우선 (안정적인 형태)
        const ratioA = a.dimensions.height / Math.sqrt(a.dimensions.width * a.dimensions.length);
        const ratioB = b.dimensions.height / Math.sqrt(b.dimensions.width * b.dimensions.length);
        return ratioA - ratioB;
      });
      const balancedResult = runStrategy(balancedSorted, 'balanced');

      const newStrategies: OptimizationStrategy[] = [
        {
          id: 'volume',
          name: '부피 우선',
          description: '큰 화물부터 배치',
          icon: '📦',
          result: volumeResult.items,
          efficiency: volumeResult.efficiency,
          itemCount: volumeResult.items.length,
          maxHeight: volumeResult.maxHeight
        },
        {
          id: 'weight',
          name: '무게 우선',
          description: '무거운 것 먼저',
          icon: '⚖️',
          result: weightResult.items,
          efficiency: weightResult.efficiency,
          itemCount: weightResult.items.length,
          maxHeight: weightResult.maxHeight
        },
        {
          id: 'height',
          name: '높이 우선',
          description: '낮은 것부터 층 쌓기',
          icon: '📊',
          result: heightResult.items,
          efficiency: heightResult.efficiency,
          itemCount: heightResult.items.length,
          maxHeight: heightResult.maxHeight
        },
        {
          id: 'area',
          name: '면적 우선',
          description: '넓은 것부터 기반',
          icon: '🏗️',
          result: areaResult.items,
          efficiency: areaResult.efficiency,
          itemCount: areaResult.items.length,
          maxHeight: areaResult.maxHeight
        },
        {
          id: 'compact',
          name: '밀집 우선',
          description: '작은 것부터 틈새',
          icon: '🧩',
          result: compactResult.items,
          efficiency: compactResult.efficiency,
          itemCount: compactResult.items.length,
          maxHeight: compactResult.maxHeight
        },
        {
          id: 'layer',
          name: '층별 정렬',
          description: '같은 높이끼리 층 형성',
          icon: '🗂️',
          result: layerResult.items,
          efficiency: layerResult.efficiency,
          itemCount: layerResult.items.length,
          maxHeight: layerResult.maxHeight
        },
        {
          id: 'flatTop',
          name: '상단 평탄화',
          description: '윗면을 평평하게',
          icon: '📐',
          result: flatTopResult.items,
          efficiency: flatTopResult.efficiency,
          itemCount: flatTopResult.items.length,
          maxHeight: flatTopResult.maxHeight
        },
        {
          id: 'balanced',
          name: '균형 배치',
          description: '안정적인 형태 우선',
          icon: '⚖️',
          result: balancedResult.items,
          efficiency: balancedResult.efficiency,
          itemCount: balancedResult.items.length,
          maxHeight: balancedResult.maxHeight
        }
      ];

      // 효율성 기준 정렬
      newStrategies.sort((a, b) => b.efficiency - a.efficiency);

      setStrategies(newStrategies);
      // 초기에는 선택하지 않음 - 사용자가 직접 선택해야 미리보기 적용
      setSelectedStrategy(null);

      setIsCalculating(false);
    }, 100);
  }, [isOpen, cargoList, container, packingMode]);

  // 전략 선택 시 미리보기 업데이트
  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy?.result) {
      onPreview(strategy.result);
    }
  };

  const handleApply = () => {
    const selected = strategies.find(s => s.id === selectedStrategy);
    if (selected?.result) {
      const finalItems = selected.result.map((item, idx) => ({
        ...item,
        uniqueId: `${item.id}-${idx}-${Date.now()}`
      }));
      onSelect(finalItems);
      // onClose를 호출하지 않음 - onSelect에서 모달을 닫음
    }
  };

  if (!isOpen) return null;

  const totalItems = cargoList.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <>
      {/* 사이드 패널 */}
      <div className="fixed right-0 top-0 h-full w-80 z-50 bg-white shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">최적화 전략</h2>
              <p className="text-blue-100 text-xs">
                {cargoList.length}종 / {totalItems}개
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {isCalculating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-3 text-slate-600 text-sm font-medium">계산 중...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {strategies.map((strategy, index) => (
                <div
                  key={strategy.id}
                  onClick={() => handleStrategySelect(strategy.id)}
                  className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedStrategy === strategy.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  {/* 추천 배지 */}
                  {index === 0 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                      추천
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="text-2xl">{strategy.icon}</div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-slate-800 text-sm">{strategy.name}</h3>
                        {selectedStrategy === strategy.id && (
                          <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{strategy.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right flex-shrink-0">
                      <span className={`text-lg font-bold ${
                        strategy.efficiency >= 50 ? 'text-green-600' :
                        strategy.efficiency >= 30 ? 'text-amber-600' : 'text-red-500'
                      }`}>
                        {strategy.efficiency.toFixed(1)}%
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {strategy.itemCount}/{totalItems}개
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        strategy.efficiency >= 50 ? 'bg-green-500' :
                        strategy.efficiency >= 30 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(strategy.efficiency, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-slate-50 px-4 py-3 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors text-sm border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              disabled={isCalculating || !selectedStrategy}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-blue-500/25"
            >
              적용
            </button>
          </div>
        </div>
      </div>

      {/* 배경 오버레이 (클릭 시 닫기) */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
    </>
  );
};

export default OptimizationModal;
