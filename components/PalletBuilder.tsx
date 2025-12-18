import React, { useState, useRef, useEffect } from 'react';
import { Dimensions } from '../types';

interface PalletItem {
  id: string;
  name: string;
  dimensions: Dimensions;
  position: { x: number; y: number; z: number };
  color: string;
}

export interface CompoundCargoPreset {
  name: string;
  palletSize: Dimensions;
  items: PalletItem[];
  totalHeight: number;
  totalWidth: number;
  totalLength: number;
}

interface PalletBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToList: (compoundCargo: {
    name: string;
    dimensions: Dimensions;
    quantity: number;
    weight: number;
    items: PalletItem[];
    palletSize: Dimensions;
  }) => void;
  editingCargo?: {
    id: string;
    name: string;
    items: PalletItem[];
    palletSize: Dimensions;
    quantity: number;
  };
}

const PalletBuilder: React.FC<PalletBuilderProps> = ({ isOpen, onClose, onAddToList, editingCargo }) => {
  const [palletSize, setPalletSize] = useState<Dimensions>({ width: 1100, height: 150, length: 1100 });
  const [maxHeight, setMaxHeight] = useState(2000);
  const [palletItems, setPalletItems] = useState<PalletItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: -25, y: 45 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.5);
  const [compoundCargoName, setCompoundCargoName] = useState('복합 화물');
  const [quantity, setQuantity] = useState(1);
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

  // 편집 모드일 때 초기값 설정
  useEffect(() => {
    if (editingCargo && isOpen) {
      setPalletSize(editingCargo.palletSize);
      setPalletItems(editingCargo.items);
      setCompoundCargoName(editingCargo.name);
      setQuantity(editingCargo.quantity);
    } else if (!editingCargo && isOpen) {
      // 새로 생성할 때 초기화
      setPalletSize({ width: 1100, height: 150, length: 1100 });
      setPalletItems([]);
      setCompoundCargoName('복합 화물');
      setQuantity(1);
    }
  }, [editingCargo, isOpen]);

  // DEL 키로 선택된 아이템 제거
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedItemId && isOpen) {
        removeItem(selectedItemId);
        setSelectedItemId(null);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedItemId, isOpen]);

  // 복합 화물의 전체 치수 계산
  const calculateCompoundDimensions = () => {
    if (palletItems.length === 0) {
      return {
        width: palletSize.width,
        height: palletSize.height,
        length: palletSize.length
      };
    }

    let maxX = palletSize.width;
    let maxY = palletSize.height;
    let maxZ = palletSize.length;

    palletItems.forEach(item => {
      maxX = Math.max(maxX, item.position.x + item.dimensions.width);
      maxY = Math.max(maxY, item.position.y + item.dimensions.height);
      maxZ = Math.max(maxZ, item.position.z + item.dimensions.length);
    });

    return { width: maxX, height: maxY, length: maxZ };
  };

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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prev => Math.max(0.1, Math.min(2, prev - e.deltaY * 0.001)));
  };

  if (!isOpen) return null;

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
        let collision = false;
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

  // 자동 정렬 함수 - 기존 배치 최적화
  const autoArrange = async () => {
    if (palletItems.length === 0) return;

    setIsArranging(true);

    // 간단한 재배치: 부피가 큰 것부터 아래에 배치
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

        // 가능한 모든 위치 시도
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

    // 약간의 지연을 추가해 처리 중임을 보여줌
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

  // 층별 패킹 시도 - 다양한 패턴
  const tryLayerPacking = (items: PalletItem[], startY: number, existingItems: PalletItem[]): PalletItem[] => {
    const patterns = [
      'grid',      // 격자 패턴
      'spiral',    // 나선형 패턴
      'corner',    // 모서리부터 채우기
      'center',    // 중앙부터 채우기
    ];

    let bestArrangement: PalletItem[] = [];
    let bestEfficiency = 0;

    for (const pattern of patterns) {
      const arrangement = packWithPattern(items, startY, pattern, existingItems);
      const efficiency = calculatePackingEfficiency(arrangement);

      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency;
        bestArrangement = arrangement;
      }
    }

    return bestArrangement;
  };

  // 패턴별 패킹 구현
  const packWithPattern = (items: PalletItem[], startY: number, pattern: string, existingItems: PalletItem[]): PalletItem[] => {
    const packed: PalletItem[] = [];
    const sortedItems = [...items].sort((a, b) => {
      const volA = a.dimensions.width * a.dimensions.length;
      const volB = b.dimensions.width * b.dimensions.length;
      return volB - volA;
    });

    for (const item of sortedItems) {
      const positions = generatePositionsForPattern(pattern, item.dimensions, packed, startY);

      for (const pos of positions) {
        if (canPlaceAt(pos, item.dimensions, [...existingItems, ...packed])) {
          // 6가지 회전 시도
          const orientations = getAllOrientations(item.dimensions);
          let placed = false;

          for (const orientation of orientations) {
            if (orientation.width <= palletSize.width - pos.x &&
                orientation.length <= palletSize.length - pos.z &&
                orientation.height + pos.y <= maxHeight &&
                canPlaceAt(pos, orientation, [...existingItems, ...packed])) {
              packed.push({
                ...item,
                dimensions: orientation,
                position: pos
              });
              placed = true;
              break;
            }
          }

          if (placed) break;
        }
      }
    }

    return packed;
  };

  // 패턴별 위치 생성
  const generatePositionsForPattern = (pattern: string, dims: Dimensions, packed: PalletItem[], startY: number) => {
    const positions: { x: number, y: number, z: number }[] = [];

    switch (pattern) {
      case 'grid':
        // 격자 패턴
        for (let x = 0; x <= palletSize.width - dims.width; x += 50) {
          for (let z = 0; z <= palletSize.length - dims.length; z += 50) {
            positions.push({ x, y: startY, z });
          }
        }
        break;

      case 'spiral':
        // 나선형 패턴 (중심에서 바깥으로)
        const centerX = palletSize.width / 2;
        const centerZ = palletSize.length / 2;
        let radius = 0;
        while (radius < Math.max(palletSize.width, palletSize.length)) {
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const x = Math.round(centerX + radius * Math.cos(angle));
            const z = Math.round(centerZ + radius * Math.sin(angle));
            if (x >= 0 && x <= palletSize.width - dims.width &&
                z >= 0 && z <= palletSize.length - dims.length) {
              positions.push({ x, y: startY, z });
            }
          }
          radius += 100;
        }
        break;

      case 'corner':
        // 모서리부터 채우기
        const corners = [
          { x: 0, z: 0 },
          { x: palletSize.width - dims.width, z: 0 },
          { x: 0, z: palletSize.length - dims.length },
          { x: palletSize.width - dims.width, z: palletSize.length - dims.length }
        ];
        corners.forEach(corner => {
          for (let dx = 0; dx <= palletSize.width; dx += 50) {
            for (let dz = 0; dz <= palletSize.length; dz += 50) {
              const x = Math.min(Math.max(0, corner.x + dx), palletSize.width - dims.width);
              const z = Math.min(Math.max(0, corner.z + dz), palletSize.length - dims.length);
              positions.push({ x, y: startY, z });
            }
          }
        });
        break;

      case 'center':
        // 중앙부터 채우기
        positions.push({
          x: Math.max(0, (palletSize.width - dims.width) / 2),
          y: startY,
          z: Math.max(0, (palletSize.length - dims.length) / 2)
        });
        for (let dist = 50; dist < Math.max(palletSize.width, palletSize.length); dist += 50) {
          for (let x = 0; x <= palletSize.width - dims.width; x += dist) {
            for (let z = 0; z <= palletSize.length - dims.length; z += dist) {
              positions.push({ x, y: startY, z });
            }
          }
        }
        break;
    }

    return positions;
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

  // 패킹 효율성 계산
  const calculatePackingEfficiency = (items: PalletItem[]): number => {
    if (items.length === 0) return 0;

    let totalVolume = 0;
    let maxY = palletSize.height;

    items.forEach(item => {
      totalVolume += item.dimensions.width * item.dimensions.height * item.dimensions.length;
      maxY = Math.max(maxY, item.position.y + item.dimensions.height);
    });

    const usedVolume = palletSize.width * palletSize.length * (maxY - palletSize.height);
    return usedVolume > 0 ? (totalVolume / usedVolume) * 100 : 0;
  };

  // 겹침 체크를 포함한 최적 위치 찾기
  const findBestPositionWithCheck = (existingItems: PalletItem[], dims: Dimensions) => {
    let bestPosition = { x: 0, y: palletSize.height, z: 0 };
    let lowestY = Infinity;
    let found = false;

    // 그리드 단위로 스캔 (25mm 단위로 더 정밀하게)
    for (let x = 0; x <= palletSize.width - dims.width; x += 25) {
      for (let z = 0; z <= palletSize.length - dims.length; z += 25) {
        let maxY = palletSize.height; // 이 위치에서의 바닥 높이
        let canPlace = true;

        for (const item of existingItems) {
          // XZ 평면에서 겹치는지 확인
          if (!(x >= item.position.x + item.dimensions.width ||
                x + dims.width <= item.position.x ||
                z >= item.position.z + item.dimensions.length ||
                z + dims.length <= item.position.z)) {
            // 겹친다면 그 아이템 위가 바닥이 됨
            const itemTop = item.position.y + item.dimensions.height;
            maxY = Math.max(maxY, itemTop);
          }
        }

        // 이 위치가 최대 높이를 초과하지 않는지 확인
        if (maxY + dims.height <= maxHeight && maxY < lowestY) {
          lowestY = maxY;
          bestPosition = { x, y: maxY, z };
          found = true;
        }
      }
    }

    return found ? bestPosition : null;
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

  const renderBox = (item: { dimensions: Dimensions; position: { x: number; y: number; z: number }; color: string }, id: string, isPallet = false, zIndex: number = 0) => {
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

    // Z-depth 계산 (뷰어 시점에서의 거리)
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const centerZ = z + length / 2;
    const viewDepth = centerY * Math.sin(rotation.x * Math.PI / 180) + centerZ * Math.cos(rotation.x * Math.PI / 180);

    const faces = [
      { points: [0, 1, 2, 3], brightness: 1.0, normal: [0, 0, -1] },    // 앞면
      { points: [4, 5, 6, 7], brightness: 0.6, normal: [0, 0, 1] },     // 뒷면
      { points: [0, 1, 5, 4], brightness: 0.8, normal: [0, -1, 0] },    // 아래면
      { points: [2, 3, 7, 6], brightness: 0.9, normal: [0, 1, 0] },     // 윗면
      { points: [0, 3, 7, 4], brightness: 0.7, normal: [-1, 0, 0] },    // 왼쪽
      { points: [1, 2, 6, 5], brightness: 0.85, normal: [1, 0, 0] },    // 오른쪽
    ];

    const isSelected = selectedItemId === id;

    // 불투명 모드에서의 투명도 설정
    const baseOpacity = showOpaque ? 1.0 : (isPallet ? 0.9 : 0.85);

    return (
      <g key={id} onClick={() => !isPallet && setSelectedItemId(id)} className="cursor-pointer" data-depth={viewDepth}>
        {faces.map((face, i) => {
          const points = face.points.map(p => `${vertices[p].x},${vertices[p].y}`).join(' ');
          const baseColor = isPallet ? '#8B4513' : item.color;

          // 면의 방향에 따라 보이는지 확인 (불투명 모드에서만)
          const faceVisible = !showOpaque || true; // 간단히 모든 면 표시

          return faceVisible && (
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">3D 팔레트 화물 빌더 {editingCargo ? '(수정 모드)' : ''}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 3D 뷰어 */}
          <div className="flex-1 bg-slate-900 relative">
            <svg
              ref={svgRef}
              className="w-full h-full cursor-move"
              viewBox="-400 -300 800 600"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* 팔레트와 아이템들 렌더링 - 항상 깊이 정렬 적용 */}
              {(() => {
                const palletItem = {
                  id: 'pallet',
                  dimensions: palletSize,
                  position: { x: 0, y: 0, z: 0 },
                  color: '#8B4513',
                  name: 'pallet'
                };

                // 회전 각도를 고려한 깊이 정렬 (투명/불투명 모두 적용)
                const radX = (rotation.x * Math.PI) / 180;
                const radY = (rotation.y * Math.PI) / 180;

                // 팔레트를 포함한 모든 아이템 정렬
                const allItems = [palletItem, ...palletItems];
                const sortedItems = allItems.sort((a, b) => {
                  // 각 아이템의 중심점 계산
                  const centerA = {
                    x: a.position.x + a.dimensions.width / 2,
                    y: a.position.y + a.dimensions.height / 2,
                    z: a.position.z + a.dimensions.length / 2
                  };
                  const centerB = {
                    x: b.position.x + b.dimensions.width / 2,
                    y: b.position.y + b.dimensions.height / 2,
                    z: b.position.z + b.dimensions.length / 2
                  };

                  // 팔레트 중심 기준으로 변환
                  const relA = {
                    x: centerA.x - palletSize.width / 2,
                    y: centerA.y,
                    z: centerA.z - palletSize.length / 2
                  };
                  const relB = {
                    x: centerB.x - palletSize.width / 2,
                    y: centerB.y,
                    z: centerB.z - palletSize.length / 2
                  };

                  // Y축 회전 적용 (좌우 회전)
                  const rotatedA = {
                    x: relA.x * Math.cos(radY) - relA.z * Math.sin(radY),
                    y: relA.y,
                    z: relA.x * Math.sin(radY) + relA.z * Math.cos(radY)
                  };
                  const rotatedB = {
                    x: relB.x * Math.cos(radY) - relB.z * Math.sin(radY),
                    y: relB.y,
                    z: relB.x * Math.sin(radY) + relB.z * Math.cos(radY)
                  };

                  // X축 회전 적용 (상하 회전)
                  const finalA = {
                    x: rotatedA.x,
                    y: rotatedA.y * Math.cos(radX) - rotatedA.z * Math.sin(radX),
                    z: rotatedA.y * Math.sin(radX) + rotatedA.z * Math.cos(radX)
                  };
                  const finalB = {
                    x: rotatedB.x,
                    y: rotatedB.y * Math.cos(radX) - rotatedB.z * Math.sin(radX),
                    z: rotatedB.y * Math.sin(radX) + rotatedB.z * Math.cos(radX)
                  };

                  // Z 값이 작은 것(뒤쪽)부터 그리기
                  return finalA.z - finalB.z;
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

            {/* 현재 통계 및 설정 */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className="bg-white/90 backdrop-blur p-4 rounded-xl">
                <p className="text-xs font-bold text-slate-600 mb-1">적재 현황</p>
                <p className="text-sm font-black text-slate-900">아이템: {palletItems.length}개</p>
                <p className="text-sm font-black text-slate-900">
                  최고 높이: {palletItems.length > 0 ? Math.max(...palletItems.map(i => i.position.y + i.dimensions.height)) : palletSize.height}mm
                </p>
              </div>

              {/* 불투명 토글 */}
              <div className="bg-white/90 backdrop-blur p-3 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOpaque}
                    onChange={(e) => setShowOpaque(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-700">불투명 모드</span>
                </label>
              </div>
            </div>
          </div>

          {/* 사이드 패널 */}
          <div className="w-96 bg-white border-l border-slate-200 p-6 overflow-y-auto">
            {/* 팔레트 설정 */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-bold text-slate-700">팔레트 설정</h3>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={palletSize.length}
                  onChange={(e) => setPalletSize({...palletSize, length: Number(e.target.value)})}
                  className="px-2 py-2 bg-slate-50 rounded-lg text-sm text-center"
                  placeholder="길이"
                />
                <input
                  type="number"
                  value={palletSize.width}
                  onChange={(e) => setPalletSize({...palletSize, width: Number(e.target.value)})}
                  className="px-2 py-2 bg-slate-50 rounded-lg text-sm text-center"
                  placeholder="너비"
                />
                <input
                  type="number"
                  value={palletSize.height}
                  onChange={(e) => setPalletSize({...palletSize, height: Number(e.target.value)})}
                  className="px-2 py-2 bg-slate-50 rounded-lg text-sm text-center"
                  placeholder="높이"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">최대 적재 높이: {maxHeight}mm</label>
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
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-bold text-slate-700">화물 추가</h3>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="화물 이름"
                className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={newItemDims.length}
                  onChange={(e) => setNewItemDims({...newItemDims, length: Number(e.target.value)})}
                  className="px-2 py-2 bg-slate-50 rounded-lg text-sm text-center"
                  placeholder="길이"
                />
                <input
                  type="number"
                  value={newItemDims.width}
                  onChange={(e) => setNewItemDims({...newItemDims, width: Number(e.target.value)})}
                  className="px-2 py-2 bg-slate-50 rounded-lg text-sm text-center"
                  placeholder="너비"
                />
                <input
                  type="number"
                  value={newItemDims.height}
                  onChange={(e) => setNewItemDims({...newItemDims, height: Number(e.target.value)})}
                  className="px-2 py-2 bg-slate-50 rounded-lg text-sm text-center"
                  placeholder="높이"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">수량</label>
                <input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(Math.max(1, Number(e.target.value)))}
                  min="1"
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={addItem}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700"
              >
                화물 추가 ({newItemQuantity}개)
              </button>
            </div>

            {/* 화물 리스트 */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-slate-700">화물 리스트</h3>
                {palletItems.length > 0 && (
                  <button
                    onClick={autoArrange}
                    disabled={isArranging}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      isArranging
                        ? 'bg-green-500 text-white cursor-wait'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isArranging ? (
                      <>
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        정렬 중...
                      </>
                    ) : (
                      '자동 정렬'
                    )}
                  </button>
                )}
              </div>
              {palletItems.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${selectedItemId === item.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 화물 설정 */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">화물 이름</label>
                <input
                  type="text"
                  value={compoundCargoName}
                  onChange={(e) => setCompoundCargoName(e.target.value)}
                  placeholder="화물 이름"
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">수량</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  min="1"
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200"
          >
            취소
          </button>
          <button
            onClick={() => {
              if (palletItems.length > 0) {
                const compoundDims = calculateCompoundDimensions();
                // 복합 화물로 화물 리스트에 추가 - 구조 그대로 보존
                onAddToList({
                  name: compoundCargoName,
                  dimensions: compoundDims,
                  quantity: quantity,
                  weight: 25 + palletItems.length, // 팔레트 25kg + 아이템당 1kg
                  items: palletItems,
                  palletSize: palletSize
                });
                onClose();
              }
            }}
            disabled={palletItems.length === 0}
            className={`flex-1 py-3 rounded-xl font-black text-sm ${
              palletItems.length > 0
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {editingCargo ? '수정 완료' : `화물 리스트에 추가`} (수량: {quantity})
          </button>
        </div>
      </div>
    </div>
  );
};

export default PalletBuilder;