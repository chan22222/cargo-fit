import React, { useState, useEffect, useMemo } from 'react';
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
  container: ContainerSpec;
  cargoList: CargoItem[];
  packingMode: 'bottom-first' | 'inner-first';
}

const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  onClose,
  onSelect,
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
    const candidatePoints: { x: number, y: number, z: number }[] = [
      mode === 'inner-first'
        ? { x: 0, y: 0, z: container.length - dims.length }
        : { x: 0, y: 0, z: 0 }
    ];

    for (const item of existingItems) {
      const itemTop = item.position.y + item.dimensions.height;
      candidatePoints.push({ x: item.position.x + item.dimensions.width, y: item.position.y, z: item.position.z });
      candidatePoints.push({ x: item.position.x, y: item.position.y, z: item.position.z + item.dimensions.length });
      candidatePoints.push({ x: item.position.x + item.dimensions.width, y: item.position.y, z: item.position.z + item.dimensions.length });
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
      const totalItems = cargoList.reduce((sum, c) => sum + c.quantity, 0);

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

      const newStrategies: OptimizationStrategy[] = [
        {
          id: 'volume',
          name: '부피 우선',
          description: '큰 화물부터 배치하여 공간 활용 최대화',
          icon: '📦',
          result: volumeResult.items,
          efficiency: volumeResult.efficiency,
          itemCount: volumeResult.items.length,
          maxHeight: volumeResult.maxHeight
        },
        {
          id: 'weight',
          name: '무게 우선',
          description: '무거운 화물을 바닥에 배치하여 안정성 확보',
          icon: '⚖️',
          result: weightResult.items,
          efficiency: weightResult.efficiency,
          itemCount: weightResult.items.length,
          maxHeight: weightResult.maxHeight
        },
        {
          id: 'height',
          name: '높이 우선',
          description: '낮은 화물부터 배치하여 층 구조 최적화',
          icon: '📊',
          result: heightResult.items,
          efficiency: heightResult.efficiency,
          itemCount: heightResult.items.length,
          maxHeight: heightResult.maxHeight
        },
        {
          id: 'area',
          name: '바닥면적 우선',
          description: '넓은 화물부터 배치하여 안정적 기반 구축',
          icon: '🏗️',
          result: areaResult.items,
          efficiency: areaResult.efficiency,
          itemCount: areaResult.items.length,
          maxHeight: areaResult.maxHeight
        },
        {
          id: 'compact',
          name: '밀집 우선',
          description: '작은 화물부터 배치하여 틈새 공간 활용',
          icon: '🧩',
          result: compactResult.items,
          efficiency: compactResult.efficiency,
          itemCount: compactResult.items.length,
          maxHeight: compactResult.maxHeight
        }
      ];

      // 효율성 기준 정렬
      newStrategies.sort((a, b) => b.efficiency - a.efficiency);

      setStrategies(newStrategies);
      setSelectedStrategy(newStrategies[0]?.id || null);
      setIsCalculating(false);
    }, 100);
  }, [isOpen, cargoList, container, packingMode]);

  const handleApply = () => {
    const selected = strategies.find(s => s.id === selectedStrategy);
    if (selected?.result) {
      // uniqueId 재생성 (실제 적용 시)
      const finalItems = selected.result.map((item, idx) => ({
        ...item,
        uniqueId: `${item.id}-${idx}-${Date.now()}`
      }));
      onSelect(finalItems);
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalItems = cargoList.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">최적화 전략 선택</h2>
              <p className="text-blue-100 text-sm mt-1">
                {cargoList.length}종 / {totalItems}개 화물에 대한 최적 배치 전략
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isCalculating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-slate-600 font-medium">최적화 전략 계산 중...</p>
              <p className="text-slate-400 text-sm">5가지 전략을 비교 분석하고 있습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {strategies.map((strategy, index) => (
                <div
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedStrategy === strategy.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* 추천 배지 */}
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                      추천
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`text-3xl p-2 rounded-lg ${
                      selectedStrategy === strategy.id ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      {strategy.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{strategy.name}</h3>
                        {selectedStrategy === strategy.id && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{strategy.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className={`text-2xl font-bold ${
                          strategy.efficiency >= 50 ? 'text-green-600' :
                          strategy.efficiency >= 30 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {strategy.efficiency.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {strategy.itemCount}/{totalItems}개 배치
                      </p>
                      <p className="text-xs text-slate-400">
                        최대 높이: {strategy.maxHeight.toFixed(0)}cm
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        strategy.efficiency >= 50 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        strategy.efficiency >= 30 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                        'bg-gradient-to-r from-red-400 to-red-600'
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
        <div className="border-t bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {selectedStrategy && !isCalculating && (
              <span>
                선택된 전략: <strong className="text-slate-700">
                  {strategies.find(s => s.id === selectedStrategy)?.name}
                </strong>
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              disabled={isCalculating || !selectedStrategy}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
            >
              적용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;
