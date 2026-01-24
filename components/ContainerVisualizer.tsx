import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { ContainerSpec, PackedItem } from '../types';

interface ContainerVisualizerProps {
  container: ContainerSpec;
  packedItems: PackedItem[];
  onItemMove?: (uniqueId: string, newPos: { x: number; y: number; z: number }) => void;
  selectedGroupId?: string | null;
  onSelectGroup?: (id: string) => void;
  onRemoveCargo?: (id: string) => void;
  isArranging?: boolean;
}

// 스케일: 1cm = 0.01 three.js units
const SCALE = 0.01;

// 단일 화물 박스 컴포넌트
const CargoBox: React.FC<{
  item: PackedItem;
  container: ContainerSpec;
  isSelected: boolean;
  isHovered: boolean;
  isFaded: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  onDrag: (position: { x: number; y: number; z: number }) => void;
}> = ({ item, container, isSelected, isHovered, isFaded, onSelect, onHover, onDrag }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, raycaster, gl } = useThree();
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectPoint = useRef(new THREE.Vector3());

  // 박스 크기 및 위치 계산 (cm -> three.js units)
  const size = useMemo(() => [
    item.dimensions.width * SCALE,
    item.dimensions.height * SCALE,
    item.dimensions.length * SCALE
  ] as [number, number, number], [item.dimensions]);

  // Z-fighting 방지를 위해 살짝 안쪽으로 배치 (0.1cm = 0.001 units)
  const GAP = 0.001;
  const position = useMemo(() => [
    (item.position.x + item.dimensions.width / 2) * SCALE - (container.width * SCALE / 2) + GAP,
    (item.position.y + item.dimensions.height / 2) * SCALE + GAP,
    (item.position.z + item.dimensions.length / 2) * SCALE - (container.length * SCALE / 2) + GAP
  ] as [number, number, number], [item.position, item.dimensions, container]);

  // 색상 처리 - 비활성화 시에도 원래 색상 유지
  const color = useMemo(() => {
    return item.color;
  }, [item.color]);

  const emissive = useMemo(() => {
    if (isHovered || isDragging) return item.color;
    if (isSelected) return '#ffffff';
    return '#000000';
  }, [isHovered, isDragging, isSelected, item.color]);

  const handlePointerDown = useCallback((e: THREE.Event) => {
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    (gl.domElement as HTMLElement).style.cursor = 'grabbing';

    // 드래그 평면 설정 (현재 박스의 Y 위치)
    planeRef.current.set(new THREE.Vector3(0, 1, 0), -position[1]);
  }, [onSelect, gl.domElement, position]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    (gl.domElement as HTMLElement).style.cursor = 'auto';
  }, [gl.domElement]);

  useFrame(() => {
    if (!isDragging) return;

    // 마우스 위치에서 평면과의 교차점 계산
    raycaster.ray.intersectPlane(planeRef.current, intersectPoint.current);

    // three.js 좌표를 cm 좌표로 변환
    let newX = (intersectPoint.current.x + container.width * SCALE / 2) / SCALE - item.dimensions.width / 2;
    let newZ = (intersectPoint.current.z + container.length * SCALE / 2) / SCALE - item.dimensions.length / 2;

    // 컨테이너 범위 제한
    newX = Math.max(0, Math.min(container.width - item.dimensions.width, newX));
    newZ = Math.max(0, Math.min(container.length - item.dimensions.length, newZ));

    // 중력/스태킹은 상위 컴포넌트에서 처리
    onDrag({ x: newX, y: item.position.y, z: newZ });
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
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
        transparent={isFaded}
        opacity={isFaded ? 0.5 : 1}
        roughness={isFaded ? 0.9 : 0.5}
        metalness={isFaded ? 0 : 0.1}
      />

      {/* 선택/호버 시 외곽선 - 살짝 크게 해서 Z-fighting 방지 */}
      {(isSelected || isHovered) && (
        <mesh scale={[1.02, 1.02, 1.02]}>
          <boxGeometry args={size} />
          <meshBasicMaterial
            color={isSelected ? '#ffffff' : '#aaaaaa'}
            wireframe
            transparent
            opacity={isSelected ? 0.8 : 0.5}
          />
        </mesh>
      )}

      {/* 호버/선택 시 이름 표시 */}
      {(isHovered || isSelected) && (
        <Html center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/70 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
            {item.name}
            {item.weight && <span className="ml-1 text-blue-300">{item.weight}kg</span>}
          </div>
        </Html>
      )}
    </mesh>
  );
};

// 컨테이너 박스 (투명 벽면)
const ContainerBox: React.FC<{ container: ContainerSpec }> = ({ container }) => {
  const size = useMemo(() => [
    container.width * SCALE,
    container.height * SCALE,
    container.length * SCALE
  ] as [number, number, number], [container]);

  return (
    <group position={[0, size[1] / 2, 0]}>
      {/* 바닥 */}
      <mesh position={[0, -size[1] / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0], size[2]]} />
        <meshStandardMaterial color="#1e293b" side={THREE.DoubleSide} />
      </mesh>

      {/* 그리드 */}
      <gridHelper args={[Math.max(size[0], size[2]), 20, '#334155', '#334155']} position={[0, -size[1] / 2 + 0.002, 0]} />

      {/* 투명 벽면들 */}
      {/* 뒷벽 */}
      <mesh position={[0, 0, -size[2] / 2]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial color="#334155" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 왼쪽 벽 */}
      <mesh position={[-size[0] / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[size[2], size[1]]} />
        <meshStandardMaterial color="#334155" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 오른쪽 벽 */}
      <mesh position={[size[0] / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[size[2], size[1]]} />
        <meshStandardMaterial color="#334155" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 컨테이너 외곽선 */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color="#475569" />
      </lineSegments>
    </group>
  );
};

// CoG 마커
const CoGMarker: React.FC<{
  position: [number, number, number];
  containerHeight: number;
}> = ({ position, containerHeight }) => {
  const markerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  return (
    <group position={position}>
      {/* 상단 마커 */}
      <mesh ref={markerRef} position={[0, containerHeight * SCALE, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>

      {/* 수직선 */}
      <Line
        points={[[0, 0, 0], [0, containerHeight * SCALE, 0]]}
        color="#ef4444"
        lineWidth={2}
        dashed
        dashSize={0.05}
        gapSize={0.02}
      />

      {/* 바닥 마커 */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.03, 0.05, 32]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

// 메인 3D 씬
const Scene: React.FC<{
  container: ContainerSpec;
  packedItems: PackedItem[];
  selectedGroupId: string | null;
  hoveredItemId: string | null;
  showCoG: boolean;
  weightStats: { totalWeight: number; cogX: number; cogZ: number };
  onSelectGroup: (id: string) => void;
  onHoverItem: (id: string | null) => void;
  onItemMove: (uniqueId: string, pos: { x: number; y: number; z: number }) => void;
}> = ({ container, packedItems, selectedGroupId, hoveredItemId, showCoG, weightStats, onSelectGroup, onHoverItem, onItemMove }) => {

  const cogPosition = useMemo((): [number, number, number] => [
    (weightStats.cogX - container.width / 2) * SCALE,
    0,
    (weightStats.cogZ - container.length / 2) * SCALE
  ], [weightStats, container]);

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {/* 컨테이너 */}
      <ContainerBox container={container} />

      {/* 화물들 */}
      {packedItems.map((item) => (
        <CargoBox
          key={item.uniqueId}
          item={item}
          container={container}
          isSelected={selectedGroupId === item.id}
          isHovered={hoveredItemId === item.uniqueId}
          isFaded={!!selectedGroupId && selectedGroupId !== item.id}
          onSelect={() => onSelectGroup(item.id)}
          onHover={(hovered) => onHoverItem(hovered ? item.uniqueId : null)}
          onDrag={(pos) => onItemMove(item.uniqueId, pos)}
        />
      ))}

      {/* CoG 마커 */}
      {showCoG && weightStats.totalWeight > 0 && (
        <CoGMarker position={cogPosition} containerHeight={container.height} />
      )}

      {/* 카메라 컨트롤 - 우클릭: 회전, 휠클릭: 이동 */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.8}
        minDistance={1}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.9}
        mouseButtons={{
          LEFT: undefined, // 좌클릭은 화물 드래그용
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.ROTATE
        }}
      />
    </>
  );
};

const ContainerVisualizer: React.FC<ContainerVisualizerProps> = ({
  container,
  packedItems,
  onItemMove,
  selectedGroupId,
  onSelectGroup,
  onRemoveCargo,
  isArranging = false
}) => {
  const [showCoG, setShowCoG] = useState(true);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Delete 키로 선택된 화물 제거
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedGroupId && onRemoveCargo) {
        onRemoveCargo(selectedGroupId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGroupId, onRemoveCargo]);

  // 무게 중심 계산
  const weightStats = useMemo(() => {
    let totalWeight = 0;
    let momentX = 0;
    let momentZ = 0;

    packedItems.forEach(item => {
      const w = item.weight || 0;
      totalWeight += w;
      const centerX = item.position.x + (item.dimensions.width / 2);
      const centerZ = item.position.z + (item.dimensions.length / 2);
      momentX += w * centerX;
      momentZ += w * centerZ;
    });

    const cogX = totalWeight > 0 ? momentX / totalWeight : container.width / 2;
    const cogZ = totalWeight > 0 ? momentZ / totalWeight : container.length / 2;

    return { totalWeight, cogX, cogZ };
  }, [packedItems, container]);

  const handleItemMove = useCallback((uniqueId: string, newPos: { x: number; y: number; z: number }) => {
    if (!onItemMove) return;

    const item = packedItems.find(i => i.uniqueId === uniqueId);
    if (!item) return;

    // 중력/스태킹 로직
    let newY = 0;
    const tolerance = 2;
    const myMinX = newPos.x + tolerance;
    const myMaxX = newPos.x + item.dimensions.width - tolerance;
    const myMinZ = newPos.z + tolerance;
    const myMaxZ = newPos.z + item.dimensions.length - tolerance;

    for (const other of packedItems) {
      if (other.uniqueId === uniqueId) continue;

      const oMinX = other.position.x;
      const oMaxX = other.position.x + other.dimensions.width;
      const oMinZ = other.position.z;
      const oMaxZ = other.position.z + other.dimensions.length;
      const oMaxY = other.position.y + other.dimensions.height;

      const intersects = (myMinX < oMaxX && myMaxX > oMinX) && (myMinZ < oMaxZ && myMaxZ > oMinZ);

      if (intersects && oMaxY > newY) {
        newY = oMaxY;
      }
    }

    if (newY + item.dimensions.height <= container.height) {
      onItemMove(uniqueId, { x: newPos.x, y: newY, z: newPos.z });
    }
  }, [onItemMove, packedItems, container.height]);

  const handleSelectGroup = useCallback((id: string) => {
    if (onSelectGroup) onSelectGroup(id);
  }, [onSelectGroup]);

  return (
    <div className="w-full h-full bg-slate-900 relative">
      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [5, 4, 5], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0f172a');
        }}
      >
        <Scene
          container={container}
          packedItems={packedItems}
          selectedGroupId={selectedGroupId || null}
          hoveredItemId={hoveredItemId}
          showCoG={showCoG}
          weightStats={weightStats}
          onSelectGroup={handleSelectGroup}
          onHoverItem={setHoveredItemId}
          onItemMove={handleItemMove}
        />
      </Canvas>

      {/* AI 계산 중 표시 */}
      {isArranging && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center gap-4 border border-white/20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm mb-1">AI 최적화 중...</p>
              <p className="text-white/60 text-xs">최적의 배치를 계산하고 있습니다</p>
            </div>
          </div>
        </div>
      )}

      {/* UI 오버레이 */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-slate-800/80 backdrop-blur text-white text-xs p-2 rounded border border-slate-600 shadow-lg">
          <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 좌클릭 드래그: 화물 이동</p>
          <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> 우클릭 드래그: 화면 회전</p>
          <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 휠 드래그: 화면 이동</p>
          <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> 휠 스크롤: 확대/축소</p>
          <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> DEL: 선택 화물 제거</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 text-slate-400">
        <div className="text-xs">
          <p>Container: {container.type}</p>
          <p>Items: {packedItems.length}</p>
        </div>
        {weightStats.totalWeight > 0 && (
          <div className="bg-slate-800/80 backdrop-blur border border-slate-600 rounded p-2 text-xs mt-1 shadow-lg">
            <p className="text-white font-bold mb-1">Weight Stats</p>
            <p>Total: <span className="text-blue-400">{weightStats.totalWeight.toLocaleString()} kg</span></p>
            <p>CoG Offset: <span className="text-slate-400">X:{(weightStats.cogX - container.width/2).toFixed(1)}cm / Z:{(weightStats.cogZ - container.length/2).toFixed(1)}cm</span></p>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={() => setShowCoG(!showCoG)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all shadow-lg border ${
            showCoG
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
          }`}
        >
          {showCoG ? '🎯' : '⭕'} 무게 중심(CoG)
        </button>
      </div>
    </div>
  );
};

export default ContainerVisualizer;
