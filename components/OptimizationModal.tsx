import React, { useState, useEffect } from 'react';
import { ContainerSpec, CargoItem, PackedItem } from '../types';

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  icon: string;
  result: PackedItem[] | null;
  itemCount: number;
  maxHeight: number;
  containerCount: number;
  wastedSpace: number; // 공간 낭비 (㎥)
}

interface OptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: PackedItem[]) => void;
  onPreview: (items: PackedItem[]) => void;
  container: ContainerSpec;
  cargoList: CargoItem[];
  packingMode: 'bottom-first' | 'inner-first';
  noStandUp?: boolean;
  noStack?: boolean;
  setNoStandUp?: (value: boolean) => void;
  setNoStack?: (value: boolean) => void;
}

const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onPreview,
  container,
  cargoList,
  packingMode,
  noStandUp = false,
  noStack = false,
  setNoStandUp,
  setNoStack
}) => {
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  // 모든 회전 방향 가져오기
  const getAllOrientations = (dims: { width: number, height: number, length: number }, keepHeight = false) => {
    const { width: w, height: h, length: l } = dims;
    if (keepHeight) {
      return [
        { width: w, height: h, length: l },
        { width: l, height: h, length: w },
      ];
    }
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
    mode: 'bottom-first' | 'inner-first',
    onlyFloor = false
  ) => {
    // XZ 후보점 수집
    const xzPoints: { x: number, z: number }[] = [{ x: 0, z: 0 }];

    if (mode === 'inner-first') {
      const startZ = Math.max(0, container.length - dims.length);
      xzPoints.push({ x: 0, z: startZ });
      xzPoints.push({ x: container.width - dims.width, z: startZ });
    } else {
      xzPoints.push({ x: container.width - dims.width, z: 0 });
    }

    for (const item of existingItems) {
      // 아이템 주변 모든 경계점
      xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z });
      xzPoints.push({ x: item.position.x - dims.width, z: item.position.z });
      xzPoints.push({ x: item.position.x, z: item.position.z + item.dimensions.length });
      xzPoints.push({ x: item.position.x, z: item.position.z - dims.length });
      xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z + item.dimensions.length });
      xzPoints.push({ x: item.position.x - dims.width, z: item.position.z + item.dimensions.length });
      xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z - dims.length });
      xzPoints.push({ x: item.position.x, z: item.position.z });
    }

    // Y 높이 레벨 수집 (바닥 + 각 아이템 상단)
    const yLevels = new Set<number>([0]);
    if (!onlyFloor) {
      for (const item of existingItems) {
        yLevels.add(item.position.y + item.dimensions.height);
      }
    }

    let bestPosition = null;
    let bestScore = Infinity;

    // 각 Y 레벨에서 모든 XZ 후보점 시도
    for (const baseY of yLevels) {
      for (const { x, z } of xzPoints) {
        if (x < 0 || z < 0 || x + dims.width > container.width || z + dims.length > container.length) {
          continue;
        }

        // 이 XZ 위치에서 실제로 놓일 Y 계산
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

        // 2단 적재 금지 시 바닥(y=0)에만 배치 가능
        if (onlyFloor && maxY > 0) {
          continue;
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
    }

    return bestPosition;
  };

  // 특정 컨테이너의 아이템만 필터링
  const getContainerItems = (items: PackedItem[], containerIndex: number) => {
    return items.filter(item => (item.containerIndex ?? 0) === containerIndex);
  };

  // 전략별 배치 실행 (다중 컨테이너 지원 + 같은 그룹 회전 통일)
  const runStrategy = (
    sortedCargo: CargoItem[],
    strategyName: string
  ): { items: PackedItem[], maxHeight: number, containerCount: number, wastedSpace: number } => {
    const arrangedItems: PackedItem[] = [];

    for (const cargo of sortedCargo) {
      for (let i = 0; i < cargo.quantity; i++) {
        // 같은 그룹의 이미 배치된 아이템 찾기 (회전 방향 통일)
        const sameGroupItem = arrangedItems.find(p => p.id === cargo.id);
        const preferredOrientation = sameGroupItem ? sameGroupItem.dimensions : null;

        const allOrientations = getAllOrientations(cargo.dimensions, noStandUp);
        const orientations = preferredOrientation
          ? [
              preferredOrientation,
              ...allOrientations.filter(o =>
                o.width !== preferredOrientation.width ||
                o.height !== preferredOrientation.height ||
                o.length !== preferredOrientation.length
              )
            ]
          : allOrientations;

        let placed = false;
        const maxContainers = 10;

        // 0번 컨테이너부터 순서대로 빈 공간 찾기
        for (let tryContainerIndex = 0; tryContainerIndex < maxContainers && !placed; tryContainerIndex++) {
          const containerItems = getContainerItems(arrangedItems, tryContainerIndex);
          let bestPosition = null;
          let bestOrientation = cargo.dimensions;
          let bestScore = Infinity;

          for (const orientation of orientations) {
            const position = findBestPosition(containerItems, orientation, packingMode, noStack);

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
              position: bestPosition,
              containerIndex: tryContainerIndex
            });
            placed = true;
          }
        }
      }
    }

    // 사용된 컨테이너 수
    const usedContainers = arrangedItems.length > 0
      ? Math.max(...arrangedItems.map(item => (item.containerIndex ?? 0))) + 1
      : 1;

    // 마지막 컨테이너의 낭비 계산 - 컨테이너 전체 용량 기준 (㎥)
    const lastContainerIdx = usedContainers - 1;
    const lastContainerItems = arrangedItems.filter(i => (i.containerIndex ?? 0) === lastContainerIdx);
    const lastUsedVol = lastContainerItems.reduce((acc, i) =>
      acc + i.dimensions.width * i.dimensions.height * i.dimensions.length, 0);
    const singleContainerVolume = container.width * container.height * container.length;
    // 컨테이너 전체 용량 - 사용 용량 = 낭비 (화물 추가할수록 낭비 감소)
    const wastedSpace = (singleContainerVolume - lastUsedVol) / 1000000;

    const maxHeight = arrangedItems.reduce((max, item) =>
      Math.max(max, item.position.y + item.dimensions.height), 0);

    return { items: arrangedItems, maxHeight, containerCount: usedContainers, wastedSpace };
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

      // 3. 작은 화물 우선 (낮은 것부터 - 층 쌓기)
      const heightSorted = [...cargoList].sort((a, b) => a.dimensions.height - b.dimensions.height);
      const heightResult = runStrategy(heightSorted, 'height');

      // 4. 회전 금지 (원래 방향 유지)
      const noRotateResult = (() => {
        const sorted = [...cargoList].sort((a, b) => {
          const volA = a.dimensions.width * a.dimensions.height * a.dimensions.length;
          const volB = b.dimensions.width * b.dimensions.height * b.dimensions.length;
          return volB - volA;
        });
        const arrangedItems: PackedItem[] = [];
        const maxContainers = 10;

        for (const cargo of sorted) {
          for (let i = 0; i < cargo.quantity; i++) {
            // 회전 없이 원래 dimensions만 사용
            const ori = cargo.dimensions;
            let placed = false;

            for (let tryContainer = 0; tryContainer < maxContainers && !placed; tryContainer++) {
              const containerItems = getContainerItems(arrangedItems, tryContainer);
              const pos = findBestPosition(containerItems, ori, packingMode, noStack);

              if (pos) {
                arrangedItems.push({
                  ...cargo,
                  uniqueId: `${cargo.id}-${i}-norotate`,
                  dimensions: ori,
                  position: pos,
                  containerIndex: tryContainer
                });
                placed = true;
              }
            }
          }
        }

        const usedContainers = arrangedItems.length > 0 ? Math.max(...arrangedItems.map(i => (i.containerIndex ?? 0))) + 1 : 1;
        // 마지막 컨테이너의 낭비 계산 - 컨테이너 전체 용량 기준
        const lastIdx = usedContainers - 1;
        const lastItems = arrangedItems.filter(i => (i.containerIndex ?? 0) === lastIdx);
        const singleContainerVol = container.width * container.height * container.length;
        const lastUsedVol = lastItems.reduce((acc, i) => acc + i.dimensions.width * i.dimensions.height * i.dimensions.length, 0);
        const maxH = arrangedItems.length > 0 ? Math.max(...arrangedItems.map(i => i.position.y + i.dimensions.height)) : 0;
        return { items: arrangedItems, maxHeight: maxH, containerCount: usedContainers, wastedSpace: (singleContainerVol - lastUsedVol) / 1000000 };
      })();

      // 커스텀 전략용 헬퍼 함수 (같은 그룹 회전 통일 + 0번 컨테이너부터 탐색)
      const runCustomStrategy = (
        sortedCargo: CargoItem[],
        strategyName: string,
        scoreFunc: (pos: { x: number, y: number, z: number }, ori: { width: number, height: number, length: number }, containerItems: PackedItem[]) => number
      ) => {
        const arrangedItems: PackedItem[] = [];
        const maxContainers = 10;

        for (const cargo of sortedCargo) {
          for (let i = 0; i < cargo.quantity; i++) {
            // 같은 그룹 회전 통일
            const sameGroupItem = arrangedItems.find(p => p.id === cargo.id);
            const preferredOri = sameGroupItem ? sameGroupItem.dimensions : null;
            const allOris = getAllOrientations(cargo.dimensions, noStandUp);
            const orientations = preferredOri
              ? [preferredOri, ...allOris.filter(o => o.width !== preferredOri.width || o.height !== preferredOri.height || o.length !== preferredOri.length)]
              : allOris;

            let placed = false;
            for (let tryContainer = 0; tryContainer < maxContainers && !placed; tryContainer++) {
              const containerItems = getContainerItems(arrangedItems, tryContainer);
              let bestPos = null;
              let bestOri = cargo.dimensions;
              let bestScore = Infinity;

              for (const ori of orientations) {
                const pos = findBestPosition(containerItems, ori, packingMode, noStack);
                if (pos) {
                  const score = scoreFunc(pos, ori, containerItems);
                  if (score < bestScore) { bestScore = score; bestPos = pos; bestOri = ori; }
                }
              }

              if (bestPos) {
                arrangedItems.push({ ...cargo, uniqueId: `${cargo.id}-${i}-${strategyName}`, dimensions: bestOri, position: bestPos, containerIndex: tryContainer });
                placed = true;
              }
            }
          }
        }

        const usedContainers = arrangedItems.length > 0 ? Math.max(...arrangedItems.map(i => (i.containerIndex ?? 0))) + 1 : 1;
        // 마지막 컨테이너의 낭비 계산 - 컨테이너 전체 용량 기준
        const lastIdx = usedContainers - 1;
        const lastItems = arrangedItems.filter(i => (i.containerIndex ?? 0) === lastIdx);
        const singleContainerVol = container.width * container.height * container.length;
        const lastUsedVol = lastItems.reduce((acc, i) => acc + i.dimensions.width * i.dimensions.height * i.dimensions.length, 0);
        const maxH = arrangedItems.length > 0 ? Math.max(...arrangedItems.map(i => i.position.y + i.dimensions.height)) : 0;
        return { items: arrangedItems, maxHeight: maxH, containerCount: usedContainers, wastedSpace: (singleContainerVol - lastUsedVol) / 1000000 };
      };

      // 5. 혼합 전략
      const mixedSorted = [...cargoList].sort((a, b) => {
        const volA = a.dimensions.width * a.dimensions.height * a.dimensions.length;
        const volB = b.dimensions.width * b.dimensions.height * b.dimensions.length;
        return volB - volA;
      });
      const mixedResult = runCustomStrategy(mixedSorted, 'mixed', (pos, ori) => pos.y * 1000000 + pos.z * 1000 + pos.x);

      // 6. 벽면 우선
      const wallSorted = [...cargoList].sort((a, b) => {
        const volA = a.dimensions.width * a.dimensions.height * a.dimensions.length;
        const volB = b.dimensions.width * b.dimensions.height * b.dimensions.length;
        return volB - volA;
      });
      const wallResult = runCustomStrategy(wallSorted, 'wall', (pos) => (pos.x + pos.z) * 1000 + pos.y);

      // 7. 높이 최소화
      const lowSorted = [...cargoList].sort((a, b) => {
        const areaA = a.dimensions.width * a.dimensions.length;
        const areaB = b.dimensions.width * b.dimensions.length;
        return areaB - areaA;
      });
      const lowResult = runCustomStrategy(lowSorted, 'low', (pos, ori) => (pos.y + ori.height) * 1000000 + pos.z * 1000 + pos.x);

      const newStrategies: OptimizationStrategy[] = [
        {
          id: 'volume',
          name: '부피 우선',
          description: '큰 화물부터 배치',
          icon: '📦',
          result: volumeResult.items,
          itemCount: volumeResult.items.length,
          maxHeight: volumeResult.maxHeight,
          containerCount: volumeResult.containerCount,
          wastedSpace: volumeResult.wastedSpace
        },
        {
          id: 'weight',
          name: '무게 우선',
          description: '무거운 것 먼저',
          icon: '⚖️',
          result: weightResult.items,
          itemCount: weightResult.items.length,
          maxHeight: weightResult.maxHeight,
          containerCount: weightResult.containerCount,
          wastedSpace: weightResult.wastedSpace
        },
        {
          id: 'height',
          name: '작은 화물 우선',
          description: '낮은 것부터 층 쌓기',
          icon: '📊',
          result: heightResult.items,
          itemCount: heightResult.items.length,
          maxHeight: heightResult.maxHeight,
          containerCount: heightResult.containerCount,
          wastedSpace: heightResult.wastedSpace
        },
        {
          id: 'norotate',
          name: '회전 금지',
          description: '원래 방향 유지',
          icon: '🔒',
          result: noRotateResult.items,
          itemCount: noRotateResult.items.length,
          maxHeight: noRotateResult.maxHeight,
          containerCount: noRotateResult.containerCount,
          wastedSpace: noRotateResult.wastedSpace
        },
        {
          id: 'mixed',
          name: '혼합 전략',
          description: '큰것+작은것 빈틈채우기',
          icon: '🧩',
          result: mixedResult.items,
          itemCount: mixedResult.items.length,
          maxHeight: mixedResult.maxHeight,
          containerCount: mixedResult.containerCount,
          wastedSpace: mixedResult.wastedSpace
        },
        {
          id: 'wall',
          name: '벽면 우선',
          description: '벽에 붙여서 배치',
          icon: '🧱',
          result: wallResult.items,
          itemCount: wallResult.items.length,
          maxHeight: wallResult.maxHeight,
          containerCount: wallResult.containerCount,
          wastedSpace: wallResult.wastedSpace
        },
        {
          id: 'low',
          name: '높이 최소화',
          description: '최대한 낮게 쌓기',
          icon: '📉',
          result: lowResult.items,
          itemCount: lowResult.items.length,
          maxHeight: lowResult.maxHeight,
          containerCount: lowResult.containerCount,
          wastedSpace: lowResult.wastedSpace
        }
      ];

      // 정렬: 배치 개수 많은 순 → 컨테이너 수 적은 순 → 공간 낭비 적은 순 → 선호 전략 순
      const preferredOrder = ['norotate', 'low', 'volume'];
      newStrategies.sort((a, b) => {
        // 1순위: 배치 개수 (많을수록 좋음)
        if (a.itemCount !== b.itemCount) return b.itemCount - a.itemCount;
        // 2순위: 컨테이너 수 (적을수록 좋음)
        if (a.containerCount !== b.containerCount) return a.containerCount - b.containerCount;
        // 3순위: 공간 낭비 (적을수록 좋음)
        if (Math.abs(a.wastedSpace - b.wastedSpace) > 0.1) return a.wastedSpace - b.wastedSpace;
        // 4순위: 선호 전략 순서
        const aIdx = preferredOrder.indexOf(a.id);
        const bIdx = preferredOrder.indexOf(b.id);
        const aPriority = aIdx >= 0 ? aIdx : 100;
        const bPriority = bIdx >= 0 ? bIdx : 100;
        return aPriority - bPriority;
      });

      setStrategies(newStrategies);
      // 초기에는 선택하지 않음 - 사용자가 직접 선택해야 미리보기 적용
      setSelectedStrategy(null);

      setIsCalculating(false);
    }, 500);
  }, [isOpen, cargoList, container, packingMode, noStandUp, noStack]);

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
      <div className="fixed right-0 top-0 h-full w-[26rem] z-50 bg-white shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">AI 자동 최적화</h2>
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

        {/* 옵션 토글 */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setNoStandUp?.(!noStandUp)}
            className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              noStandUp
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            눕히기 금지
          </button>
          <button
            type="button"
            onClick={() => setNoStack?.(!noStack)}
            className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              noStack
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            2단 적재 금지
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {isCalculating ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-3 text-slate-600 text-sm font-medium">AI가 최적의 공간을 계산 중입니다.</p>
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

                    {/* Stats - 컨테이너 수 + 공간 낭비 */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-lg font-bold text-blue-600">
                          {strategy.containerCount}대
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {strategy.itemCount}/{totalItems}개
                      </p>
                      <p className="text-[10px] text-slate-500">
                        낭비: <span className={strategy.wastedSpace < 5 ? 'text-green-600' : strategy.wastedSpace < 15 ? 'text-amber-600' : 'text-red-500'}>
                          {strategy.wastedSpace.toFixed(1)}㎥
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* 배치 완료 바 */}
                  <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        strategy.itemCount === totalItems ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${(strategy.itemCount / totalItems) * 100}%` }}
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

      {/* 배경 오버레이 제거 - 3D 조작 가능하도록 */}
    </>
  );
};

export default OptimizationModal;
