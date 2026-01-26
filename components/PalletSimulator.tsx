import React, { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Dimensions, CargoItem, PalletType, PalletSpec, PackedPalletItem } from '../types';
import { DEFAULT_CARGO_COLORS } from '../constants';

const AdSense = lazy(() => import('./AdSense'));

// 팔레트 프리셋
const PALLET_PRESETS: Record<PalletType, PalletSpec> = {
  [PalletType.EUR]: { type: PalletType.EUR, width: 120, length: 100, height: 15, maxLoadHeight: 200, color: '#8B4513' },
  [PalletType.KR]: { type: PalletType.KR, width: 110, length: 110, height: 15, maxLoadHeight: 200, color: '#8B4513' },
  [PalletType.US]: { type: PalletType.US, width: 122, length: 102, height: 15, maxLoadHeight: 200, color: '#8B4513' },
  [PalletType.HALF]: { type: PalletType.HALF, width: 120, length: 80, height: 15, maxLoadHeight: 200, color: '#8B4513' },
  [PalletType.AU]: { type: PalletType.AU, width: 114, length: 114, height: 15, maxLoadHeight: 200, color: '#8B4513' },
  [PalletType.CUSTOM]: { type: PalletType.CUSTOM, width: 110, length: 110, height: 15, maxLoadHeight: 200, color: '#8B4513' },
};

const SCALE = 0.01;

interface PalletSimulatorProps {
  palletItems: PackedPalletItem[];
  setPalletItems: (items: PackedPalletItem[]) => void;
  palletSize: Dimensions;
  setPalletSize: (size: Dimensions) => void;
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  icon: string;
  result: PackedPalletItem[] | null;
  itemCount: number;
  palletCount: number;
  wastedSpace: number;
}

// ============ Three.js 컴포넌트들 ============

const CargoBox: React.FC<{
  item: PackedPalletItem;
  pallet: PalletSpec;
  isSelected: boolean;
  isHovered: boolean;
  isFaded: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  onDrag: (position: { x: number; y: number; z: number }) => void;
}> = ({ item, pallet, isSelected, isHovered, isFaded, onSelect, onHover, onDrag }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { raycaster, gl } = useThree();
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectPoint = useRef(new THREE.Vector3());
  const startPoint = useRef(new THREE.Vector3());
  const DRAG_THRESHOLD = 0.01;

  const BOX_GAP = 0.3;
  const size = useMemo(() => [
    (item.dimensions.width - BOX_GAP) * SCALE,
    (item.dimensions.height - BOX_GAP) * SCALE,
    (item.dimensions.length - BOX_GAP) * SCALE
  ] as [number, number, number], [item.dimensions]);

  const position = useMemo(() => [
    (item.position.x + item.dimensions.width / 2) * SCALE - (pallet.width * SCALE / 2),
    (item.position.y + item.dimensions.height / 2) * SCALE + pallet.height * SCALE,
    (item.position.z + item.dimensions.length / 2) * SCALE - (pallet.length * SCALE / 2)
  ] as [number, number, number], [item.position, item.dimensions, pallet]);

  const color = item.color;
  const emissive = useMemo(() => {
    if (isHovered || isDragging) return item.color;
    if (isSelected) return '#ffffff';
    return '#000000';
  }, [isHovered, isDragging, isSelected, item.color]);

  const handlePointerDown = useCallback((e: THREE.Event) => {
    e.stopPropagation();
    const nativeEvent = e.nativeEvent as PointerEvent;
    if (nativeEvent.button !== 0) return;
    onSelect();
    setIsPointerDown(true);
    planeRef.current.set(new THREE.Vector3(0, 1, 0), -position[1]);
    raycaster.ray.intersectPlane(planeRef.current, startPoint.current);
  }, [onSelect, position, raycaster]);

  const handlePointerUp = useCallback(() => {
    setIsPointerDown(false);
    setIsDragging(false);
    (gl.domElement as HTMLElement).style.cursor = 'auto';
  }, [gl.domElement]);

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isPointerDown) {
        setIsPointerDown(false);
        setIsDragging(false);
        (gl.domElement as HTMLElement).style.cursor = 'auto';
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointerleave', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointerleave', handleGlobalPointerUp);
    };
  }, [isPointerDown, gl.domElement]);

  useFrame(() => {
    if (!isPointerDown) return;
    raycaster.ray.intersectPlane(planeRef.current, intersectPoint.current);
    if (!isDragging) {
      const distance = intersectPoint.current.distanceTo(startPoint.current);
      if (distance > DRAG_THRESHOLD) {
        setIsDragging(true);
        (gl.domElement as HTMLElement).style.cursor = 'grabbing';
      } else {
        return;
      }
    }
    let newX = (intersectPoint.current.x + pallet.width * SCALE / 2) / SCALE - item.dimensions.width / 2;
    let newZ = (intersectPoint.current.z + pallet.length * SCALE / 2) / SCALE - item.dimensions.length / 2;
    newX = Math.max(0, Math.min(pallet.width - item.dimensions.width, newX));
    newZ = Math.max(0, Math.min(pallet.length - item.dimensions.length, newZ));
    onDrag({ x: newX, y: item.position.y, z: newZ });
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      frustumCulled={false}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={isHovered || isDragging ? 0.3 : (isSelected ? 0.1 : 0)}
        transparent
        opacity={item.isOverHeight ? 0.3 : (isFaded ? 0.75 : 0.9)}
        roughness={isFaded ? 0.9 : 0.5}
        metalness={isFaded ? 0 : 0.1}
      />
      <lineSegments frustumCulled={false} raycast={() => null}>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial
          color={item.isOverHeight ? '#ff6666' : (isSelected ? '#ffffff' : (isHovered ? '#aaaaaa' : '#000000'))}
          transparent
          opacity={isSelected ? 1 : (isHovered ? 0.8 : 0.4)}
        />
      </lineSegments>
      {(isHovered || isSelected) && (
        <Html center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
            {item.name}
            {item.isOverHeight && <span className="ml-1 text-red-300">(초과)</span>}
          </div>
        </Html>
      )}
    </mesh>
  );
};

const PalletBox: React.FC<{ pallet: PalletSpec }> = ({ pallet }) => {
  const size = useMemo(() => [
    pallet.width * SCALE,
    pallet.height * SCALE,
    pallet.length * SCALE
  ] as [number, number, number], [pallet]);

  return (
    <group position={[0, size[1] / 2, 0]} frustumCulled={false}>
      <mesh frustumCulled={false}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <lineSegments frustumCulled={false}>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color="#5D3A1A" />
      </lineSegments>
      <gridHelper args={[Math.max(size[0], size[2]), 10, '#334155', '#334155']} position={[0, size[1] / 2 + 0.002, 0]} />
    </group>
  );
};

const MaxHeightGuide: React.FC<{ pallet: PalletSpec }> = ({ pallet }) => {
  const y = (pallet.height + pallet.maxLoadHeight) * SCALE;
  const corners = [
    [-pallet.width * SCALE / 2, y, -pallet.length * SCALE / 2],
    [pallet.width * SCALE / 2, y, -pallet.length * SCALE / 2],
    [pallet.width * SCALE / 2, y, pallet.length * SCALE / 2],
    [-pallet.width * SCALE / 2, y, pallet.length * SCALE / 2],
    [-pallet.width * SCALE / 2, y, -pallet.length * SCALE / 2],
  ] as [number, number, number][];

  return (
    <Line points={corners} color="red" lineWidth={2} dashed dashSize={0.05} gapSize={0.03} />
  );
};

const PalletLabel: React.FC<{ index: number; position: [number, number, number]; itemCount: number }> = React.memo(({ index, position, itemCount }) => {
  return (
    <Html position={position} center sprite transform={false} style={{ pointerEvents: 'none', zIndex: -1 }}>
      <div className="bg-amber-600/30 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
        #{index + 1} - {itemCount}ea
      </div>
    </Html>
  );
});

const Scene: React.FC<{
  pallet: PalletSpec;
  packedItems: PackedPalletItem[];
  selectedItemId: string | null;
  hoveredItemId: string | null;
  palletCount: number;
  showLabels: boolean;
  onSelectItem: (uniqueId: string) => void;
  onHoverItem: (id: string | null) => void;
  onItemMove: (uniqueId: string, pos: { x: number; y: number; z: number }) => void;
}> = ({ pallet, packedItems, selectedItemId, hoveredItemId, palletCount, showLabels, onSelectItem, onHoverItem, onItemMove }) => {
  const PALLET_GAP = 50 * SCALE;
  const palletWidth = pallet.width * SCALE;

  const getPalletOffset = (index: number) => {
    const totalWidth = palletCount * palletWidth + (palletCount - 1) * PALLET_GAP;
    const startX = -totalWidth / 2 + palletWidth / 2;
    return startX + index * (palletWidth + PALLET_GAP);
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {Array.from({ length: palletCount }).map((_, palletIndex) => {
        const offsetX = getPalletOffset(palletIndex);
        const palItems = packedItems.filter(item => (item.palletIndex ?? 0) === palletIndex);

        return (
          <group key={palletIndex} position={[offsetX, 0, 0]}>
            <PalletBox pallet={pallet} />
            <MaxHeightGuide pallet={pallet} />
            {showLabels && palletCount > 1 && (
              <PalletLabel index={palletIndex} position={[0, (pallet.height + pallet.maxLoadHeight) * SCALE + 0.5, 0]} itemCount={palItems.length} />
            )}
            {palItems.map((item) => (
              <CargoBox
                key={item.uniqueId}
                item={item}
                pallet={pallet}
                isSelected={selectedItemId === item.uniqueId}
                isHovered={hoveredItemId === item.uniqueId}
                isFaded={!!selectedItemId && selectedItemId !== item.uniqueId}
                onSelect={() => onSelectItem(item.uniqueId)}
                onHover={(hovered) => onHoverItem(hovered ? item.uniqueId : null)}
                onDrag={(pos) => onItemMove(item.uniqueId, pos)}
              />
            ))}
          </group>
        );
      })}

      <OrbitControls
        makeDefault enableDamping dampingFactor={0.1} rotateSpeed={0.5} zoomSpeed={0.8} panSpeed={0.8}
        minDistance={1} maxDistance={50} maxPolarAngle={Math.PI * 0.9}
        mouseButtons={{ LEFT: undefined, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE }}
      />
    </>
  );
};

// ============ 메인 컴포넌트 ============

const PalletSimulator: React.FC<PalletSimulatorProps> = ({
  palletItems,
  setPalletItems,
  palletSize,
  setPalletSize
}) => {
  const [palletType, setPalletType] = useState<PalletType>(PalletType.KR);
  const [maxHeight, setMaxHeight] = useState(200);
  const [cargoList, setCargoList] = useState<CargoItem[]>([]);
  const [cargoListInitialized, setCargoListInitialized] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [isArranging, setIsArranging] = useState(false);
  const [noStandUp, setNoStandUp] = useState(true); // 기본값: 높이 고정
  const [showLabels, setShowLabels] = useState(true);

  // 최적화 모달 상태
  const [showOptimization, setShowOptimization] = useState(false);
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [originalItems, setOriginalItems] = useState<PackedPalletItem[]>([]);

  const [newItemName, setNewItemName] = useState('박스');
  const [newItemDims, setNewItemDims] = useState<Dimensions>({ width: 50, height: 50, length: 60 });
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemColor, setNewItemColor] = useState(DEFAULT_CARGO_COLORS[0]);

  const currentPallet = useMemo((): PalletSpec => {
    const preset = PALLET_PRESETS[palletType];
    return { ...preset, width: palletSize.width, length: palletSize.length, height: palletSize.height, maxLoadHeight: maxHeight };
  }, [palletType, palletSize, maxHeight]);

  const palletCount = useMemo(() => {
    if (palletItems.length === 0) return 1;
    return Math.max(...palletItems.map(item => item.palletIndex ?? 0)) + 1;
  }, [palletItems]);

  const stats = useMemo(() => {
    const validItems = palletItems.filter(i => !i.isOverHeight);
    const overHeightItems = palletItems.filter(i => i.isOverHeight);
    const usedVolume = validItems.reduce((acc, i) => acc + (i.dimensions.width * i.dimensions.height * i.dimensions.length), 0);
    const singlePalletVolume = currentPallet.width * currentPallet.length * currentPallet.maxLoadHeight;
    const totalAvailableVolume = singlePalletVolume * palletCount;
    const wastedVolumeM3 = (totalAvailableVolume - usedVolume) / 1000000;
    const efficiency = singlePalletVolume > 0 ? (usedVolume / singlePalletVolume) * 100 : 0;
    return { itemCount: validItems.length, overHeightCount: overHeightItems.length, efficiency, palletCount, wastedSpace: wastedVolumeM3 };
  }, [palletItems, currentPallet, palletCount]);

  // palletItems에서 cargoList 복원 (컴포넌트 재마운트 시)
  useEffect(() => {
    if (!cargoListInitialized && palletItems.length > 0 && cargoList.length === 0) {
      const groupedItems = new Map<string, CargoItem>();
      palletItems.forEach(item => {
        const key = item.id;
        if (groupedItems.has(key)) {
          const existing = groupedItems.get(key)!;
          existing.quantity += 1;
        } else {
          groupedItems.set(key, {
            id: item.id,
            name: item.name,
            dimensions: { ...item.dimensions },
            color: item.color,
            quantity: 1,
            weight: item.weight,
          });
        }
      });
      setCargoList(Array.from(groupedItems.values()));
      setCargoListInitialized(true);
    }
  }, [palletItems, cargoList.length, cargoListInitialized]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedItemId) {
        handleRemoveItem(selectedItemId);
        setSelectedItemId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId]);

  const handlePalletTypeChange = (type: PalletType) => {
    setPalletType(type);
    const preset = PALLET_PRESETS[type];
    setPalletSize({ width: preset.width, height: preset.height, length: preset.length });
  };

  // ============ 배치 로직 ============

  const MIN_SUPPORT_RATIO = 1.0;

  const calculateSupportRatio = (pos: { x: number; y: number; z: number }, dims: Dimensions, existingItems: PackedPalletItem[]): number => {
    const itemArea = dims.width * dims.length;
    if (pos.y <= 0) return 1.0;
    let supportedArea = 0;
    for (const item of existingItems) {
      const itemTop = item.position.y + item.dimensions.height;
      if (Math.abs(itemTop - pos.y) < 1) {
        const overlapLeft = Math.max(pos.x, item.position.x);
        const overlapRight = Math.min(pos.x + dims.width, item.position.x + item.dimensions.width);
        const overlapFront = Math.max(pos.z, item.position.z);
        const overlapBack = Math.min(pos.z + dims.length, item.position.z + item.dimensions.length);
        if (overlapRight > overlapLeft && overlapBack > overlapFront) {
          supportedArea += (overlapRight - overlapLeft) * (overlapBack - overlapFront);
        }
      }
    }
    return supportedArea / itemArea;
  };

  const canPlaceAt = (pos: { x: number; y: number; z: number }, dims: Dimensions, items: PackedPalletItem[]): boolean => {
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

  const getAllOrientations = (dims: Dimensions, keepHeight = false): Dimensions[] => {
    const { width: w, height: h, length: l } = dims;
    if (keepHeight || noStandUp) {
      return [{ width: w, height: h, length: l }, { width: l, height: h, length: w }];
    }
    return [
      { width: w, height: h, length: l }, { width: l, height: h, length: w },
      { width: w, height: l, length: h }, { width: h, height: l, length: w },
      { width: l, height: w, length: h }, { width: h, height: w, length: l },
    ];
  };

  const findBestPositionForPallet = (
    existingItems: PackedPalletItem[],
    dims: Dimensions,
    pallet: PalletSpec,
    scoreFunc: (pos: { x: number, y: number, z: number }, ori: Dimensions) => number = (pos) => pos.y * 10000 + pos.x + pos.z
  ): { position: { x: number; y: number; z: number }; orientation: Dimensions } | null => {
    const yLevels = new Set<number>([0]);
    for (const item of existingItems) yLevels.add(item.position.y + item.dimensions.height);

    const xzPoints: { x: number; z: number }[] = [{ x: 0, z: 0 }];
    for (const item of existingItems) {
      xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z });
      xzPoints.push({ x: item.position.x, z: item.position.z + item.dimensions.length });
      xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z + item.dimensions.length });
    }

    let bestResult: { position: { x: number; y: number; z: number }; orientation: Dimensions } | null = null;
    let bestScore = Infinity;

    const orientations = getAllOrientations(dims);
    for (const orientation of orientations) {
      if (orientation.width > pallet.width || orientation.length > pallet.length) continue;

      for (const baseY of yLevels) {
        if (baseY + orientation.height > pallet.maxLoadHeight) continue;

        for (const { x, z } of xzPoints) {
          if (x < 0 || z < 0 || x + orientation.width > pallet.width || z + orientation.length > pallet.length) continue;
          const pos = { x, y: baseY, z };
          if (!canPlaceAt(pos, orientation, existingItems)) continue;
          if (calculateSupportRatio(pos, orientation, existingItems) < MIN_SUPPORT_RATIO) continue;

          const score = scoreFunc(pos, orientation);
          if (score < bestScore) { bestScore = score; bestResult = { position: pos, orientation }; }
        }
      }
    }
    return bestResult;
  };

  const getPalletItems = (items: PackedPalletItem[], palletIdx: number) => items.filter(i => (i.palletIndex ?? 0) === palletIdx);

  const placeItemWithMultiPallet = (
    cargo: CargoItem,
    currentPackedItems: PackedPalletItem[],
    pallet: PalletSpec,
    preferredOrientation?: Dimensions,
    scoreFunc?: (pos: { x: number, y: number, z: number }, ori: Dimensions) => number
  ): { newItems: PackedPalletItem[]; placed: number } => {
    const newItems: PackedPalletItem[] = [];
    let placed = 0;
    const maxPallets = 10;

    // 팔레트는 자유 회전 허용 (컨테이너와 다름)
    const orientations = preferredOrientation ? [preferredOrientation] : getAllOrientations(cargo.dimensions);

    for (let i = 0; i < cargo.quantity; i++) {
      let itemPlaced = false;
      const allItems = [...currentPackedItems, ...newItems];

      for (let palletIdx = 0; palletIdx < maxPallets; palletIdx++) {
        const palItems = getPalletItems(allItems, palletIdx);

        let bestResult: { position: { x: number; y: number; z: number }; orientation: Dimensions } | null = null;
        let bestScore = Infinity;

        for (const ori of orientations) {
          const result = findBestPositionForPallet(palItems, ori, pallet, scoreFunc);
          if (result) {
            const score = scoreFunc ? scoreFunc(result.position, result.orientation) : result.position.y * 10000 + result.position.x;
            if (score < bestScore) { bestScore = score; bestResult = result; }
          }
        }

        if (bestResult) {
          newItems.push({
            ...cargo,
            dimensions: bestResult.orientation,
            position: bestResult.position,
            uniqueId: `${cargo.id}-${Date.now()}-${i}`,
            palletIndex: palletIdx,
            isOverHeight: bestResult.position.y + bestResult.orientation.height > pallet.maxLoadHeight
          });
          placed++;
          itemPlaced = true;
          break;
        }
      }
      if (!itemPlaced) break;
    }
    return { newItems, placed };
  };

  // ============ 최적화 전략 ============

  const runOptimizationStrategy = (
    sortedCargos: CargoItem[],
    strategyId: string,
    pallet: PalletSpec,
    scoreFunc?: (pos: { x: number, y: number, z: number }, ori: Dimensions) => number,
    noRotate = false
  ): { items: PackedPalletItem[], palletCount: number, wastedSpace: number } => {
    const arrangedItems: PackedPalletItem[] = [];

    for (const cargo of sortedCargos) {
      // 팔레트는 자유 회전 허용 (같은 그룹이어도 다른 회전 가능)
      const orientations = noRotate ? [cargo.dimensions] : getAllOrientations(cargo.dimensions);

      for (let i = 0; i < cargo.quantity; i++) {
        let placed = false;
        for (let palletIdx = 0; palletIdx < 10 && !placed; palletIdx++) {
          const palItems = getPalletItems(arrangedItems, palletIdx);

          let bestResult: { position: { x: number, y: number, z: number }; orientation: Dimensions } | null = null;
          let bestScore = Infinity;

          for (const ori of orientations) {
            if (ori.width > pallet.width || ori.length > pallet.length) continue;

            const yLevels = new Set<number>([0]);
            for (const item of palItems) yLevels.add(item.position.y + item.dimensions.height);

            const xzPoints: { x: number; z: number }[] = [{ x: 0, z: 0 }];
            for (const item of palItems) {
              xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z });
              xzPoints.push({ x: item.position.x, z: item.position.z + item.dimensions.length });
              xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z + item.dimensions.length });
            }

            for (const baseY of yLevels) {
              if (baseY + ori.height > pallet.maxLoadHeight) continue;
              for (const { x, z } of xzPoints) {
                if (x < 0 || z < 0 || x + ori.width > pallet.width || z + ori.length > pallet.length) continue;
                const pos = { x, y: baseY, z };
                if (!canPlaceAt(pos, ori, palItems)) continue;
                if (calculateSupportRatio(pos, ori, palItems) < MIN_SUPPORT_RATIO) continue;

                const score = scoreFunc ? scoreFunc(pos, ori) : pos.y * 10000 + pos.x + pos.z;
                if (score < bestScore) { bestScore = score; bestResult = { position: pos, orientation: ori }; }
              }
            }
          }

          if (bestResult) {
            arrangedItems.push({
              ...cargo,
              dimensions: bestResult.orientation,
              position: bestResult.position,
              uniqueId: `${cargo.id}-${strategyId}-${i}`,
              palletIndex: palletIdx,
              isOverHeight: false
            });
            placed = true;
          }
        }
      }
    }

    const usedPallets = arrangedItems.length > 0 ? Math.max(...arrangedItems.map(i => (i.palletIndex ?? 0))) + 1 : 1;
    // 마지막 팔레트만 낭비 계산 (높이 기준)
    const lastPalletIdx = usedPallets - 1;
    const lastPalletItems = arrangedItems.filter(i => (i.palletIndex ?? 0) === lastPalletIdx);
    const lastActualHeight = lastPalletItems.length > 0 ? Math.max(...lastPalletItems.map(i => i.position.y + i.dimensions.height)) : 0;
    const lastTotalVol = pallet.width * pallet.length * lastActualHeight;
    const lastUsedVol = lastPalletItems.reduce((acc, i) => acc + i.dimensions.width * i.dimensions.height * i.dimensions.length, 0);
    return { items: arrangedItems, palletCount: usedPallets, wastedSpace: (lastTotalVol - lastUsedVol) / 1000000 };
  };

  // 1층 패턴 생성 함수들
  const generateCornerPattern = (
    cargo: CargoItem,
    pallet: PalletSpec,
    maxItems: number
  ): PackedPalletItem[] => {
    const items: PackedPalletItem[] = [];
    const orientations = getAllOrientations(cargo.dimensions);

    for (let i = 0; i < maxItems; i++) {
      let bestResult: { position: { x: number; y: number; z: number }; orientation: Dimensions } | null = null;
      let bestScore = Infinity;

      for (const ori of orientations) {
        if (ori.width > pallet.width || ori.length > pallet.length) continue;

        const xzPoints: { x: number; z: number }[] = [{ x: 0, z: 0 }];
        for (const item of items) {
          xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z });
          xzPoints.push({ x: item.position.x, z: item.position.z + item.dimensions.length });
          xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z + item.dimensions.length });
        }

        for (const { x, z } of xzPoints) {
          if (x < 0 || z < 0 || x + ori.width > pallet.width || z + ori.length > pallet.length) continue;
          const pos = { x, y: 0, z };
          if (!canPlaceAt(pos, ori, items)) continue;

          const score = pos.z * 1000 + pos.x;
          if (score < bestScore) { bestScore = score; bestResult = { position: pos, orientation: ori }; }
        }
      }

      if (bestResult) {
        items.push({
          ...cargo,
          dimensions: bestResult.orientation,
          position: bestResult.position,
          uniqueId: `${cargo.id}-corner-${i}`,
          palletIndex: 0,
          isOverHeight: false
        });
      } else break;
    }
    return items;
  };

  // 바람개비 패턴 (Pinwheel) - 4방향 회전 배치
  const generatePinwheelPattern = (
    cargo: CargoItem,
    pallet: PalletSpec,
    maxItems: number
  ): PackedPalletItem[] => {
    const items: PackedPalletItem[] = [];
    const { width: w, length: l, height: h } = cargo.dimensions;

    // 가로/세로 두 방향 (w=x축 크기, l=z축 크기)
    const horizontal: Dimensions = { width: w, height: h, length: l };
    const vertical: Dimensions = { width: l, height: h, length: w };

    // 바람개비 한 세트 크기
    const pinwheelWidth = w + l;   // horizontal.width + vertical.width
    const pinwheelLength = l + w;  // horizontal.length + vertical.length

    // 바람개비 배치 시도 (4개 한 세트)
    const tryPinwheel = (startX: number, startZ: number): PackedPalletItem[] => {
      const pinwheelItems: PackedPalletItem[] = [];

      // 4방향 배치 위치 계산 (올바른 바람개비 형태)
      // ┌───H1──┬──V1──┐
      // │       │      │
      // ├───V2──┼──H2──┤
      // │       │      │
      // └───────┴──────┘
      const positions = [
        { x: startX, z: startZ, ori: horizontal },                     // H1: 좌상단
        { x: startX + w, z: startZ, ori: vertical },                   // V1: 우상단
        { x: startX + l, z: startZ + w, ori: horizontal },             // H2: 우하단
        { x: startX, z: startZ + l, ori: vertical },                   // V2: 좌하단
      ];

      for (const { x, z, ori } of positions) {
        if (items.length + pinwheelItems.length >= maxItems) break;
        if (x < 0 || z < 0 || x + ori.width > pallet.width || z + ori.length > pallet.length) continue;
        const pos = { x, y: 0, z };
        if (!canPlaceAt(pos, ori, [...items, ...pinwheelItems])) continue;

        pinwheelItems.push({
          ...cargo,
          dimensions: ori,
          position: pos,
          uniqueId: `${cargo.id}-pinwheel-${items.length + pinwheelItems.length}`,
          palletIndex: 0,
          isOverHeight: false
        });
      }
      return pinwheelItems;
    };

    // 팔레트 전체에 바람개비 패턴 반복
    for (let z = 0; items.length < maxItems; z += pinwheelLength) {
      if (z + pinwheelLength > pallet.length) break;
      for (let x = 0; items.length < maxItems; x += pinwheelWidth) {
        if (x + pinwheelWidth > pallet.width) break;
        const newItems = tryPinwheel(x, z);
        items.push(...newItems);
      }
    }

    // 남은 공간 채우기 (빈틈에 추가 배치)
    if (items.length < maxItems) {
      for (const ori of [horizontal, vertical]) {
        if (items.length >= maxItems) break;
        for (let z = 0; z + ori.length <= pallet.length && items.length < maxItems; z += ori.length) {
          for (let x = 0; x + ori.width <= pallet.width && items.length < maxItems; x += ori.width) {
            const pos = { x, y: 0, z };
            if (canPlaceAt(pos, ori, items)) {
              items.push({
                ...cargo,
                dimensions: ori,
                position: pos,
                uniqueId: `${cargo.id}-pinwheel-fill-${items.length}`,
                palletIndex: 0,
                isOverHeight: false
              });
            }
          }
        }
      }
    }

    return items;
  };

  // 바람개비 2 패턴 - 가운데 빈 공간에 세워서 넣기
  const generatePinwheel2Pattern = (
    cargo: CargoItem,
    pallet: PalletSpec,
    maxItems: number
  ): PackedPalletItem[] => {
    const items: PackedPalletItem[] = [];
    const { width: w, length: l, height: h } = cargo.dimensions;

    // 가로/세로 두 방향 (바닥에 눕힌 상태)
    const horizontal: Dimensions = { width: w, height: h, length: l };
    const vertical: Dimensions = { width: l, height: h, length: w };

    // 세워서 넣는 방향들 (높이가 바닥 차원이 됨)
    const standingOrientations: Dimensions[] = [
      { width: w, height: l, length: h },   // w x h 바닥, l 높이
      { width: h, height: l, length: w },   // h x w 바닥, l 높이
      { width: l, height: w, length: h },   // l x h 바닥, w 높이
      { width: h, height: w, length: l },   // h x l 바닥, w 높이
    ];

    // 바람개비 한 세트 크기
    const pinwheelWidth = w + l;
    const pinwheelLength = l + w;

    // 가운데 빈 공간 크기 계산
    const centerSize = Math.abs(l - w);
    const centerOffsetX = Math.min(w, l);
    const centerOffsetZ = Math.min(w, l);

    // 바람개비 배치 + 가운데 세워넣기 시도
    const tryPinwheelWithCenter = (startX: number, startZ: number): PackedPalletItem[] => {
      const pinwheelItems: PackedPalletItem[] = [];

      // 4방향 배치 (바람개비 기본)
      const positions = [
        { x: startX, z: startZ, ori: horizontal },
        { x: startX + w, z: startZ, ori: vertical },
        { x: startX + l, z: startZ + w, ori: horizontal },
        { x: startX, z: startZ + l, ori: vertical },
      ];

      for (const { x, z, ori } of positions) {
        if (items.length + pinwheelItems.length >= maxItems) break;
        if (x < 0 || z < 0 || x + ori.width > pallet.width || z + ori.length > pallet.length) continue;
        const pos = { x, y: 0, z };
        if (!canPlaceAt(pos, ori, [...items, ...pinwheelItems])) continue;

        pinwheelItems.push({
          ...cargo,
          dimensions: ori,
          position: pos,
          uniqueId: `${cargo.id}-pinwheel2-${items.length + pinwheelItems.length}`,
          palletIndex: 0,
          isOverHeight: false
        });
      }

      // 가운데 빈 공간에 세워서 넣기 시도
      if (centerSize > 0 && items.length + pinwheelItems.length < maxItems) {
        const centerX = startX + centerOffsetX;
        const centerZ = startZ + centerOffsetZ;

        // 세운 방향 중 가운데에 맞는 것 찾기
        for (const standingOri of standingOrientations) {
          if (standingOri.width <= centerSize && standingOri.length <= centerSize) {
            // 가운데에 들어갈 수 있음
            if (standingOri.height <= pallet.maxLoadHeight) {
              const centerPos = { x: centerX, y: 0, z: centerZ };
              if (canPlaceAt(centerPos, standingOri, [...items, ...pinwheelItems])) {
                pinwheelItems.push({
                  ...cargo,
                  dimensions: standingOri,
                  position: centerPos,
                  uniqueId: `${cargo.id}-pinwheel2-center-${items.length + pinwheelItems.length}`,
                  palletIndex: 0,
                  isOverHeight: standingOri.height > pallet.maxLoadHeight
                });
                break;
              }
            }
          }
        }
      }

      return pinwheelItems;
    };

    // 팔레트 전체에 바람개비 2 패턴 반복
    for (let z = 0; items.length < maxItems; z += pinwheelLength) {
      if (z + pinwheelLength > pallet.length) break;
      for (let x = 0; items.length < maxItems; x += pinwheelWidth) {
        if (x + pinwheelWidth > pallet.width) break;
        const newItems = tryPinwheelWithCenter(x, z);
        items.push(...newItems);
      }
    }

    // 남은 공간 채우기
    if (items.length < maxItems) {
      const allOris = [horizontal, vertical, ...standingOrientations];
      for (const ori of allOris) {
        if (items.length >= maxItems) break;
        if (ori.height > pallet.maxLoadHeight) continue;
        for (let z = 0; z + ori.length <= pallet.length && items.length < maxItems; z += ori.length) {
          for (let x = 0; x + ori.width <= pallet.width && items.length < maxItems; x += ori.width) {
            const pos = { x, y: 0, z };
            if (canPlaceAt(pos, ori, items)) {
              items.push({
                ...cargo,
                dimensions: ori,
                position: pos,
                uniqueId: `${cargo.id}-pinwheel2-fill-${items.length}`,
                palletIndex: 0,
                isOverHeight: false
              });
            }
          }
        }
      }
    }

    return items;
  };

  // 인터락 패턴 (Interlock) - 홀수/짝수 행 교차
  const generateInterlockPattern = (
    cargo: CargoItem,
    pallet: PalletSpec,
    maxItems: number
  ): PackedPalletItem[] => {
    const { width: w, length: l, height: h } = cargo.dimensions;
    const horizontal: Dimensions = { width: w, height: h, length: l };
    const vertical: Dimensions = { width: l, height: h, length: w };

    // 두 가지 시작 방향 시도 (가로 먼저 vs 세로 먼저)
    const tryInterlock = (startHorizontal: boolean): PackedPalletItem[] => {
      const items: PackedPalletItem[] = [];
      let row = 0;
      let z = 0;

      while (z < pallet.length && items.length < maxItems) {
        const useHorizontal = startHorizontal ? (row % 2 === 0) : (row % 2 === 1);
        const ori = useHorizontal ? horizontal : vertical;
        let x = 0;

        // 각 행에서 박스 배치
        while (x + ori.width <= pallet.width && z + ori.length <= pallet.length && items.length < maxItems) {
          const pos = { x, y: 0, z };
          if (canPlaceAt(pos, ori, items)) {
            items.push({
              ...cargo,
              dimensions: ori,
              position: pos,
              uniqueId: `${cargo.id}-interlock-${items.length}`,
              palletIndex: 0,
              isOverHeight: false
            });
          }
          x += ori.width;
        }

        z += ori.length;
        row++;
      }
      return items;
    };

    // 두 방향 모두 시도해서 더 많이 담기는 것 선택
    const horizontalFirst = tryInterlock(true);
    const verticalFirst = tryInterlock(false);

    return horizontalFirst.length >= verticalFirst.length ? horizontalFirst : verticalFirst;
  };

  // 바스켓 위브 패턴 (Basket Weave) - 블록 단위로 가로/세로 교차 반복
  const generateBasketWeavePattern = (
    cargo: CargoItem,
    pallet: PalletSpec,
    maxItems: number
  ): PackedPalletItem[] => {
    const items: PackedPalletItem[] = [];
    const { width: w, length: l, height: h } = cargo.dimensions;

    const horizontal: Dimensions = { width: w, height: h, length: l };
    const vertical: Dimensions = { width: l, height: h, length: w };

    // 블록 크기: 박스 2개분 (가로 2개 또는 세로 2개가 들어갈 크기)
    // 가로 블록: w × 2l (가로 박스 2개 세로로 쌓기)
    // 세로 블록: 2l × w (세로 박스 2개 가로로 나열) 또는 l × 2w (세로로 쌓기)
    // 공통 블록 크기로 통일
    const blockWidth = w + l;   // 가로+세로 너비
    const blockLength = l + w;  // 가로+세로 길이

    // 블록 내에서 해당 방향으로 채우기
    const fillBlock = (
      startX: number, startZ: number,
      endX: number, endZ: number,
      ori: Dimensions
    ) => {
      for (let z = startZ; z + ori.length <= endZ && items.length < maxItems; z += ori.length) {
        for (let x = startX; x + ori.width <= endX && items.length < maxItems; x += ori.width) {
          const pos = { x, y: 0, z };
          if (canPlaceAt(pos, ori, items)) {
            items.push({
              ...cargo,
              dimensions: ori,
              position: pos,
              uniqueId: `${cargo.id}-basket-${items.length}`,
              palletIndex: 0,
              isOverHeight: false
            });
          }
        }
      }
    };

    // 블록 단위로 반복 (체크무늬처럼 방향 교차)
    // ┌─H─┬─V─┬─H─┬─V─┐
    // ├─V─┼─H─┼─V─┼─H─┤
    // ├─H─┼─V─┼─H─┼─V─┤
    // └───┴───┴───┴───┘
    let blockRow = 0;
    for (let z = 0; z < pallet.length && items.length < maxItems; z += blockLength) {
      let blockCol = 0;
      for (let x = 0; x < pallet.width && items.length < maxItems; x += blockWidth) {
        const useHorizontal = (blockRow + blockCol) % 2 === 0;
        const ori = useHorizontal ? horizontal : vertical;
        const endX = Math.min(x + blockWidth, pallet.width);
        const endZ = Math.min(z + blockLength, pallet.length);
        fillBlock(x, z, endX, endZ, ori);
        blockCol++;
      }
      blockRow++;
    }

    // 남은 빈틈 채우기
    if (items.length < maxItems) {
      for (const ori of [horizontal, vertical]) {
        if (items.length >= maxItems) break;
        for (let z = 0; z + ori.length <= pallet.length && items.length < maxItems; z += ori.length) {
          for (let x = 0; x + ori.width <= pallet.width && items.length < maxItems; x += ori.width) {
            const pos = { x, y: 0, z };
            if (canPlaceAt(pos, ori, items)) {
              items.push({
                ...cargo,
                dimensions: ori,
                position: pos,
                uniqueId: `${cargo.id}-basket-fill-${items.length}`,
                palletIndex: 0,
                isOverHeight: false
              });
            }
          }
        }
      }
    }

    return items;
  };

  // 바람개비+ 전략: 바람개비 전체 쌓고 나서 가운데 세워넣기
  const runPinwheel2Strategy = (
    cargo: CargoItem,
    pallet: PalletSpec,
    totalQty: number
  ): { items: PackedPalletItem[], palletCount: number, wastedSpace: number } => {
    const { width: w, length: l, height: h } = cargo.dimensions;

    // 1단계: 일반 바람개비 패턴으로 전체 쌓기
    const horizontal: Dimensions = { width: w, height: h, length: l };
    const vertical: Dimensions = { width: l, height: h, length: w };

    const pinwheelWidth = w + l;
    const pinwheelLength = l + w;
    const layerHeight = h; // 눕힌 상태 높이

    // 가운데 빈 공간 정보
    const centerSize = Math.abs(l - w);
    const centerOffsetX = Math.min(w, l);
    const centerOffsetZ = Math.min(w, l);

    // 세워서 넣는 방향들
    const standingOrientations: Dimensions[] = [
      { width: w, height: l, length: h },
      { width: h, height: l, length: w },
      { width: l, height: w, length: h },
      { width: h, height: w, length: l },
    ].filter(ori => ori.height <= pallet.maxLoadHeight);

    const allItems: PackedPalletItem[] = [];
    let remainingQty = totalQty;

    // 팔레트별로 처리
    for (let palletIdx = 0; palletIdx < 10 && remainingQty > 0; palletIdx++) {
      const maxLayers = Math.floor(pallet.maxLoadHeight / layerHeight);

      // 1층 바람개비 패턴 생성 (가운데 제외)
      const firstLayerPositions: { x: number; z: number; ori: Dimensions }[] = [];

      for (let pz = 0; pz + pinwheelLength <= pallet.length; pz += pinwheelLength) {
        for (let px = 0; px + pinwheelWidth <= pallet.width; px += pinwheelWidth) {
          firstLayerPositions.push({ x: px, z: pz, ori: horizontal });
          firstLayerPositions.push({ x: px + w, z: pz, ori: vertical });
          firstLayerPositions.push({ x: px + l, z: pz + w, ori: horizontal });
          firstLayerPositions.push({ x: px, z: pz + l, ori: vertical });
        }
      }

      // 바람개비 패턴이 안 맞으면 (블록이 팔레트보다 큼) 일반 배치로 대체
      if (firstLayerPositions.length === 0) {
        // 가로/세로 방향 중 더 많이 들어가는 방향으로 채우기
        const hCount = Math.floor(pallet.width / horizontal.width) * Math.floor(pallet.length / horizontal.length);
        const vCount = Math.floor(pallet.width / vertical.width) * Math.floor(pallet.length / vertical.length);
        const bestOri = hCount >= vCount ? horizontal : vertical;

        for (let z = 0; z + bestOri.length <= pallet.length; z += bestOri.length) {
          for (let x = 0; x + bestOri.width <= pallet.width; x += bestOri.width) {
            firstLayerPositions.push({ x, z, ori: bestOri });
          }
        }
      }

      // 모든 레이어 쌓기 (바람개비만)
      for (let layer = 0; layer < maxLayers && remainingQty > 0; layer++) {
        const layerY = layer * layerHeight;

        for (const pos of firstLayerPositions) {
          if (remainingQty <= 0) break;
          if (pos.x + pos.ori.width > pallet.width || pos.z + pos.ori.length > pallet.length) continue;

          allItems.push({
            ...cargo,
            dimensions: pos.ori,
            position: { x: pos.x, y: layerY, z: pos.z },
            uniqueId: `${cargo.id}-pw2-${palletIdx}-${layer}-${allItems.length}`,
            palletIndex: palletIdx,
            isOverHeight: false
          });
          remainingQty--;
        }
      }

      // 2단계: 가운데 빈 공간에 세워서 최대한 채우기 (여러 층)
      if (centerSize > 0 && remainingQty > 0) {
        // 가운데에 맞는 세운 방향 찾기
        const fittingStanding = standingOrientations.find(
          ori => ori.width <= centerSize && ori.length <= centerSize
        );

        if (fittingStanding) {
          // 가운데 박스 몇 층까지 쌓을 수 있는지
          const centerMaxLayers = Math.floor(pallet.maxLoadHeight / fittingStanding.height);

          // 각 바람개비 세트의 가운데 위치들
          for (let pz = 0; pz + pinwheelLength <= pallet.length && remainingQty > 0; pz += pinwheelLength) {
            for (let px = 0; px + pinwheelWidth <= pallet.width && remainingQty > 0; px += pinwheelWidth) {
              const centerStartX = px + centerOffsetX;
              const centerStartZ = pz + centerOffsetZ;

              // 가운데 영역 내에서 그리드로 채우기 + 여러 층
              for (let centerLayer = 0; centerLayer < centerMaxLayers && remainingQty > 0; centerLayer++) {
                const centerY = centerLayer * fittingStanding.height;

                for (let cz = centerStartZ; cz + fittingStanding.length <= centerStartZ + centerSize && remainingQty > 0; cz += fittingStanding.length) {
                  for (let cx = centerStartX; cx + fittingStanding.width <= centerStartX + centerSize && remainingQty > 0; cx += fittingStanding.width) {
                    // 팔레트 범위 체크
                    if (cx + fittingStanding.width > pallet.width || cz + fittingStanding.length > pallet.length) continue;
                    if (centerY + fittingStanding.height > pallet.maxLoadHeight) continue;

                    const centerPos = { x: cx, y: centerY, z: cz };

                    // 충돌 체크
                    const hasCollision = allItems
                      .filter(i => i.palletIndex === palletIdx)
                      .some(item => {
                        return !(centerPos.x >= item.position.x + item.dimensions.width ||
                                 centerPos.x + fittingStanding.width <= item.position.x ||
                                 centerPos.z >= item.position.z + item.dimensions.length ||
                                 centerPos.z + fittingStanding.length <= item.position.z ||
                                 centerY >= item.position.y + item.dimensions.height ||
                                 centerY + fittingStanding.height <= item.position.y);
                      });

                    if (!hasCollision) {
                      allItems.push({
                        ...cargo,
                        dimensions: fittingStanding,
                        position: centerPos,
                        uniqueId: `${cargo.id}-pw2-center-${palletIdx}-${centerLayer}-${allItems.length}`,
                        palletIndex: palletIdx,
                        isOverHeight: false
                      });
                      remainingQty--;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const usedPallets = allItems.length > 0 ? Math.max(...allItems.map(i => (i.palletIndex ?? 0))) + 1 : 1;
    // 마지막 팔레트만 낭비 계산 (높이 기준)
    const lastPalletIdx = usedPallets - 1;
    const lastPalletItems = allItems.filter(i => (i.palletIndex ?? 0) === lastPalletIdx);
    const lastActualHeight = lastPalletItems.length > 0 ? Math.max(...lastPalletItems.map(i => i.position.y + i.dimensions.height)) : 0;
    const lastTotalVol = pallet.width * pallet.length * lastActualHeight;
    const lastUsedVol = lastPalletItems.reduce((acc, i) => acc + i.dimensions.width * i.dimensions.height * i.dimensions.length, 0);
    return { items: allItems, palletCount: usedPallets, wastedSpace: (lastTotalVol - lastUsedVol) / 1000000 };
  };

  // 특정 패턴으로 레이어 반복 전략 실행
  const runLayerPatternStrategy = (
    cargos: CargoItem[],
    pallet: PalletSpec,
    patternType: 'corner' | 'pinwheel' | 'pinwheel2' | 'interlock' | 'basket'
  ): { items: PackedPalletItem[], palletCount: number, wastedSpace: number } => {
    // 단일 화물 종류일 때
    if (cargos.length === 1) {
      const cargo = cargos[0];
      const totalQty = cargo.quantity;

      // 높이 고정/변경 둘 다 시도해서 더 나은 것 선택
      const tryWithHeightMode = (keepHeight: boolean) => {
        // 높이 고정 모드용 cargo (getAllOrientations에서 사용)
        const modifiedCargo = keepHeight ? {
          ...cargo,
          _keepHeight: true // 내부 플래그
        } : cargo;

        // 지정된 패턴으로 1층 생성
        let firstLayerItems: PackedPalletItem[];
        switch (patternType) {
          case 'pinwheel':
            firstLayerItems = generatePinwheelPattern(modifiedCargo as CargoItem, pallet, totalQty);
            break;
          case 'pinwheel2':
            // pinwheel2는 tryWithHeightMode에서 처리하지 않음 (별도 전략)
            return runPinwheel2Strategy(cargo, pallet, totalQty);
          case 'interlock':
            firstLayerItems = generateInterlockPattern(modifiedCargo as CargoItem, pallet, totalQty);
            break;
          case 'basket':
            firstLayerItems = generateBasketWeavePattern(modifiedCargo as CargoItem, pallet, totalQty);
            break;
          case 'corner':
          default:
            firstLayerItems = generateCornerPatternFixed(cargo, pallet, totalQty, keepHeight);
            break;
        }

        if (firstLayerItems.length === 0) {
          return { items: [] as PackedPalletItem[], palletCount: 1, wastedSpace: pallet.width * pallet.length * pallet.maxLoadHeight / 1000000 };
        }

        // 1층에서 가장 높은 아이템 높이로 레이어 계산
        const layerHeight = Math.max(...firstLayerItems.map(i => i.dimensions.height));
        const maxLayers = Math.floor(pallet.maxLoadHeight / layerHeight);

        const allItems: PackedPalletItem[] = [];
        let remainingQty = totalQty;
        let palletIdx = 0;

        while (remainingQty > 0 && palletIdx < 10) {
          for (let layer = 0; layer < maxLayers && remainingQty > 0; layer++) {
            const layerY = layer * layerHeight;
            if (layerY + layerHeight > pallet.maxLoadHeight) break;

            for (const item of firstLayerItems) {
              if (remainingQty <= 0) break;
              // 각 아이템의 실제 높이에 맞춰 y 위치 조정 (바닥에 붙이기)
              allItems.push({
                ...item,
                position: { ...item.position, y: layerY },
                uniqueId: `${item.id}-${patternType}-${palletIdx}-${layer}-${allItems.length}`,
                palletIndex: palletIdx
              });
              remainingQty--;
            }
          }
          palletIdx++;
        }

        const usedPallets = allItems.length > 0 ? Math.max(...allItems.map(i => (i.palletIndex ?? 0))) + 1 : 1;
        // 마지막 팔레트만 낭비 계산 (높이 기준)
        const lastPalletIdx = usedPallets - 1;
        const lastPalletItems = allItems.filter(i => (i.palletIndex ?? 0) === lastPalletIdx);
        const lastActualHeight = lastPalletItems.length > 0 ? Math.max(...lastPalletItems.map(i => i.position.y + i.dimensions.height)) : 0;
        const lastTotalVol = pallet.width * pallet.length * lastActualHeight;
        const lastUsedVol = lastPalletItems.reduce((acc, i) => acc + i.dimensions.width * i.dimensions.height * i.dimensions.length, 0);
        return { items: allItems, palletCount: usedPallets, wastedSpace: (lastTotalVol - lastUsedVol) / 1000000 };
      };

      // 높이 고정 모드와 높이 변경 모드 둘 다 시도
      const resultFixed = tryWithHeightMode(true);
      const resultVariable = tryWithHeightMode(false);

      // 더 많이 담기는 쪽 선택 (같으면 낭비 적은 쪽)
      if (resultFixed.items.length > resultVariable.items.length) {
        return resultFixed;
      } else if (resultVariable.items.length > resultFixed.items.length) {
        return resultVariable;
      } else {
        return resultFixed.wastedSpace <= resultVariable.wastedSpace ? resultFixed : resultVariable;
      }
    }

    // 여러 화물 종류일 때는 같은 크기끼리 묶어서 해당 패턴 적용
    // 크기별로 그룹화하여 수량 합산
    const groupedBySize: Map<string, CargoItem> = new Map();
    for (const cargo of cargos) {
      const key = `${cargo.dimensions.width}-${cargo.dimensions.height}-${cargo.dimensions.length}`;
      if (groupedBySize.has(key)) {
        const existing = groupedBySize.get(key)!;
        existing.quantity += cargo.quantity;
      } else {
        groupedBySize.set(key, { ...cargo });
      }
    }
    const mergedCargos = Array.from(groupedBySize.values());

    const allItems: PackedPalletItem[] = [];
    let palletIdx = 0;
    let currentY = 0;

    for (const cargo of mergedCargos) {
      if (cargo.quantity <= 0) continue;

      // 해당 패턴으로 1층 생성
      let firstLayerItems: PackedPalletItem[];
      switch (patternType) {
        case 'pinwheel':
        case 'pinwheel2':
          firstLayerItems = generatePinwheelPattern(cargo, pallet, cargo.quantity);
          break;
        case 'interlock':
          firstLayerItems = generateInterlockPattern(cargo, pallet, cargo.quantity);
          break;
        case 'basket':
          firstLayerItems = generateBasketWeavePattern(cargo, pallet, cargo.quantity);
          break;
        case 'corner':
        default:
          firstLayerItems = generateCornerPatternFixed(cargo, pallet, cargo.quantity, true);
          break;
      }

      if (firstLayerItems.length === 0) continue;

      const layerHeight = Math.max(...firstLayerItems.map(i => i.dimensions.height));
      const itemsPerLayer = firstLayerItems.length;
      let remainingQty = cargo.quantity;

      while (remainingQty > 0 && palletIdx < 10) {
        if (currentY + layerHeight > pallet.maxLoadHeight) {
          palletIdx++;
          currentY = 0;
        }

        for (const item of firstLayerItems) {
          if (remainingQty <= 0) break;
          allItems.push({
            ...item,
            position: { ...item.position, y: currentY },
            uniqueId: `${cargo.id}-${patternType}-${palletIdx}-${allItems.length}`,
            palletIndex: palletIdx
          });
          remainingQty--;
        }

        currentY += layerHeight;
      }

      // 한 종류 끝나면 새 팔레트에서 다음 종류 시작
      if (currentY > 0) {
        palletIdx++;
        currentY = 0;
      }
    }

    const usedPallets = allItems.length > 0 ? Math.max(...allItems.map(i => (i.palletIndex ?? 0))) + 1 : 1;
    // 마지막 팔레트만 낭비 계산 (높이 기준)
    const lastPalletIdx = usedPallets - 1;
    const lastPalletItems = allItems.filter(i => (i.palletIndex ?? 0) === lastPalletIdx);
    const lastActualHeight = lastPalletItems.length > 0 ? Math.max(...lastPalletItems.map(i => i.position.y + i.dimensions.height)) : 0;
    const lastTotalVol = pallet.width * pallet.length * lastActualHeight;
    const lastUsedVol = lastPalletItems.reduce((acc, i) => acc + i.dimensions.width * i.dimensions.height * i.dimensions.length, 0);

    return { items: allItems, palletCount: usedPallets, wastedSpace: (lastTotalVol - lastUsedVol) / 1000000 };
  };

  // 코너 패턴 (높이 고정 옵션 지원)
  const generateCornerPatternFixed = (
    cargo: CargoItem,
    pallet: PalletSpec,
    maxItems: number,
    keepHeight: boolean
  ): PackedPalletItem[] => {
    const items: PackedPalletItem[] = [];
    const orientations = getAllOrientations(cargo.dimensions, keepHeight);

    for (let i = 0; i < maxItems; i++) {
      let bestResult: { position: { x: number; y: number; z: number }; orientation: Dimensions } | null = null;
      let bestScore = Infinity;

      for (const ori of orientations) {
        if (ori.width > pallet.width || ori.length > pallet.length) continue;
        if (ori.height > pallet.maxLoadHeight) continue;

        const xzPoints: { x: number; z: number }[] = [{ x: 0, z: 0 }];
        for (const item of items) {
          xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z });
          xzPoints.push({ x: item.position.x, z: item.position.z + item.dimensions.length });
          xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z + item.dimensions.length });
        }

        for (const { x, z } of xzPoints) {
          if (x < 0 || z < 0 || x + ori.width > pallet.width || z + ori.length > pallet.length) continue;
          const pos = { x, y: 0, z };
          if (!canPlaceAt(pos, ori, items)) continue;

          const score = pos.z * 1000 + pos.x;
          if (score < bestScore) { bestScore = score; bestResult = { position: pos, orientation: ori }; }
        }
      }

      if (bestResult) {
        items.push({
          ...cargo,
          dimensions: bestResult.orientation,
          position: bestResult.position,
          uniqueId: `${cargo.id}-corner-${i}`,
          palletIndex: 0,
          isOverHeight: false
        });
      } else break;
    }
    return items;
  };

  // 레이어 반복 전략: 여러 1층 패턴 시도 후 최적 선택 (여러 화물용)
  const runLayerRepeatStrategy = (
    cargos: CargoItem[],
    pallet: PalletSpec
  ): { items: PackedPalletItem[], palletCount: number, wastedSpace: number } => {
    // 단일 화물 종류일 때만 특수 패턴 적용
    if (cargos.length === 1) {
      const cargo = cargos[0];
      const totalQty = cargo.quantity;

      // 여러 패턴 시도
      const patterns = [
        { name: 'corner', items: generateCornerPattern(cargo, pallet, totalQty) },
        { name: 'pinwheel', items: generatePinwheelPattern(cargo, pallet, totalQty) },
        { name: 'interlock', items: generateInterlockPattern(cargo, pallet, totalQty) },
      ];

      // 1층에 가장 많이 들어가는 패턴 선택
      let bestPattern = patterns[0];
      for (const pattern of patterns) {
        if (pattern.items.length > bestPattern.items.length) {
          bestPattern = pattern;
        }
      }

      if (bestPattern.items.length === 0) {
        return { items: [], palletCount: 1, wastedSpace: pallet.width * pallet.length * pallet.maxLoadHeight / 1000000 };
      }

      // 1층 높이 계산 및 레이어 반복
      const layerHeight = Math.max(...bestPattern.items.map(i => i.dimensions.height));
      const maxLayers = Math.floor(pallet.maxLoadHeight / layerHeight);
      const itemsPerLayer = bestPattern.items.length;

      const allItems: PackedPalletItem[] = [];
      let remainingQty = totalQty;
      let palletIdx = 0;

      while (remainingQty > 0 && palletIdx < 10) {
        for (let layer = 0; layer < maxLayers && remainingQty > 0; layer++) {
          const layerY = layer * layerHeight;
          if (layerY + layerHeight > pallet.maxLoadHeight) break;

          for (const item of bestPattern.items) {
            if (remainingQty <= 0) break;
            allItems.push({
              ...item,
              position: { ...item.position, y: layerY },
              uniqueId: `${item.id}-layer-${palletIdx}-${layer}-${allItems.length}`,
              palletIndex: palletIdx
            });
            remainingQty--;
          }
        }
        palletIdx++;
      }

      const usedPallets = allItems.length > 0 ? Math.max(...allItems.map(i => (i.palletIndex ?? 0))) + 1 : 1;
      // 마지막 팔레트만 낭비 계산 (높이 기준)
      const lastPalletIdx = usedPallets - 1;
      const lastPalletItems = allItems.filter(i => (i.palletIndex ?? 0) === lastPalletIdx);
      const lastActualHeight = lastPalletItems.length > 0 ? Math.max(...lastPalletItems.map(i => i.position.y + i.dimensions.height)) : 0;
      const lastTotalVol = pallet.width * pallet.length * lastActualHeight;
      const lastUsedVol = lastPalletItems.reduce((acc, i) => acc + i.dimensions.width * i.dimensions.height * i.dimensions.length, 0);
      return { items: allItems, palletCount: usedPallets, wastedSpace: (lastTotalVol - lastUsedVol) / 1000000 };
    }

    // 여러 화물 종류일 때 - 같은 종류끼리 묶어서 순차 처리
    const allItems: PackedPalletItem[] = [];
    let remainingCargos = cargos.map(c => ({ ...c }));
    let palletIdx = 0;
    let currentY = 0; // 현재 팔레트에서의 Y 위치

    // 화물 종류별로 순차 처리
    for (const cargo of remainingCargos) {
      if (cargo.quantity <= 0) continue;

      // 이 화물의 1층 패턴 생성
      const firstLayerItems: PackedPalletItem[] = [];
      for (let i = 0; i < cargo.quantity; i++) {
        let bestResult: { position: { x: number; y: number; z: number }; orientation: Dimensions } | null = null;
        let bestScore = Infinity;

        for (const ori of getAllOrientations(cargo.dimensions)) {
          if (ori.width > pallet.width || ori.length > pallet.length) continue;

          const xzPoints: { x: number; z: number }[] = [{ x: 0, z: 0 }];
          for (const item of firstLayerItems) {
            xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z });
            xzPoints.push({ x: item.position.x, z: item.position.z + item.dimensions.length });
            xzPoints.push({ x: item.position.x + item.dimensions.width, z: item.position.z + item.dimensions.length });
          }

          for (const { x, z } of xzPoints) {
            if (x < 0 || z < 0 || x + ori.width > pallet.width || z + ori.length > pallet.length) continue;
            const pos = { x, y: 0, z };
            if (!canPlaceAt(pos, ori, firstLayerItems)) continue;

            const score = pos.z * 1000 + pos.x;
            if (score < bestScore) { bestScore = score; bestResult = { position: pos, orientation: ori }; }
          }
        }

        if (bestResult) {
          firstLayerItems.push({
            ...cargo,
            dimensions: bestResult.orientation,
            position: bestResult.position,
            uniqueId: `temp-${i}`,
            palletIndex: 0,
            isOverHeight: false
          });
        } else break;
      }

      if (firstLayerItems.length === 0) continue;

      const layerHeight = Math.max(...firstLayerItems.map(i => i.dimensions.height));
      const itemsPerLayer = firstLayerItems.length;
      let remainingQty = cargo.quantity;

      // 한 층씩 쌓기
      while (remainingQty > 0 && palletIdx < 10) {
        // 현재 팔레트에 공간 확인
        if (currentY + layerHeight > pallet.maxLoadHeight) {
          palletIdx++;
          currentY = 0;
        }

        // 한 층 쌓기
        for (const item of firstLayerItems) {
          if (remainingQty <= 0) break;
          allItems.push({
            ...item,
            position: { ...item.position, y: currentY },
            uniqueId: `${cargo.id}-layer-${palletIdx}-${allItems.length}`,
            palletIndex: palletIdx
          });
          remainingQty--;
        }

        currentY += layerHeight;
      }
    }

    const usedPallets = allItems.length > 0 ? Math.max(...allItems.map(i => (i.palletIndex ?? 0))) + 1 : 1;
    // 마지막 팔레트만 낭비 계산 (높이 기준)
    const lastPalletIdx = usedPallets - 1;
    const lastPalletItems = allItems.filter(i => (i.palletIndex ?? 0) === lastPalletIdx);
    const lastActualHeight = lastPalletItems.length > 0 ? Math.max(...lastPalletItems.map(i => i.position.y + i.dimensions.height)) : 0;
    const lastTotalVol = pallet.width * pallet.length * lastActualHeight;
    const lastUsedVol = lastPalletItems.reduce((acc, i) => acc + i.dimensions.width * i.dimensions.height * i.dimensions.length, 0);
    return { items: allItems, palletCount: usedPallets, wastedSpace: (lastTotalVol - lastUsedVol) / 1000000 };
  };

  const calculateStrategies = () => {
    if (cargoList.length === 0) return;

    setIsCalculating(true);
    setOriginalItems([...palletItems]);

    setTimeout(() => {
      const volumeSorted = [...cargoList].sort((a, b) => {
        const volA = a.dimensions.width * a.dimensions.height * a.dimensions.length;
        const volB = b.dimensions.width * b.dimensions.height * b.dimensions.length;
        return volB - volA;
      });

      const weightSorted = [...cargoList].sort((a, b) => (b.weight || 0) - (a.weight || 0));
      const heightSorted = [...cargoList].sort((a, b) => a.dimensions.height - b.dimensions.height);

      // 레이어 패턴별 전략 실행
      const layerCornerResult = runLayerPatternStrategy(volumeSorted, currentPallet, 'corner');
      const layerPinwheelResult = runLayerPatternStrategy(volumeSorted, currentPallet, 'pinwheel');
      const layerPinwheel2Result = runLayerPatternStrategy(volumeSorted, currentPallet, 'pinwheel2');
      const layerInterlockResult = runLayerPatternStrategy(volumeSorted, currentPallet, 'interlock');
      const layerBasketResult = runLayerPatternStrategy(volumeSorted, currentPallet, 'basket');

      // 기존 전략 (팔레트에 유용한 것만)
      const volumeResult = runOptimizationStrategy(volumeSorted, 'volume', currentPallet);
      const noRotateResult = runOptimizationStrategy(volumeSorted, 'norotate', currentPallet, undefined, true);

      const totalItems = cargoList.reduce((sum, c) => sum + c.quantity, 0);

      const newStrategies: OptimizationStrategy[] = [
        { id: 'layer-corner', name: '코너 적재', description: '모서리부터 순서대로', icon: '📐', result: layerCornerResult.items, itemCount: layerCornerResult.items.length, palletCount: layerCornerResult.palletCount, wastedSpace: layerCornerResult.wastedSpace },
        { id: 'layer-pinwheel', name: '바람개비', description: '회전 맞물림 패턴', icon: '🔄', result: layerPinwheelResult.items, itemCount: layerPinwheelResult.items.length, palletCount: layerPinwheelResult.palletCount, wastedSpace: layerPinwheelResult.wastedSpace },
        { id: 'layer-pinwheel2', name: '바람개비+', description: '가운데 세워넣기', icon: '🎯', result: layerPinwheel2Result.items, itemCount: layerPinwheel2Result.items.length, palletCount: layerPinwheel2Result.palletCount, wastedSpace: layerPinwheel2Result.wastedSpace },
        { id: 'layer-interlock', name: '인터락', description: '행 교차 패턴', icon: '🧩', result: layerInterlockResult.items, itemCount: layerInterlockResult.items.length, palletCount: layerInterlockResult.palletCount, wastedSpace: layerInterlockResult.wastedSpace },
        { id: 'layer-basket', name: '바스켓 위브', description: '블록 교차 반복', icon: '🧺', result: layerBasketResult.items, itemCount: layerBasketResult.items.length, palletCount: layerBasketResult.palletCount, wastedSpace: layerBasketResult.wastedSpace },
        { id: 'volume', name: '부피 우선', description: '큰 화물부터 배치', icon: '📦', result: volumeResult.items, itemCount: volumeResult.items.length, palletCount: volumeResult.palletCount, wastedSpace: volumeResult.wastedSpace },
        { id: 'norotate', name: '회전 금지', description: '원래 방향 유지', icon: '🔒', result: noRotateResult.items, itemCount: noRotateResult.items.length, palletCount: noRotateResult.palletCount, wastedSpace: noRotateResult.wastedSpace },
      ];

      const preferredOrder = ['layer-pinwheel2', 'layer-pinwheel', 'layer-interlock', 'layer-corner', 'layer-basket', 'norotate'];
      newStrategies.sort((a, b) => {
        // 1순위: 배치 개수 (많을수록 좋음)
        if (a.itemCount !== b.itemCount) return b.itemCount - a.itemCount;
        // 2순위: 팔레트 수 (적을수록 좋음)
        if (a.palletCount !== b.palletCount) return a.palletCount - b.palletCount;
        // 3순위: 공간 낭비 (적을수록 좋음)
        if (Math.abs(a.wastedSpace - b.wastedSpace) > 0.1) return a.wastedSpace - b.wastedSpace;
        // 4순위: 선호 전략 순서
        const aIdx = preferredOrder.indexOf(a.id);
        const bIdx = preferredOrder.indexOf(b.id);
        return (aIdx >= 0 ? aIdx : 100) - (bIdx >= 0 ? bIdx : 100);
      });

      setStrategies(newStrategies);
      setSelectedStrategy(null);
      setIsCalculating(false);
    }, 500);
  };

  const handleOpenOptimization = () => {
    setShowOptimization(true);
    calculateStrategies();
  };

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy?.result) {
      setPalletItems(strategy.result);
    }
  };

  const handleApplyStrategy = () => {
    setShowOptimization(false);
  };

  const handleCloseOptimization = () => {
    setPalletItems(originalItems);
    setShowOptimization(false);
    setSelectedStrategy(null);
  };

  // ============ 핸들러 ============

  // 같은 크기 화물이 있으면 그 색상, 없으면 사용되지 않은 다음 색상
  const autoSelectColor = (targetDims?: Dimensions) => {
    const dims = targetDims || newItemDims;
    const existingCargo = cargoList.find(c =>
      c.dimensions.width === dims.width &&
      c.dimensions.height === dims.height &&
      c.dimensions.length === dims.length
    );
    if (existingCargo) {
      setNewItemColor(existingCargo.color);
    } else {
      // 사용중인 색상 목록
      const usedColors = new Set(cargoList.map(c => c.color));
      const currentIndex = DEFAULT_CARGO_COLORS.indexOf(newItemColor);

      // 사용되지 않은 색상 찾기
      for (let i = 1; i <= DEFAULT_CARGO_COLORS.length; i++) {
        const nextIndex = (currentIndex + i) % DEFAULT_CARGO_COLORS.length;
        const nextColor = DEFAULT_CARGO_COLORS[nextIndex];
        if (!usedColors.has(nextColor)) {
          setNewItemColor(nextColor);
          return;
        }
      }
      // 모든 색상이 사용중이면 순차 적용
      const nextIndex = (currentIndex + 1) % DEFAULT_CARGO_COLORS.length;
      setNewItemColor(DEFAULT_CARGO_COLORS[nextIndex]);
    }
  };

  const handleAddCargo = () => {
    if (!newItemName) return;
    setCargoListInitialized(true);
    const qty = Math.min(100, Math.max(1, Number(newItemQuantity) || 1));

    // 동일 조건 화물 찾기 (이름, 크기, 색상)
    const existingCargo = cargoList.find(c =>
      c.name === newItemName &&
      c.dimensions.width === newItemDims.width &&
      c.dimensions.height === newItemDims.height &&
      c.dimensions.length === newItemDims.length &&
      c.color === newItemColor
    );

    if (existingCargo) {
      // 기존 화물에 수량 추가
      const updatedCargo: CargoItem = {
        ...existingCargo,
        quantity: existingCargo.quantity + qty
      };
      setCargoList(cargoList.map(c => c.id === existingCargo.id ? updatedCargo : c));

      // 추가되는 수량만큼 새 아이템 배치
      const { newItems, placed } = placeItemWithMultiPallet(
        { ...updatedCargo, quantity: qty },
        palletItems,
        currentPallet
      );
      if (newItems.length > 0) {
        // 새로 배치된 아이템들의 id를 기존 cargo id로 설정
        const itemsWithCorrectId = newItems.map(item => ({ ...item, id: existingCargo.id }));
        setPalletItems([...palletItems, ...itemsWithCorrectId]);
      }
      if (placed < qty) alert(`${newItemName} ${qty}개 중 ${placed}개만 배치되었습니다.`);
    } else {
      // 새 화물 추가
      const newCargo: CargoItem = {
        id: `cargo-${Date.now()}`,
        name: newItemName,
        dimensions: { ...newItemDims },
        color: newItemColor,
        quantity: qty
      };
      setCargoList([...cargoList, newCargo]);
      const { newItems, placed } = placeItemWithMultiPallet(newCargo, palletItems, currentPallet);
      if (newItems.length > 0) setPalletItems([...palletItems, ...newItems]);
      if (placed < qty) alert(`${newItemName} ${qty}개 중 ${placed}개만 배치되었습니다.`);
    }
  };

  const handleRemoveItem = (uniqueId: string) => {
    setPalletItems(palletItems.filter(item => item.uniqueId !== uniqueId));
  };

  const handleRemoveCargoGroup = (cargoId: string) => {
    setCargoList(cargoList.filter(c => c.id !== cargoId));
    setPalletItems(palletItems.filter(item => item.id !== cargoId));
  };

  const handleClear = () => {
    setCargoList([]);
    setPalletItems([]);
  };

  const handleItemMove = useCallback((uniqueId: string, newPos: { x: number; y: number; z: number }) => {
    const item = palletItems.find(i => i.uniqueId === uniqueId);
    if (!item) return;

    // 같은 팔레트의 화물만 필터링
    const samePalletItems = palletItems.filter(
      i => (i.palletIndex ?? 0) === (item.palletIndex ?? 0)
    );

    // 중력/스태킹 로직 - 50% 이상 겹쳐야 올라탐, 아니면 밀림
    let newY = 0;
    let adjustedX = newPos.x;
    let adjustedZ = newPos.z;
    const OVERLAP_THRESHOLD = 0.5;
    const isDescending = item.position.y > 0;

    for (const other of samePalletItems) {
      if (other.uniqueId === uniqueId) continue;

      const oMinX = other.position.x;
      const oMaxX = other.position.x + other.dimensions.width;
      const oMinZ = other.position.z;
      const oMaxZ = other.position.z + other.dimensions.length;
      const oMaxY = other.position.y + other.dimensions.height;

      // X, Z 각각의 겹침 계산
      const overlapX = Math.max(0, Math.min(adjustedX + item.dimensions.width, oMaxX) - Math.max(adjustedX, oMinX));
      const overlapZ = Math.max(0, Math.min(adjustedZ + item.dimensions.length, oMaxZ) - Math.max(adjustedZ, oMinZ));

      if (overlapX <= 0 || overlapZ <= 0) continue;

      const overlapRatioX = overlapX / item.dimensions.width;
      const overlapRatioZ = overlapZ / item.dimensions.length;

      if (overlapRatioX >= OVERLAP_THRESHOLD && overlapRatioZ >= OVERLAP_THRESHOLD) {
        if (oMaxY > newY) newY = oMaxY;
      } else if (isDescending) {
        if (oMaxY > newY) newY = oMaxY;
      } else if (newY === 0) {
        // 바닥에서 이동 중이면 밀어냄
        const pushLeftDist = adjustedX + item.dimensions.width - oMinX;
        const pushRightDist = oMaxX - adjustedX;
        const pushFrontDist = adjustedZ + item.dimensions.length - oMinZ;
        const pushBackDist = oMaxZ - adjustedZ;

        const minPush = Math.min(pushLeftDist, pushRightDist, pushFrontDist, pushBackDist);

        if (minPush === pushLeftDist) {
          adjustedX = oMinX - item.dimensions.width;
        } else if (minPush === pushRightDist) {
          adjustedX = oMaxX;
        } else if (minPush === pushFrontDist) {
          adjustedZ = oMinZ - item.dimensions.length;
        } else {
          adjustedZ = oMaxZ;
        }

        // 팔레트 범위 제한
        adjustedX = Math.max(0, Math.min(currentPallet.width - item.dimensions.width, adjustedX));
        adjustedZ = Math.max(0, Math.min(currentPallet.length - item.dimensions.length, adjustedZ));
      }
    }

    if (newY + item.dimensions.height <= currentPallet.maxLoadHeight) {
      setPalletItems(palletItems.map(i =>
        i.uniqueId === uniqueId ? { ...i, position: { x: adjustedX, y: newY, z: adjustedZ } } : i
      ));
    }
  }, [palletItems, currentPallet]);

  const totalCargoItems = cargoList.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <main className="p-6 mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden bg-slate-50/50" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="lg:col-span-3 flex gap-4 min-w-0" style={{ height: 'calc(100vh - 135px)' }}>
        <div className="hidden lg:flex w-40 bg-white border border-slate-200 rounded-2xl items-center justify-center shrink-0 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 135px)' }}>
          <Suspense fallback={<div className="w-40 h-[600px]" />}>
            <AdSense adSlot="6357216596" adFormat="auto" />
          </Suspense>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0" style={{ height: 'calc(100vh - 135px)' }}>
          <div className="flex justify-between items-end px-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Pallet Loading Simulator</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">3D Real-time Visualization</p>
              </div>
            </div>
            <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto scrollbar-hide max-w-[60%]">
              {Object.entries(PALLET_PRESETS).filter(([key]) => key !== 'CUSTOM').map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePalletTypeChange(key as PalletType)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                    palletType === key ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {key} ({preset.width}×{preset.length})
                </button>
              ))}
            </div>
          </div>

          <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-200/50" style={{ height: 'calc(100vh - 310px)' }}>
            <Canvas
              camera={{ position: [3, 3, 3], fov: 50, near: 0.01, far: 100 }}
              onCreated={({ gl }) => { gl.setClearColor('#0f172a'); }}
              onPointerMissed={() => setSelectedItemId(null)}
            >
              <Scene
                pallet={currentPallet}
                packedItems={palletItems}
                selectedItemId={selectedItemId}
                hoveredItemId={hoveredItemId}
                palletCount={palletCount}
                showLabels={showLabels}
                onSelectItem={setSelectedItemId}
                onHoverItem={setHoveredItemId}
                onItemMove={handleItemMove}
              />
            </Canvas>

            <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur text-white text-xs p-2 rounded border border-slate-600">
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 좌클릭 드래그: 화물 이동</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> 우클릭 드래그: 화면 회전</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 휠 드래그: 화면 이동</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> 휠 스크롤: 확대/축소</p>
              <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> DEL: 선택 화물 제거</p>
            </div>

            <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-xl shadow-xl p-5 rounded-2xl border border-white flex flex-col gap-1 min-w-[180px]">
                {stats.palletCount > 1 ? (
                  <>
                    <span className="text-[9px] text-amber-600 uppercase font-black tracking-[0.2em] leading-none mb-1.5">Pallets</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.palletCount}</span>
                      <span className="text-sm text-slate-600 font-black">대</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-[10px] text-red-400">낭비:</span>
                      <span className="text-sm font-bold text-red-500">{stats.wastedSpace.toFixed(1)}</span>
                      <span className="text-[10px] text-red-400">㎥</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] text-amber-600 uppercase font-black tracking-[0.2em] leading-none mb-1.5">Efficiency</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.efficiency.toFixed(1)}</span>
                      <span className="text-sm text-slate-300 font-black">%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${stats.efficiency > 90 ? 'bg-emerald-500' : 'bg-amber-600'}`} style={{ width: `${Math.min(stats.efficiency, 100)}%` }} />
                    </div>
                  </>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                  <p className="text-[10px] text-slate-500">
                    <span className="font-black text-slate-700">아이템:</span> {stats.itemCount}개
                    {stats.overHeightCount > 0 && <span className="text-red-400 ml-1">(+{stats.overHeightCount} 초과)</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 z-10 text-slate-400 text-xs">
              <p>Pallet: {currentPallet.width}×{currentPallet.length}cm</p>
              <p>Max Height: {currentPallet.maxLoadHeight}cm</p>
            </div>

            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all shadow-lg border ${
                  showLabels
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                }`}
              >
                🏷️ 라벨
              </button>
            </div>
          </div>

          <div className="h-[90px] bg-white border border-slate-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <Suspense fallback={<div className="w-full h-[90px]" />}>
              <AdSense adSlot="2289322536" adFormat="horizontal" style={{ width: '100%', height: '90px' }} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 overflow-hidden" style={{ height: 'calc(100vh - 135px)' }}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 h-full overflow-hidden flex flex-col">
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

          <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-6 scrollbar-hide">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">규격 (L x W x H cm)</label>
                  <button type="button" onClick={() => setPalletSize({ width: palletSize.length, height: palletSize.height, length: palletSize.width })} className="px-2 py-1 text-[8px] font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                    90°
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <input type="number" value={palletSize.length} onChange={(e) => setPalletSize({...palletSize, length: Math.min(1000, Number(e.target.value))})} className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" min="10" max="1000" />
                  <input type="number" value={palletSize.width} onChange={(e) => setPalletSize({...palletSize, width: Math.min(1000, Number(e.target.value))})} className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" min="10" max="1000" />
                  <input type="number" value={palletSize.height} onChange={(e) => setPalletSize({...palletSize, height: Math.min(1000, Number(e.target.value))})} className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" min="5" max="1000" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">최대 적재 높이: <span className="text-slate-700">{maxHeight}cm</span></label>
                <input type="range" value={maxHeight} onChange={(e) => setMaxHeight(Number(e.target.value))} min="50" max="500" className="w-full" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">화물 추가</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">화물 식별명</label>
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">규격 (L x W x H cm)</label>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setNewItemDims({ width: newItemDims.length, height: newItemDims.height, length: newItemDims.width })} className="px-2 py-0.5 text-[8px] font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                      90°
                    </button>
                    <button type="button" onClick={() => setNoStandUp(!noStandUp)} className={`px-2 py-0.5 text-[8px] font-bold rounded-lg transition-all ${noStandUp ? 'bg-slate-200 text-slate-500' : 'bg-blue-500 text-white'}`}>
                      {noStandUp ? '높이 고정' : '높이도 변경'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <input type="number" value={newItemDims.length} onChange={(e) => setNewItemDims({...newItemDims, length: Math.min(500, Number(e.target.value))})} onBlur={() => autoSelectColor()} className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" min="1" max="500" />
                  <input type="number" value={newItemDims.width} onChange={(e) => setNewItemDims({...newItemDims, width: Math.min(500, Number(e.target.value))})} onBlur={() => autoSelectColor()} className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" min="1" max="500" />
                  <input type="number" value={newItemDims.height} onChange={(e) => setNewItemDims({...newItemDims, height: Math.min(500, Number(e.target.value))})} onBlur={() => autoSelectColor()} className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" min="1" max="500" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => { const d = { width: 20, height: 20, length: 30 }; setNewItemDims(d); setNewItemName('XS박스'); autoSelectColor(d); }} className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:border-blue-500 transition-all">XS박스</button>
                  <button type="button" onClick={() => { const d = { width: 30, height: 30, length: 40 }; setNewItemDims(d); setNewItemName('S박스'); autoSelectColor(d); }} className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:border-blue-500 transition-all">S박스</button>
                  <button type="button" onClick={() => { const d = { width: 40, height: 40, length: 50 }; setNewItemDims(d); setNewItemName('M박스'); autoSelectColor(d); }} className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:border-blue-500 transition-all">M박스</button>
                  <button type="button" onClick={() => { const d = { width: 50, height: 50, length: 60 }; setNewItemDims(d); setNewItemName('L박스'); autoSelectColor(d); }} className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:border-blue-500 transition-all">L박스</button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">수량 (최대 100)</label>
                <input type="number" value={newItemQuantity} onChange={(e) => setNewItemQuantity(e.target.value)} onFocus={() => setNewItemQuantity('')} onBlur={(e) => { const val = Number(e.target.value); if (!val || val < 1) setNewItemQuantity('1'); else if (val > 100) setNewItemQuantity('100'); }} className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" min="1" max="100" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">색상</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DEFAULT_CARGO_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewItemColor(c)}
                      className={`w-full aspect-square rounded-lg shadow-sm transition-all hover:scale-110 flex items-center justify-center ${newItemColor === c ? 'ring-2 ring-offset-1 ring-slate-900' : ''}`}
                      style={{ backgroundColor: c }}
                    >
                      {newItemColor === c && <div className="w-1 h-1 bg-white rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleAddCargo} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2">
                화물 추가 ({newItemQuantity}개)
              </button>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-black text-slate-900 text-xs tracking-tight">화물 그룹 <span className="text-slate-300 font-bold ml-1">{cargoList.length}</span></h3>
                {cargoList.length > 0 && <button onClick={handleClear} className="text-[9px] text-slate-400 hover:text-red-500 font-black uppercase tracking-widest transition-colors">Clear</button>}
              </div>

              <div className="space-y-2">
                {cargoList.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-300 text-[10px] font-bold">리스트가 비어있습니다.</p>
                  </div>
                ) : cargoList.map(cargo => {
                  const placedCount = palletItems.filter(i => i.id === cargo.id).length;
                  return (
                    <div key={cargo.id} className="group relative flex items-center p-3 rounded-xl border bg-white border-slate-100 hover:border-slate-200 transition-all">
                      <div className="w-1.5 h-8 rounded-full mr-3 shrink-0" style={{ backgroundColor: cargo.color }}></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[11px] truncate text-slate-700">{cargo.name}</p>
                        <div className="flex items-center text-[9px] text-slate-400 font-bold">
                          <span className="truncate opacity-60">{cargo.dimensions.length}×{cargo.dimensions.width}×{cargo.dimensions.height}</span>
                          <span className="ml-2 text-blue-500">{placedCount}/{cargo.quantity}개</span>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveCargoGroup(cargo.id)} className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {cargoList.length > 0 && (
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <button onClick={handleOpenOptimization} className="w-full py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group bg-amber-600 hover:bg-amber-700 text-white active:scale-[0.98]">
                <span className="text-[10px] font-black uppercase tracking-widest">AI 자동 최적화</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 최적화 모달 */}
      {showOptimization && (
        <div className="fixed right-0 top-0 h-full w-[26rem] z-50 bg-white shadow-2xl flex flex-col border-l border-slate-200">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">AI 자동 최적화</h2>
                <p className="text-amber-100 text-xs">{cargoList.length}종 / {totalCargoItems}개</p>
              </div>
              <button onClick={handleCloseOptimization} className="text-white/80 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* 옵션 토글 */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setNoStandUp(!noStandUp)}
              className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                noStandUp
                  ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {noStandUp ? '높이 고정' : '높이도 변경'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {isCalculating ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-amber-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
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
                      selectedStrategy === strategy.id ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">추천</div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{strategy.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-slate-800 text-sm">{strategy.name}</h3>
                          {selectedStrategy === strategy.id && (
                            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{strategy.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className="text-lg font-bold text-amber-600">{strategy.palletCount}대</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{strategy.itemCount}/{totalCargoItems}개</p>
                        <p className="text-[10px] text-slate-500">낭비: <span className={strategy.wastedSpace < 1 ? 'text-green-600' : strategy.wastedSpace < 3 ? 'text-amber-600' : 'text-red-500'}>{strategy.wastedSpace.toFixed(1)}㎥</span></p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strategy.itemCount === totalCargoItems ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${(strategy.itemCount / totalCargoItems) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t bg-slate-50 px-4 py-3 flex-shrink-0">
            <div className="flex gap-2">
              <button onClick={handleCloseOptimization} className="flex-1 px-3 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors text-sm border border-slate-300 rounded-lg hover:bg-slate-100">취소</button>
              <button onClick={handleApplyStrategy} disabled={isCalculating || !selectedStrategy} className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-amber-500/25">적용</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PalletSimulator;
