
import React, { useState, useMemo, useCallback } from 'react';
import { ContainerType, CargoItem, PackedItem, ContainerSpec } from './types';
import { CONTAINER_SPECS } from './constants';
import { calculatePacking } from './services/packingService';
import ContainerVisualizer from './components/ContainerVisualizer';
import { CargoControls } from './components/CargoControls';
import LandingPage from './components/LandingPage';
import PalletSimulator from './components/PalletSimulator';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'container' | 'pallet'>('home');

  // Container Simulator State
  const [containerType, setContainerType] = useState<ContainerType>(ContainerType.FT20);
  const [cargoList, setCargoList] = useState<CargoItem[]>([]);
  const [packedItems, setPackedItems] = useState<PackedItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isArranging, setIsArranging] = useState<boolean>(false);
  const [globalPackingMode, setGlobalPackingMode] = useState<'bottom-first' | 'inner-first'>('bottom-first');

  // Pallet Simulator State
  const [palletItems, setPalletItems] = useState<any[]>([]);
  const [palletSize, setPalletSize] = useState({ width: 1100, height: 150, length: 1100 });

  // Stats calculation
  const stats = useMemo(() => {
    const currentContainer = CONTAINER_SPECS[containerType];
    const totalVolume = currentContainer.width * currentContainer.height * currentContainer.length;
    const usedVolume = packedItems.reduce((acc, i) => acc + (i.dimensions.width * i.dimensions.height * i.dimensions.length), 0);

    // 그룹별 아이템 개수 계산
    const groupCounts = new Set(packedItems.map(item => item.id));

    return {
      volumeEfficiency: totalVolume > 0 ? (usedVolume / totalVolume) * 100 : 0,
      count: packedItems.length,
      totalItems: packedItems.length,
      totalGroups: groupCounts.size
    };
  }, [packedItems, containerType]);

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

  // 위치에 배치 가능한지 체크
  const canPlaceAt = (
    pos: { x: number, y: number, z: number },
    dims: { width: number, height: number, length: number },
    items: PackedItem[]
  ): boolean => {
    // 컨테이너 경계 체크
    if (pos.x < 0 || pos.y < 0 || pos.z < 0) return false;
    if (pos.x + dims.width > CONTAINER_SPECS[containerType].width) return false;
    if (pos.y + dims.height > CONTAINER_SPECS[containerType].height) return false;
    if (pos.z + dims.length > CONTAINER_SPECS[containerType].length) return false;

    // 충돌 체크
    for (const item of items) {
      if (!(pos.x >= item.position.x + item.dimensions.width ||
            pos.x + dims.width <= item.position.x ||
            pos.y >= item.position.y + item.dimensions.height ||
            pos.y + dims.height <= item.position.y ||
            pos.z >= item.position.z + item.dimensions.length ||
            pos.z + dims.length <= item.position.z)) {
        return false;
      }
    }
    return true;
  };

  // 최적 위치 찾기 - 바닥부터 채우기 방식
  const findBestPositionBottomFirst = (
    container: ContainerSpec,
    existingItems: PackedItem[],
    dims: { width: number, height: number, length: number }
  ) => {
    let bestPosition = { x: 0, y: 0, z: 0 };
    let lowestY = Infinity;
    let found = false;

    // 25mm 단위로 더 정밀하게 스캔
    for (let x = 0; x <= container.width - dims.width; x += 25) {
      for (let z = 0; z <= container.length - dims.length; z += 25) {
        let maxY = 0; // 이 위치에서의 바닥 높이

        // XZ 평면에서 겹치는 아이템들 찾기
        for (const item of existingItems) {
          if (x < item.position.x + item.dimensions.width &&
              x + dims.width > item.position.x &&
              z < item.position.z + item.dimensions.length &&
              z + dims.length > item.position.z) {
            // 겹친다면 그 아이템 위가 바닥이 됨
            const itemTop = item.position.y + item.dimensions.height;
            maxY = Math.max(maxY, itemTop);
          }
        }

        // 이 위치가 컨테이너 높이를 초과하지 않는지 확인
        if (maxY + dims.height <= container.height) {
          // 가장 낮은 위치 선택
          if (maxY < lowestY) {
            lowestY = maxY;
            bestPosition = { x, y: maxY, z };
            found = true;
          }
        }
      }
    }

    return found ? bestPosition : null;
  };

  // 최적 위치 찾기 - 안쪽부터 채우기 방식 (모서리 우선)
  const findBestPositionInnerFirst = (
    container: ContainerSpec,
    existingItems: PackedItem[],
    dims: { width: number, height: number, length: number }
  ) => {
    let bestPosition = null;
    let bestScore = Infinity;

    // 안쪽부터, 아래부터, 왼쪽부터 채우기
    for (let z = container.length - dims.length; z >= 0; z -= 25) {
      for (let y = 0; y <= container.height - dims.height; y += 25) {
        for (let x = 0; x <= container.width - dims.width; x += 25) {
          const pos = { x, y, z };

          if (canPlaceAt(pos, dims, existingItems)) {
            // 점수 계산: 안쪽 모서리부터 채우기
            // 1. z축 (뒤쪽 우선) - 가장 중요
            // 2. y축 (아래쪽 우선) - 두 번째 중요
            // 3. x축 (왼쪽 우선) - 세 번째 중요
            const score = (container.length - z - dims.length) * 1000000 + // 뒤쪽 벽에 가까울수록 우선
                         y * 1000 + // 바닥에 가까울수록 우선
                         x; // 왼쪽 벽에 가까울수록 우선

            if (score < bestScore) {
              bestScore = score;
              bestPosition = pos;
            }
          }
        }
      }

      // 이미 위치를 찾았으면 더 이상 앞쪽을 검색하지 않음 (안쪽 우선)
      if (bestPosition && bestPosition.z === z) {
        break;
      }
    }

    return bestPosition;
  };

  const handleAddCargo = (newItem: Omit<CargoItem, 'id'> | CargoItem) => {
    const item: CargoItem = 'id' in newItem
      ? newItem  // 이미 id가 있으면 (편집 모드) 그대로 사용
      : {
          ...newItem,
          id: Math.random().toString(36).substr(2, 9),
        };

    // 편집 모드인 경우 기존 항목 먼저 제거
    if ('id' in newItem) {
      setCargoList(prev => prev.filter(c => c.id !== newItem.id));
      setPackedItems(prev => prev.filter(p => p.id !== newItem.id));
    }

    // 현재 globalPackingMode를 item에 추가
    item.packingMode = globalPackingMode;

    setCargoList(prev => [...prev, item]);
    setSelectedGroupId(item.id);
    const currentContainer = CONTAINER_SPECS[containerType];
    // 편집 모드인 경우 기존 아이템을 제외한 packedItems 사용
    let currentPackedItems = 'id' in newItem
      ? packedItems.filter(p => p.id !== newItem.id)
      : [...packedItems];

    // 복합 화물인 경우 특별 처리
    if (item.isCompound && item.items) {
      // 복합 화물을 하나의 단위로 배치
      for (let i = 0; i < item.quantity; i++) {
        // 회전을 고려한 최적 배치
        const orientations = getAllOrientations(item.dimensions);
        let bestPosition = null;
        let bestOrientation = item.dimensions;
        let lowestY = Infinity;

        for (const orientation of orientations) {
          const position = item.packingMode === 'inner-first'
            ? findBestPositionInnerFirst(currentContainer, currentPackedItems, orientation)
            : findBestPositionBottomFirst(currentContainer, currentPackedItems, orientation);

          if (position) {
            if (item.packingMode === 'inner-first') {
              // 안쪽부터는 첫 번째 유효한 위치 선택
              bestPosition = position;
              bestOrientation = orientation;
              break;
            } else if (position.y < lowestY) {
              // 바닥부터는 가장 낮은 위치 선택
              lowestY = position.y;
              bestPosition = position;
              bestOrientation = orientation;
            }
          }
        }

        if (bestPosition) {
          const newInstance: PackedItem = {
            ...item,
            uniqueId: `${item.id}-${i}-${Date.now()}`,
            dimensions: bestOrientation,
            weight: item.weight,
            position: bestPosition
          };
          currentPackedItems.push(newInstance);
        }
      }
    } else {
      // 일반 화물 처리 (회전 고려한 최적 배치)
      for (let i = 0; i < item.quantity; i++) {
        // 회전을 고려한 최적 배치
        const orientations = getAllOrientations(item.dimensions);
        let bestPosition = null;
        let bestOrientation = item.dimensions;
        let lowestY = Infinity;

        for (const orientation of orientations) {
          const position = item.packingMode === 'inner-first'
            ? findBestPositionInnerFirst(currentContainer, currentPackedItems, orientation)
            : findBestPositionBottomFirst(currentContainer, currentPackedItems, orientation);

          if (position) {
            if (item.packingMode === 'inner-first') {
              // 안쪽부터는 첫 번째 유효한 위치 선택
              bestPosition = position;
              bestOrientation = orientation;
              break;
            } else if (position.y < lowestY) {
              // 바닥부터는 가장 낮은 위치 선택
              lowestY = position.y;
              bestPosition = position;
              bestOrientation = orientation;
            }
          }
        }

        if (bestPosition) {
          const newInstance: PackedItem = {
            ...item,
            uniqueId: `${item.id}-${i}-${Date.now()}`,
            dimensions: bestOrientation,
            weight: item.weight,
            position: bestPosition
          };
          currentPackedItems.push(newInstance);
        } else {
          // 배치할 수 없으면 경고
          alert(`${item.name} ${i + 1}/${item.quantity}개를 배치할 공간이 없습니다.`);
          break;
        }
      }
    }

    setPackedItems(currentPackedItems);
  };

  const handleRemoveCargo = (id: string) => {
    setCargoList(prev => prev.filter(item => item.id !== id));
    setPackedItems(prev => prev.filter(item => item.id !== id));
    if (selectedGroupId === id) setSelectedGroupId(null);
  };

  const handleClearCargo = () => {
    setCargoList([]);
    setPackedItems([]);
    setSelectedGroupId(null);
  };

  const handleRotateCargo = (id: string) => {
    setCargoList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, dimensions: { ...item.dimensions, width: item.dimensions.length, length: item.dimensions.width } };
      }
      return item;
    }));
    setPackedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, dimensions: { ...item.dimensions, width: item.dimensions.length, length: item.dimensions.width } };
      }
      return item;
    }));
  };

  const handleItemMove = useCallback((uniqueId: string, newPosition: {x: number, y: number, z: number}) => {
    setPackedItems(prev => prev.map(item => 
      item.uniqueId === uniqueId ? { ...item, position: newPosition } : item
    ));
  }, []);

  const handleAutoArrange = async () => {
    const currentContainer = CONTAINER_SPECS[containerType];
    if (cargoList.length === 0) return;

    // 로딩 시작
    setIsArranging(true);

    // 0.5초 동안 처리 중 표시
    await new Promise(resolve => setTimeout(resolve, 500));

    // 부피가 큰 것부터 정렬
    const sortedCargo = [...cargoList].sort((a, b) => {
      const volA = a.dimensions.width * a.dimensions.height * a.dimensions.length;
      const volB = b.dimensions.width * b.dimensions.height * b.dimensions.length;
      return volB - volA;
    });

    const arrangedItems: PackedItem[] = [];

    for (const cargo of sortedCargo) {
      if (cargo.isCompound && cargo.items) {
        // 복합 화물 처리
        for (let i = 0; i < cargo.quantity; i++) {
          const orientations = getAllOrientations(cargo.dimensions);
          let bestPosition = null;
          let bestOrientation = cargo.dimensions;
          let bestScore = Infinity;

          for (const orientation of orientations) {
            // 전역 packing mode에 따라 적절한 함수 사용
            const position = globalPackingMode === 'inner-first'
              ? findBestPositionInnerFirst(currentContainer, arrangedItems, orientation)
              : findBestPositionBottomFirst(currentContainer, arrangedItems, orientation);

            if (position) {
              // 점수: Y 위치가 낮을수록, 중심에 가까울수록 좋음
              const score = position.y * 1000 +
                           Math.abs(position.x + orientation.width/2 - currentContainer.width/2) +
                           Math.abs(position.z + orientation.length/2 - currentContainer.length/2);

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
              uniqueId: `${cargo.id}-${i}-${Date.now()}`,
              dimensions: bestOrientation,
              weight: cargo.weight,
              position: bestPosition
            });
          }
        }
      } else {
        // 일반 화물 처리
        for (let i = 0; i < cargo.quantity; i++) {
          const orientations = getAllOrientations(cargo.dimensions);
          let bestPosition = null;
          let bestOrientation = cargo.dimensions;
          let bestScore = Infinity;

          for (const orientation of orientations) {
            // 전역 packing mode에 따라 적절한 함수 사용
            const position = globalPackingMode === 'inner-first'
              ? findBestPositionInnerFirst(currentContainer, arrangedItems, orientation)
              : findBestPositionBottomFirst(currentContainer, arrangedItems, orientation);

            if (position) {
              // inner-first일 때는 다른 점수 계산 사용
              const score = globalPackingMode === 'inner-first'
                ? (currentContainer.length - position.z - orientation.length) * 1000000 +
                  position.y * 1000 +
                  position.x
                : position.y * 1000 +
                  Math.abs(position.x + orientation.width/2 - currentContainer.width/2) +
                  Math.abs(position.z + orientation.length/2 - currentContainer.length/2);

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
              uniqueId: `${cargo.id}-${i}-${Date.now()}`,
              dimensions: bestOrientation,
              weight: cargo.weight,
              position: bestPosition
            });
          }
        }
      }
    }

    setPackedItems(arrangedItems);

    // 로딩 종료
    setIsArranging(false);
  };

  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id);
  };

  const currentContainer = CONTAINER_SPECS[containerType];

  return (
    <div className="h-screen w-screen bg-white flex flex-col font-sans overflow-hidden text-slate-900">
      {/* Premium Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex justify-between items-center shrink-0 z-50 h-[80px]">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center font-black text-white text-2xl shadow-md group-hover:shadow-lg transition-all duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">SHIPDA</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Container Loading Tool
            </p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
           <button
             onClick={() => setActiveTab('home')}
             className={`text-sm font-bold transition-all duration-300 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}
           >
             HOME
           </button>
           <button
             onClick={() => setActiveTab('container')}
             className={`text-sm font-bold transition-all duration-300 ${activeTab === 'container' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}
           >
             컨테이너
           </button>
           <button
             onClick={() => setActiveTab('pallet')}
             className={`text-sm font-bold transition-all duration-300 ${activeTab === 'pallet' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}
           >
             팔레트
           </button>
           <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
           <button className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10">
             KOREAN / KRW
           </button>
        </nav>
      </header>

      {/* Content Injection */}
      {activeTab === 'home' ? (
        <LandingPage onStart={() => setActiveTab('container')} />
      ) : activeTab === 'pallet' ? (
        <PalletSimulator
          palletItems={palletItems}
          setPalletItems={setPalletItems}
          palletSize={palletSize}
          setPalletSize={setPalletSize}
        />
      ) : (
        <main className="flex-1 p-6 mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden min-h-0 bg-slate-50/50">

          {/* Main Visualizer Area with Left Ad Space */}
          <div className="lg:col-span-3 flex h-full min-h-0 gap-4">
              {/* Left Vertical Ad Space */}
              <div className="hidden lg:flex w-40 bg-white border border-slate-200 rounded-2xl items-center justify-center text-[10px] text-slate-300 font-bold uppercase tracking-widest shrink-0 shadow-sm">
                Ad Space - Vertical
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col h-full min-h-0 gap-4">
              <div className="flex justify-between items-end px-2 shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" fill="white" opacity="0.9"/>
                      </svg>
                    </div>
                    <div className="space-y-1">
                       <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          Container Loading Simulator
                          <span className="px-2 py-0.5 text-[8px] bg-green-100 text-green-700 rounded-full font-bold">BETA</span>
                       </h2>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">3D Real-time Visualization</p>
                    </div>
                 </div>
                 <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto scrollbar-hide max-w-[60%]">
                  {(Object.keys(CONTAINER_SPECS) as ContainerType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setContainerType(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                        containerType === type 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulator Slot with Ad Space Below */}
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="relative flex-1 bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 min-h-0 group">
                  <ContainerVisualizer
                      container={currentContainer}
                      packedItems={packedItems}
                      onItemMove={handleItemMove}
                      selectedGroupId={selectedGroupId}
                      onSelectGroup={handleSelectGroup}
                      isArranging={isArranging}
                    />
                    
                    {/* Floating UI - Adjusted border-radius */}
                    <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-xl shadow-xl p-5 rounded-2xl border border-white flex flex-col gap-1 min-w-[180px]">
                          <span className="text-[9px] text-blue-500 uppercase font-black tracking-[0.2em] leading-none mb-1.5">Efficiency</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">
                              {stats.volumeEfficiency.toFixed(1)}
                            </span>
                            <span className="text-sm text-slate-300 font-black">%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${stats.volumeEfficiency > 90 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                              style={{ width: `${stats.volumeEfficiency}%` }}
                              />
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                            <p className="text-[10px] text-slate-500">
                              <span className="font-black text-slate-700">아이템:</span> {stats.totalItems}개
                            </p>
                            <p className="text-[10px] text-slate-500">
                              <span className="font-black text-slate-700">그룹:</span> {stats.totalGroups}개
                            </p>
                          </div>
                      </div>
                    </div>
                </div>

                {/* Simulator Horizontal Ad Space */}
                <div className="h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase tracking-widest shrink-0 shadow-sm">
                   Ad Space - Horizontal
                </div>
              </div>
              </div>
          </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-1 h-full min-h-0">
            <CargoControls
              onAddCargo={handleAddCargo}
              cargoList={cargoList}
              onRemoveCargo={handleRemoveCargo}
              onClear={handleClearCargo}
              onRotateCargo={handleRotateCargo}
              onAutoArrange={handleAutoArrange}
              selectedGroupId={selectedGroupId}
              onSelectGroup={handleSelectGroup}
              isArranging={isArranging}
              packingMode={globalPackingMode}
              onPackingModeChange={setGlobalPackingMode}
            />
          </div>

        </main>
      )}
    </div>
  );
};

export default App;
