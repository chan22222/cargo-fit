import React, { useState, useRef, useEffect } from 'react';
import { Dimensions } from '../types';

interface PalletItem {
  id: string;
  name: string;
  dimensions: Dimensions;
  position: { x: number; y: number; z: number };
  color: string;
  isOverHeight?: boolean;
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
  onClose?: () => void;
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
  const [rotation, setRotation] = useState({ x: 35, y: 45 });
  const [pan, setPan] = useState({ x: 0, y: 100 });
  const [scale, setScale] = useState(2.0);
  const [compoundCargoName, setCompoundCargoName] = useState('복합 화물');
  const [quantity, setQuantity] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'rotate' | 'pan' | null>(null);
  const [isArranging, setIsArranging] = useState(false);
  const [showOpaque, setShowOpaque] = useState(false);
  const [noStandUp, setNoStandUp] = useState(false); // 제품 세우지 않기 모드

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

  // maxHeight 변경 시 isOverHeight 재계산
  useEffect(() => {
    if (palletItems.length === 0) return;

    const updatedItems = palletItems.map(item => ({
      ...item,
      isOverHeight: item.position.y + item.dimensions.height > maxHeight
    }));

    const hasChanges = updatedItems.some((item, i) => item.isOverHeight !== palletItems[i].isOverHeight);
    if (hasChanges) {
      setPalletItems(updatedItems);
    }
  }, [maxHeight]);

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
    setScale(prev => Math.max(0.1, Math.min(3, prev - e.deltaY * 0.001)));
  };

  // 독립 실행 모드인 경우 onClose가 없으면 항상 열림
  const isStandalone = !onClose;

  if (!isOpen && !isStandalone) return null;

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
      let isOverHeight = false;

      // 1단계: 높이 제한 내에서 위치 찾기
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

      // 2단계: 높이 제한 내에서 못 찾으면, 높이 제한 무시하고 찾기
      if (!bestPosition) {
        lowestY = Infinity;
        for (const orientation of orientations) {
          if (orientation.width > palletSize.width || orientation.length > palletSize.length) {
            continue;
          }

          const position = findBestPosition(currentItems, orientation, true);

          if (position && position.y < lowestY) {
            lowestY = position.y;
            bestPosition = position;
            bestOrientation = orientation;
            isOverHeight = true;
          }
        }
      }

      if (bestPosition) {
        const actualOverHeight = isOverHeight || (bestPosition.y + bestOrientation.height > maxHeight);

        const newItem: PalletItem = {
          id: `${Date.now()}-${i}`,
          name: newItemName,
          dimensions: bestOrientation,
          position: bestPosition,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          isOverHeight: actualOverHeight
        };
        newItems.push(newItem);
      } else {
        break;
      }
    }

    if (newItems.length > 0) {
      setPalletItems([...palletItems, ...newItems]);
      setNewItemName('박스');
      setNewItemQuantity(1);
    }
  };

  // 최적 위치 찾기 함수 (ignoreHeightLimit: true면 높이 제한 무시)
  const findBestPosition = (existingItems: PalletItem[], dims: Dimensions, ignoreHeightLimit = false): { x: number; y: number; z: number } | null => {
    // 팔레트 위에서 시작
    let bestPosition: { x: number; y: number; z: number } | null = null;
    let lowestY = Infinity;

    if (existingItems.length === 0) {
      return { x: 0, y: palletSize.height, z: 0 };
    }

    // XZ 평면을 스캔하면서 최적 위치 찾기
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

        // 높이 제한 무시 옵션이 있거나, 최대 높이를 초과하지 않는 경우
        if (ignoreHeightLimit || maxY + dims.height <= maxHeight) {
          const pos = { x, y: maxY, z };
          // 지지율 체크 (85% 이상 지지되어야 함)
          const supportRatio = calculateSupportRatio(pos, dims, existingItems);
          if (supportRatio >= MIN_SUPPORT_RATIO) {
            // 가장 낮은 위치 선택
            if (maxY < lowestY) {
              lowestY = maxY;
              bestPosition = pos;
            }
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
        const isOverHeight = bestPosition.y + bestOrientation.height > maxHeight;
        arrangedItems.push({
          ...item,
          dimensions: bestOrientation,
          position: bestPosition,
          isOverHeight
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
            // 지지율 체크 (85% 이상 지지되어야 함)
            const supportRatio = calculateSupportRatio(pos, dims, existingItems);
            if (supportRatio >= MIN_SUPPORT_RATIO) {
              if (y < lowestY) {
                lowestY = y;
                bestPosition = pos;
              }
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

  // 모든 회전 방향 가져오기 (noStandUp: true면 높이 유지, L/W만 변경)
  const getAllOrientations = (dims: Dimensions, keepHeight = false) => {
    const { width: w, height: h, length: l } = dims;
    if (keepHeight || noStandUp) {
      // 높이 유지 모드: L과 W만 교환
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

  // 지지율 계산 (아래 아이템들에 의해 몇 %가 지지되는지)
  const calculateSupportRatio = (pos: { x: number, y: number, z: number }, dims: Dimensions, existingItems: PalletItem[]): number => {
    const itemArea = dims.width * dims.length;

    // 팔레트 바닥에 놓이는 경우 100% 지지
    if (pos.y <= palletSize.height) {
      return 1.0;
    }

    // 새 아이템의 바닥 영역
    const itemLeft = pos.x;
    const itemRight = pos.x + dims.width;
    const itemFront = pos.z;
    const itemBack = pos.z + dims.length;

    let supportedArea = 0;

    // 아래 아이템들과의 겹침 면적 계산
    for (const item of existingItems) {
      const itemTop = item.position.y + item.dimensions.height;

      // 이 아이템이 새 아이템 바로 아래에 있는지 확인 (약간의 여유 허용)
      if (Math.abs(itemTop - pos.y) < 1) {
        // XZ 평면에서 겹치는 영역 계산
        const overlapLeft = Math.max(itemLeft, item.position.x);
        const overlapRight = Math.min(itemRight, item.position.x + item.dimensions.width);
        const overlapFront = Math.max(itemFront, item.position.z);
        const overlapBack = Math.min(itemBack, item.position.z + item.dimensions.length);

        if (overlapRight > overlapLeft && overlapBack > overlapFront) {
          const overlapArea = (overlapRight - overlapLeft) * (overlapBack - overlapFront);
          supportedArea += overlapArea;
        }
      }
    }

    return supportedArea / itemArea;
  };

  const MIN_SUPPORT_RATIO = 1.0; // 최소 100% 지지 필요

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
          const pos = { x, y: maxY, z };
          // 지지율 체크 (85% 이상 지지되어야 함)
          const supportRatio = calculateSupportRatio(pos, dims, existingItems);
          if (supportRatio >= MIN_SUPPORT_RATIO) {
            lowestY = maxY;
            bestPosition = pos;
            found = true;
          }
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

  const renderBox = (item: { dimensions: Dimensions; position: { x: number; y: number; z: number }; color: string; isOverHeight?: boolean }, id: string, isPallet = false, zIndex: number = 0) => {
    const { width, height, length } = item.dimensions;
    const { x, y, z } = item.position;
    const isOverHeight = item.isOverHeight;

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

    // 팔레트는 항상 불투명, 높이 초과 아이템은 거의 투명, 나머지는 기존 로직
    const baseOpacity = isPallet ? 1.0 : (isOverHeight ? 0.15 : (showOpaque ? 1.0 : 0.85));

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
              stroke={isSelected ? '#3B82F6' : (isOverHeight ? '#ff6666' : (showOpaque ? '#333' : '#000'))}
              strokeWidth={isSelected ? 2 : (isOverHeight ? 0.5 : (showOpaque ? 1 : 0.5))}
              strokeOpacity={isSelected ? 1 : (isOverHeight ? 0.3 : (showOpaque ? 0.8 : 0.2))}
              strokeDasharray={isOverHeight ? '3,3' : undefined}
            />
          );
        })}
      </g>
    );
  };

  return (
    <div className={isStandalone ? "h-full w-full" : "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"}>
      <div className={isStandalone
        ? "bg-white w-full h-full overflow-hidden flex flex-col"
        : "bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col"}>
        {!isStandalone && (
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
        )}

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
                  // 팔레트는 항상 먼저 렌더링 (가장 뒤에)
                  if (a.id === 'pallet') return -1;
                  if (b.id === 'pallet') return 1;

                  // 각 아이템의 가장 가까운 꼭짓점 계산 (더 정확한 깊이 계산)
                  const getClosestVertex = (item: typeof a) => {
                    const vertices = [
                      // 8개의 꼭짓점
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
                      // 팔레트 중심 기준으로 변환
                      const rel = {
                        x: vertex.x - palletSize.width / 2,
                        y: vertex.y,
                        z: vertex.z - palletSize.length / 2
                      };

                      // Y축 회전 적용 (좌우 회전)
                      const rotated = {
                        x: rel.x * Math.cos(radY) - rel.z * Math.sin(radY),
                        y: rel.y,
                        z: rel.x * Math.sin(radY) + rel.z * Math.cos(radY)
                      };

                      // X축 회전 적용 (상하 회전)
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

                  // Z 값이 작은 것(뒤쪽)부터 그리기
                  return depthA - depthB;
                });

                return sortedItems.map(item =>
                  item.id === 'pallet'
                    ? renderBox(item, item.id, true)
                    : renderBox(item, item.id, false)
                );
              })()}

              {/* 최대 높이 가이드라인 (사각형) */}
              {(() => {
                const corners = [
                  project3D(0, maxHeight, 0),
                  project3D(palletSize.width, maxHeight, 0),
                  project3D(palletSize.width, maxHeight, palletSize.length),
                  project3D(0, maxHeight, palletSize.length),
                ];
                const points = corners.map(c => `${c.x},${c.y}`).join(' ');
                return (
                  <polygon
                    points={points}
                    fill="none"
                    stroke="red"
                    strokeWidth="1.5"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                );
              })()}
            </svg>

            {/* 컨트롤 안내 */}
            <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur text-white text-xs p-2 rounded border border-slate-600">
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> 우클릭 드래그: 화면 회전</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 휠 드래그: 화면 이동</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> 휠 스크롤: 확대/축소</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> DEL: 선택 화물 제거</p>
            </div>

            {/* Floating UI - Efficiency Panel */}
            {(() => {
              const validItems = palletItems.filter(i => !i.isOverHeight);
              const overHeightItems = palletItems.filter(i => i.isOverHeight);
              const currentMaxHeight = validItems.length > 0
                ? Math.max(...validItems.map(i => i.position.y + i.dimensions.height))
                : palletSize.height;
              const totalVolume = validItems.reduce((acc, item) =>
                acc + (item.dimensions.width * item.dimensions.height * item.dimensions.length), 0);
              // 전체 최대 허용 공간 대비 효율 계산 (컨테이너와 동일한 방식)
              const totalAvailableVolume = palletSize.width * palletSize.length * (maxHeight - palletSize.height);
              const efficiency = totalAvailableVolume > 0 ? (totalVolume / totalAvailableVolume) * 100 : 0;

              return (
                <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none" style={{ zIndex: 20 }}>
                  <div className="bg-white/90 backdrop-blur-xl shadow-xl p-5 rounded-2xl border border-white flex flex-col gap-1 min-w-[180px]">
                    <span className="text-[9px] text-amber-500 uppercase font-black tracking-[0.2em] leading-none mb-1.5">Efficiency</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">
                        {efficiency.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-300 font-black">%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${efficiency > 90 ? 'bg-emerald-500' : 'bg-amber-600'}`}
                        style={{ width: `${efficiency.toFixed(1)}%` }}
                      />
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                      <p className="text-[10px] text-slate-500">
                        <span className="font-black text-slate-700">아이템:</span> {validItems.length}개
                        {overHeightItems.length > 0 && (
                          <span className="text-red-400 ml-1">(+{overHeightItems.length} 초과)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        <span className="font-black text-slate-700">최고높이:</span> {currentMaxHeight}mm
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

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

          {/* 사이드 패널 */}
          <div className="w-96 bg-white border-l border-slate-200 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">

              {/* 팔레트 설정 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">팔레트 설정</h3>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">규격 (L x W x H mm)</label>
                    <button
                      type="button"
                      onClick={() => setPalletSize({ width: palletSize.length, height: palletSize.height, length: palletSize.width })}
                      className="px-2 py-1 text-[8px] font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
                      title="90도 회전"
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

                  {/* 프리셋 버튼들 */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPalletSize({ width: 1200, height: 150, length: 1000 })}
                      className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-amber-600 hover:border-amber-500 transition-all"
                    >
                      EUR 팔레트
                    </button>
                    <button
                      type="button"
                      onClick={() => setPalletSize({ width: 1100, height: 150, length: 1100 })}
                      className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-amber-600 hover:border-amber-500 transition-all"
                    >
                      KR 팔레트
                    </button>
                    <button
                      type="button"
                      onClick={() => setPalletSize({ width: 1200, height: 150, length: 800 })}
                      className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-amber-600 hover:border-amber-500 transition-all"
                    >
                      하프 팔레트
                    </button>
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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setNewItemDims({ width: newItemDims.length, height: newItemDims.height, length: newItemDims.width })}
                        className="px-2 py-0.5 text-[8px] font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
                        title="90도 회전"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        90°
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoStandUp(!noStandUp)}
                        className={`px-2 py-0.5 text-[8px] font-bold rounded-lg transition-all ${noStandUp ? 'bg-slate-200 text-slate-500 hover:bg-slate-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                      >
                        {noStandUp ? '높이 고정 (LxW)' : '높이도 변경 (LxWxH)'}
                      </button>
                    </div>
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
                            : item.isOverHeight
                              ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                              : 'bg-white border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-8 rounded-full mr-3 shrink-0 ${item.isOverHeight ? 'opacity-30' : ''}`}
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-black text-[11px] truncate ${
                            selectedItemId === item.id ? 'text-slate-900' : item.isOverHeight ? 'text-red-400' : 'text-slate-700'
                          }`}>
                            {item.name}
                            {item.isOverHeight && <span className="ml-1 text-[8px] text-red-400">(초과)</span>}
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

              {/* 복합 화물 설정 */}
              <div className="space-y-3 border-t pt-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">복합 화물 이름</label>
                  <input
                    type="text"
                    value={compoundCargoName}
                    onChange={(e) => setCompoundCargoName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 transition-all shadow-inner"
                    placeholder="복합 화물 이름"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">수량</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 transition-all shadow-inner"
                    min="1"
                  />
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

        {/* 하단 액션 버튼 */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          {!isStandalone && (
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200"
            >
              취소
            </button>
          )}
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
                if (onClose) onClose();
              }
            }}
            disabled={palletItems.length === 0}
            className={`flex-1 py-3 rounded-xl font-black text-sm ${
              palletItems.length > 0
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {editingCargo ? '수정 완료' : isStandalone ? '팔레트 생성' : '화물 리스트에 추가'} (수량: {quantity})
          </button>
        </div>
      </div>
    </div>
  );
};

export default PalletBuilder;