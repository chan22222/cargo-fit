import React, { useState, useRef, useEffect } from 'react';
import { Dimensions } from '../types';
import AdSense from './AdSense';

interface PalletItem {
  id: string;
  name: string;
  dimensions: Dimensions;
  position: { x: number; y: number; z: number };
  color: string;
}

interface PalletSimulatorProps {
  palletItems: PalletItem[];
  setPalletItems: (items: PalletItem[]) => void;
  palletSize: Dimensions;
  setPalletSize: (size: Dimensions) => void;
}

const PalletSimulator: React.FC<PalletSimulatorProps> = ({
  palletItems,
  setPalletItems,
  palletSize,
  setPalletSize
}) => {
  const [maxHeight, setMaxHeight] = useState(2000);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: 35, y: 45 });
  const [pan, setPan] = useState({ x: 0, y: 100 });
  const [scale, setScale] = useState(2.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'rotate' | 'pan' | null>(null);
  const [isArranging, setIsArranging] = useState(false);
  const [showOpaque, setShowOpaque] = useState(false);

  // 새 아이템 추가 폼
  const [newItemName, setNewItemName] = useState('박스');
  const [newItemDims, setNewItemDims] = useState<Dimensions>({ width: 300, height: 300, length: 400 });
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const svgRef = useRef<SVGSVGElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const PIXEL_SCALE = 0.08;

  // DEL 키로 선택된 아이템 제거
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedItemId) {
        removeItem(selectedItemId);
        setSelectedItemId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId]);

  // Non-passive wheel event listener to prevent scroll warning
  useEffect(() => {
    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      setScale(prev => Math.max(0.1, Math.min(3, prev - e.deltaY * 0.001)));
    };

    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('wheel', handleWheelNative, { passive: false });
      return () => {
        svgElement.removeEventListener('wheel', handleWheelNative);
      };
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (e.button === 2) { // 우클릭
      setDragMode('rotate');
      e.preventDefault();
    } else if (e.button === 1 || e.shiftKey) { // 휠 클릭 또는 Shift+클릭
      setDragMode('pan');
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragMode) return;

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    if (dragMode === 'rotate') {
      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5
      }));
    } else if (dragMode === 'pan') {
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };


  // 모든 회전 방향 가져오기
  const getAllOrientations = (dims: Dimensions) => {
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
  const canPlaceAt = (pos: { x: number, y: number, z: number }, dims: Dimensions, items: PalletItem[]): boolean => {
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

  // 최적 위치 찾기 함수
  const findBestPosition = (existingItems: PalletItem[], dims: Dimensions) => {
    // 팔레트 위에서 시작
    let bestPosition = { x: 0, y: palletSize.height, z: 0 };
    let lowestY = Infinity;

    if (existingItems.length === 0) {
      return bestPosition;
    }

    // 1. 먼저 바닥 레벨에서 빈 공간 찾기
    for (let x = 0; x <= palletSize.width - dims.width; x += 50) {
      for (let z = 0; z <= palletSize.length - dims.length; z += 50) {
        let maxY = palletSize.height; // 이 위치에서의 바닥 높이

        for (const item of existingItems) {
          // XZ 평면에서 겹치는지 확인
          if (x < item.position.x + item.dimensions.width &&
              x + dims.width > item.position.x &&
              z < item.position.z + item.dimensions.length &&
              z + dims.length > item.position.z) {
            // 겹친다면 그 아이템 위가 바닥이 됨
            const itemTop = item.position.y + item.dimensions.height;
            maxY = Math.max(maxY, itemTop);
          }
        }

        // 이 위치가 최대 높이를 초과하지 않는지 확인
        if (maxY + dims.height <= maxHeight) {
          // 가장 낮은 위치 선택
          if (maxY < lowestY) {
            lowestY = maxY;
            bestPosition = { x, y: maxY, z };
          }
        }
      }
    }

    return bestPosition;
  };

  const addItem = () => {
    if (!newItemName) return;

    const newItems: PalletItem[] = [];
    for (let i = 0; i < newItemQuantity; i++) {
      const currentItems = [...palletItems, ...newItems];

      // 회전을 고려한 최적 배치
      const orientations = getAllOrientations(newItemDims);
      let bestPosition = null;
      let bestOrientation = newItemDims;
      let lowestY = Infinity;

      for (const orientation of orientations) {
        // 팔레트 범위 체크
        if (orientation.width > palletSize.width || orientation.length > palletSize.length) {
          continue;
        }

        const position = findBestPosition(currentItems, orientation);

        if (position && position.y < lowestY && position.y + orientation.height <= maxHeight) {
          lowestY = position.y;
          bestPosition = position;
          bestOrientation = orientation;
        }
      }

      if (bestPosition) {
        const newItem: PalletItem = {
          id: `${Date.now()}-${i}`,
          name: newItemName,
          dimensions: bestOrientation,
          position: bestPosition,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };
        newItems.push(newItem);
      } else {
        // 배치할 수 없으면 경고
        alert(`${newItemName} ${i + 1}/${newItemQuantity}개를 배치할 공간이 없습니다.`);
        break;
      }
    }

    if (newItems.length > 0) {
      setPalletItems([...palletItems, ...newItems]);
      setNewItemName('박스');
      setNewItemQuantity(1);
    }
  };

  // 자동 정렬 함수
  const autoArrange = async () => {
    if (palletItems.length === 0) return;

    setIsArranging(true);

    // 부피가 큰 것부터 아래에 배치
    const sortedItems = [...palletItems].sort((a, b) => {
      const volA = a.dimensions.width * a.dimensions.height * a.dimensions.length;
      const volB = b.dimensions.width * b.dimensions.height * b.dimensions.length;
      return volB - volA;
    });

    const arrangedItems: PalletItem[] = [];

    for (const item of sortedItems) {
      // 최적 위치와 회전 찾기
      const orientations = getAllOrientations(item.dimensions);
      let bestPosition = null;
      let bestOrientation = null;
      let bestScore = Infinity;

      for (const orientation of orientations) {
        // 팔레트 범위 체크
        if (orientation.width > palletSize.width || orientation.length > palletSize.length) {
          continue;
        }

        const position = findOptimalPosition(arrangedItems, orientation);

        if (position && position.y + orientation.height <= maxHeight) {
          // 점수: 낮을수록 좋음, 중심에 가까울수록 좋음
          const score = position.y * 1000 +
                       Math.abs(position.x + orientation.width/2 - palletSize.width/2) +
                       Math.abs(position.z + orientation.length/2 - palletSize.length/2);

          if (score < bestScore) {
            bestScore = score;
            bestPosition = position;
            bestOrientation = orientation;
          }
        }
      }

      if (bestPosition && bestOrientation) {
        arrangedItems.push({
          ...item,
          dimensions: bestOrientation,
          position: bestPosition
        });
      }
    }

    // 약간의 지연
    await new Promise(resolve => setTimeout(resolve, 500));

    setPalletItems(arrangedItems);
    setIsArranging(false);
  };

  // 최적 위치 찾기 (층별로 빈 공간 찾기)
  const findOptimalPosition = (existingItems: PalletItem[], dims: Dimensions) => {
    let bestPosition = null;
    let lowestY = Infinity;

    // 25mm 단위로 스캔
    for (let y = palletSize.height; y <= maxHeight - dims.height; y += 25) {
      for (let x = 0; x <= palletSize.width - dims.width; x += 25) {
        for (let z = 0; z <= palletSize.length - dims.length; z += 25) {
          const pos = { x, y, z };

          if (canPlaceAt(pos, dims, existingItems)) {
            if (y < lowestY) {
              lowestY = y;
              bestPosition = pos;
            }
          }
        }
      }
      // 이 높이에서 위치를 찾았으면 더 높은 곳은 보지 않음
      if (bestPosition && bestPosition.y === y) {
        break;
      }
    }

    return bestPosition;
  };

  const removeItem = (id: string) => {
    setPalletItems(palletItems.filter(item => item.id !== id));
  };

  const project3D = (x: number, y: number, z: number) => {
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;

    // 중심점 조정
    x -= palletSize.width / 2;
    z -= palletSize.length / 2;

    // Y축 회전
    let x1 = x * Math.cos(radY) - z * Math.sin(radY);
    let z1 = x * Math.sin(radY) + z * Math.cos(radY);

    // X축 회전
    let y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
    let z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

    return {
      x: x1 * scale * PIXEL_SCALE + pan.x,
      y: -y1 * scale * PIXEL_SCALE + pan.y
    };
  };

  const renderBox = (item: { dimensions: Dimensions; position: { x: number; y: number; z: number }; color: string }, id: string, isPallet = false) => {
    const { width, height, length } = item.dimensions;
    const { x, y, z } = item.position;

    const vertices = [
      project3D(x, y, z),
      project3D(x + width, y, z),
      project3D(x + width, y + height, z),
      project3D(x, y + height, z),
      project3D(x, y, z + length),
      project3D(x + width, y, z + length),
      project3D(x + width, y + height, z + length),
      project3D(x, y + height, z + length),
    ];

    const faces = [
      { points: [0, 1, 2, 3], brightness: 1.0 },
      { points: [4, 5, 6, 7], brightness: 0.6 },
      { points: [0, 1, 5, 4], brightness: 0.8 },
      { points: [2, 3, 7, 6], brightness: 0.9 },
      { points: [0, 3, 7, 4], brightness: 0.7 },
      { points: [1, 2, 6, 5], brightness: 0.85 },
    ];

    const isSelected = selectedItemId === id;
    // 팔레트는 항상 불투명, 화물만 투명도 조절
    const baseOpacity = isPallet ? 1.0 : (showOpaque ? 1.0 : 0.85);

    return (
      <g key={id} onClick={() => !isPallet && setSelectedItemId(id)} className="cursor-pointer">
        {faces.map((face, i) => {
          const points = face.points.map(p => `${vertices[p].x},${vertices[p].y}`).join(' ');
          const baseColor = isPallet ? '#8B4513' : item.color;

          return (
            <polygon
              key={i}
              points={points}
              fill={baseColor}
              fillOpacity={baseOpacity * face.brightness}
              stroke={isSelected ? '#3B82F6' : (showOpaque ? '#333' : '#000')}
              strokeWidth={isSelected ? 2 : (showOpaque ? 1 : 0.5)}
              strokeOpacity={isSelected ? 1 : (showOpaque ? 0.8 : 0.2)}
            />
          );
        })}
      </g>
    );
  };

  // 통계 계산
  const stats = React.useMemo(() => {
    const currentMaxHeight = palletItems.length > 0
      ? Math.max(...palletItems.map(i => i.position.y + i.dimensions.height))
      : palletSize.height;

    const totalVolume = palletItems.reduce((acc, item) =>
      acc + (item.dimensions.width * item.dimensions.height * item.dimensions.length), 0);

    // 전체 최대 허용 공간 대비 효율 계산 (컨테이너와 동일한 방식)
    const totalAvailableVolume = palletSize.width * palletSize.length * (maxHeight - palletSize.height);
    const efficiency = totalAvailableVolume > 0 ? (totalVolume / totalAvailableVolume) * 100 : 0;

    return { itemCount: palletItems.length, maxHeight: currentMaxHeight, efficiency };
  }, [palletItems, palletSize, maxHeight]);

  return (
    <main className="p-6 mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden bg-slate-50/50" style={{ height: 'calc(100vh - 80px)' }}>

      {/* Main Pallet Area with Left Ad Space */}
      <div className="lg:col-span-3 flex gap-4 min-w-0" style={{ height: 'calc(100vh - 135px)' }}>

        {/* Vertical Ad Space */}
        <div className="hidden lg:flex w-40 bg-white border border-slate-200 rounded-2xl items-center justify-center shrink-0 shadow-sm" style={{ height: 'calc(100vh - 135px)' }}>
          <AdSense
            adSlot="3333333333"
            adFormat="vertical"
            style={{ width: '160px', height: '600px' }}
          />
        </div>

        {/* Pallet Builder Container */}
        <div className="flex-1 flex flex-col gap-4 min-w-0" style={{ height: 'calc(100vh - 135px)' }}>
          {/* Title Section with Pallet Type Selection */}
          <div className="flex justify-between items-end px-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Pallet Loading Simulator
                  <span className="px-2 py-0.5 text-[8px] bg-amber-100 text-amber-700 rounded-full font-bold">BETA</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">3D Real-time Visualization</p>
              </div>
            </div>
            <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto scrollbar-hide max-w-[60%]">
              <button
                onClick={() => setPalletSize({ width: 1200, height: 150, length: 1000 })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                  palletSize.width === 1200 && palletSize.length === 1000
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                EUR (1200×1000)
              </button>
              <button
                onClick={() => setPalletSize({ width: 1100, height: 150, length: 1100 })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                  palletSize.width === 1100 && palletSize.length === 1100
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                KR (1100×1100)
              </button>
              <button
                onClick={() => setPalletSize({ width: 1219, height: 150, length: 1016 })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                  palletSize.width === 1219 && palletSize.length === 1016
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                US (48"×40")
              </button>
              <button
                onClick={() => setPalletSize({ width: 1200, height: 150, length: 800 })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                  palletSize.width === 1200 && palletSize.length === 800
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                HALF (1200×800)
              </button>
              <button
                onClick={() => setPalletSize({ width: 1140, height: 150, length: 1140 })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                  palletSize.width === 1140 && palletSize.length === 1140
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                AU (1140×1140)
              </button>
            </div>
          </div>

          <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200/50" style={{ height: 'calc(100vh - 310px)' }}>
            <svg
              ref={svgRef}
              className="w-full h-full cursor-move"
              viewBox="-400 -300 800 600"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* 깊이 정렬된 렌더링 */}
              {(() => {
                const palletItem = {
                  id: 'pallet',
                  dimensions: palletSize,
                  position: { x: 0, y: 0, z: 0 },
                  color: '#8B4513',
                  name: 'pallet'
                };

                const radX = (rotation.x * Math.PI) / 180;
                const radY = (rotation.y * Math.PI) / 180;

                const allItems = [palletItem, ...palletItems];
                const sortedItems = allItems.sort((a, b) => {
                  if (a.id === 'pallet') return -1;
                  if (b.id === 'pallet') return 1;

                  const getClosestVertex = (item: typeof a) => {
                    const vertices = [
                      { x: item.position.x, y: item.position.y, z: item.position.z },
                      { x: item.position.x + item.dimensions.width, y: item.position.y, z: item.position.z },
                      { x: item.position.x, y: item.position.y + item.dimensions.height, z: item.position.z },
                      { x: item.position.x + item.dimensions.width, y: item.position.y + item.dimensions.height, z: item.position.z },
                      { x: item.position.x, y: item.position.y, z: item.position.z + item.dimensions.length },
                      { x: item.position.x + item.dimensions.width, y: item.position.y, z: item.position.z + item.dimensions.length },
                      { x: item.position.x, y: item.position.y + item.dimensions.height, z: item.position.z + item.dimensions.length },
                      { x: item.position.x + item.dimensions.width, y: item.position.y + item.dimensions.height, z: item.position.z + item.dimensions.length }
                    ];

                    let maxZ = -Infinity;
                    for (const vertex of vertices) {
                      const rel = {
                        x: vertex.x - palletSize.width / 2,
                        y: vertex.y,
                        z: vertex.z - palletSize.length / 2
                      };
                      const rotated = {
                        x: rel.x * Math.cos(radY) - rel.z * Math.sin(radY),
                        y: rel.y,
                        z: rel.x * Math.sin(radY) + rel.z * Math.cos(radY)
                      };
                      const final = {
                        x: rotated.x,
                        y: rotated.y * Math.cos(radX) - rotated.z * Math.sin(radX),
                        z: rotated.y * Math.sin(radX) + rotated.z * Math.cos(radX)
                      };
                      maxZ = Math.max(maxZ, final.z);
                    }
                    return maxZ;
                  };

                  const depthA = getClosestVertex(a);
                  const depthB = getClosestVertex(b);
                  return depthA - depthB;
                });

                return sortedItems.map(item =>
                  item.id === 'pallet'
                    ? renderBox(item, item.id, true)
                    : renderBox(item, item.id, false)
                );
              })()}

              {/* 최대 높이 가이드라인 */}
              <line
                x1={project3D(0, maxHeight, 0).x}
                y1={project3D(0, maxHeight, 0).y}
                x2={project3D(palletSize.width, maxHeight, 0).x}
                y2={project3D(palletSize.width, maxHeight, 0).y}
                stroke="red"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            </svg>

            {/* 컨트롤 안내 */}
            <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur text-white text-xs p-2 rounded border border-slate-600">
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> 우클릭 드래그: 화면 회전</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 휠 드래그: 화면 이동</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> 휠 스크롤: 확대/축소</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> DEL: 선택 화물 제거</p>
            </div>

            {/* Floating UI - Efficiency Panel */}
            <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none" style={{ zIndex: 20 }}>
              <div className="bg-white/90 backdrop-blur-xl shadow-xl p-5 rounded-2xl border border-white flex flex-col gap-1 min-w-[180px]">
                <span className="text-[9px] text-amber-500 uppercase font-black tracking-[0.2em] leading-none mb-1.5">Efficiency</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">
                    {stats.efficiency.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-300 font-black">%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${stats.efficiency > 90 ? 'bg-emerald-500' : 'bg-amber-600'}`}
                    style={{ width: `${stats.efficiency}%` }}
                  />
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  <p className="text-[10px] text-slate-500">
                    <span className="font-black text-slate-700">아이템:</span> {stats.itemCount}개
                  </p>
                  <p className="text-[10px] text-slate-500">
                    <span className="font-black text-slate-700">최고높이:</span> {stats.maxHeight}mm
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Left - Scale Display */}
            <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 text-slate-400">
              <div className="text-xs">
                <p>Pallet: {palletSize.width}×{palletSize.length}</p>
                <p>Scale: {scale.toFixed(2)}x</p>
              </div>
            </div>

            {/* Bottom Right - Opacity Toggle */}
            <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
              <button
                onClick={() => setShowOpaque(!showOpaque)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all shadow-lg border ${
                  showOpaque
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                {showOpaque ? '◼' : '◻'} 불투명 모드
              </button>
            </div>
          </div>

          {/* Horizontal Ad Space */}
          <div className="h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <AdSense
              adSlot="4444444444"
              adFormat="horizontal"
              className="w-full"
              style={{ minHeight: '80px' }}
            />
          </div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="lg:col-span-1 overflow-hidden" style={{ height: 'calc(100vh - 135px)' }}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 h-full overflow-hidden flex flex-col">

          {/* Fixed Header Only */}
          <div className="p-5 pb-3 shrink-0 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">팔레트 시뮬레이터</h3>
            </div>
          </div>

          {/* Scrollable Content (Settings + Form + List) */}
          <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-6 scrollbar-hide">
            {/* 팔레트 설정 */}
            <div className="space-y-4">

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">규격 (L x W x H mm)</label>
                  <button
                    type="button"
                    onClick={() => setPalletSize({ width: palletSize.length, height: palletSize.height, length: palletSize.width })}
                    className="px-2 py-1 text-[8px] font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    90°
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <input
                    type="number"
                    value={palletSize.length}
                    onChange={(e) => setPalletSize({...palletSize, length: Number(e.target.value)})}
                    className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    min="100"
                    placeholder="길이"
                  />
                  <input
                    type="number"
                    value={palletSize.width}
                    onChange={(e) => setPalletSize({...palletSize, width: Number(e.target.value)})}
                    className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    min="100"
                    placeholder="너비"
                  />
                  <input
                    type="number"
                    value={palletSize.height}
                    onChange={(e) => setPalletSize({...palletSize, height: Number(e.target.value)})}
                    className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    min="50"
                    placeholder="높이"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  최대 적재 높이: <span className="text-slate-700">{maxHeight}mm</span>
                </label>
                <input
                  type="range"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(Number(e.target.value))}
                  min="500"
                  max="3000"
                  className="w-full"
                />
              </div>
            </div>

            {/* 화물 추가 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">화물 추가</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">화물 식별명</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                  placeholder="화물 이름"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">규격 (L x W x H mm)</label>
                  <button
                    type="button"
                    onClick={() => setNewItemDims({ width: newItemDims.length, height: newItemDims.height, length: newItemDims.width })}
                    className="px-2 py-1 text-[8px] font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    90°
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <input
                    type="number"
                    value={newItemDims.length}
                    onChange={(e) => setNewItemDims({...newItemDims, length: Number(e.target.value)})}
                    className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    min="10"
                    placeholder="길이"
                  />
                  <input
                    type="number"
                    value={newItemDims.width}
                    onChange={(e) => setNewItemDims({...newItemDims, width: Number(e.target.value)})}
                    className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    min="10"
                    placeholder="너비"
                  />
                  <input
                    type="number"
                    value={newItemDims.height}
                    onChange={(e) => setNewItemDims({...newItemDims, height: Number(e.target.value)})}
                    className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    min="10"
                    placeholder="높이"
                  />
                </div>

                {/* 프리셋 버튼들 */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => { setNewItemDims({ width: 200, height: 200, length: 300 }); setNewItemName('XS박스'); }}
                    className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:border-blue-500 transition-all"
                  >
                    XS박스
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewItemDims({ width: 300, height: 300, length: 400 }); setNewItemName('S박스'); }}
                    className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:border-blue-500 transition-all"
                  >
                    S박스
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewItemDims({ width: 400, height: 400, length: 500 }); setNewItemName('M박스'); }}
                    className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:border-blue-500 transition-all"
                  >
                    M박스
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewItemDims({ width: 500, height: 500, length: 600 }); setNewItemName('L박스'); }}
                    className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:border-blue-500 transition-all"
                  >
                    L박스
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">수량</label>
                <input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                  min="1"
                />
              </div>

              <button
                onClick={addItem}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                화물 추가 ({newItemQuantity}개)
              </button>
            </div>

            {/* 화물 리스트 */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-black text-slate-900 text-xs tracking-tight">
                  화물 리스트 <span className="text-slate-300 font-bold ml-1">{palletItems.length}</span>
                </h3>
                {palletItems.length > 0 && (
                  <button
                    onClick={() => setPalletItems([])}
                    className="text-[9px] text-slate-400 hover:text-red-500 font-black uppercase tracking-widest transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {palletItems.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-300 text-[10px] font-bold">리스트가 비어있습니다.</p>
                  </div>
                ) : (
                  palletItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`group relative flex items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                        selectedItemId === item.id
                          ? 'bg-white border-slate-900 shadow-md translate-x-1'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div
                        className="w-1.5 h-8 rounded-full mr-3 shrink-0"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-[11px] truncate ${
                          selectedItemId === item.id ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {item.name}
                        </p>
                        <div className="flex items-center text-[9px] text-slate-400 font-bold">
                          <span className="truncate opacity-60">
                            {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 자동 정렬 버튼 */}
          {palletItems.length > 0 && (
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <button
                onClick={autoArrange}
                disabled={isArranging}
                className={`w-full py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group ${
                  isArranging
                    ? 'bg-blue-500 text-white cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]'
                }`}
              >
                {isArranging ? (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-widest">최적화 중...</span>
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-widest">자동 최적화</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

    </main>
  );
};

export default PalletSimulator;