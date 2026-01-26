import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DEFAULT_CARGO_COLORS } from '../constants';

const SCALE = 0.01;

// 컨테이너 스펙 (20ft): 235 x 239 x 590 cm
const CONTAINER = { width: 235, height: 239, length: 590 };
const CONTAINER_GAP = 300;

interface CargoData {
  id: string;
  color: string;
  dimensions: { width: number; height: number; length: number };
  position: { x: number; y: number; z: number };
  containerIndex: number;
}

// 화물 크기 - 3가지 사이즈 (길이 방향으로 조합하면 585cm로 맞음)
// 195*3=585, 195+130*3=585, 130*4+65=585, 65*9=585
const L = { w: 115, h: 115, l: 195 };   // 큰 화물 (빨강)
const M = { w: 115, h: 115, l: 130 };   // 중간 화물 (초록)
const S = { w: 115, h: 115, l: 65 };    // 작은 화물 (파랑)

// 색상 - 크기별로 통일
const COLOR_L = '#ef4444';  // 빨강 (큰)
const COLOR_M = '#22c55e';  // 초록 (중간)
const COLOR_S = '#3b82f6';  // 파랑 (작은)

// 비효율적 배치 - 크기가 다른 화물들이 섞여서 빈틈 발생 → 3개 컨테이너 필요
// 순서: 가운데(1) → 왼쪽(0) → 오른쪽(2)
// 총: L 12개, M 16개, S 4개 = 32개
const generateInefficientLayout = (): CargoData[] => {
  const items: CargoData[] = [];
  let id = 1;

  // 컨테이너 1 (가운데, 먼저): L 4개 + M 6개 + S 1개 = 11개
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: 0, y: 0, z: 0 }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: 0, z: 0 }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: 0, y: 0, z: L.l }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: L.w, y: 0, z: 140 }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: 0, y: 0, z: 340 }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_S, dimensions: { width: S.w, height: S.h, length: S.l }, position: { x: L.w, y: 0, z: 340 }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: 0, y: L.h, z: 0 }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: L.h, z: 0 }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: 0, y: L.h, z: L.l }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: L.h, z: 140 }, containerIndex: 1 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: L.h, z: 280 }, containerIndex: 1 });

  // 컨테이너 0 (왼쪽, 두번째): L 4개 + M 5개 + S 2개 = 11개
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: 0, y: 0, z: 0 }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: 0, z: 0 }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_S, dimensions: { width: S.w, height: S.h, length: S.l }, position: { x: L.w, y: 0, z: M.l }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: 0, y: 0, z: L.l }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: L.w, y: 0, z: 200 }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: 0, y: 0, z: 340 }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_S, dimensions: { width: S.w, height: S.h, length: S.l }, position: { x: L.w, y: 0, z: 400 }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: 0, y: L.h, z: 0 }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: L.h, z: 0 }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: 0, y: L.h, z: L.l }, containerIndex: 0 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: L.h, z: M.l }, containerIndex: 0 });

  // 컨테이너 2 (오른쪽, 마지막): L 4개 + M 5개 + S 1개 = 10개
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: 0, y: 0, z: 0 }, containerIndex: 2 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: 0, z: 0 }, containerIndex: 2 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: 0, y: 0, z: L.l }, containerIndex: 2 });
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: L.w, y: 0, z: 140 }, containerIndex: 2 });
  items.push({ id: String(id++), color: COLOR_S, dimensions: { width: S.w, height: S.h, length: S.l }, position: { x: 0, y: 0, z: 340 }, containerIndex: 2 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: 0, z: 340 }, containerIndex: 2 });
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: 0, y: L.h, z: 0 }, containerIndex: 2 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: L.h, z: 0 }, containerIndex: 2 });
  items.push({ id: String(id++), color: COLOR_L, dimensions: { width: L.w, height: L.h, length: L.l }, position: { x: 0, y: L.h, z: L.l }, containerIndex: 2 });
  items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: L.w, y: L.h, z: 140 }, containerIndex: 2 });

  return items;
};

// 최적화된 배치 - 같은 크기끼리 모아서 이빨 딱 맞게 → 2개 컨테이너
// L*3=585, M*4+S=585 조합 사용
// L 12개, M 16개, S 4개 = 32개
const generateOptimizedLayout = (): CargoData[] => {
  const items: CargoData[] = [];
  let id = 1;

  // 컨테이너 0: L 12개 (2x2x3 = 12개, L*3=585 이빨 딱 맞음)
  // 1층 - L*3 + L*3
  for (let row = 0; row < 2; row++) {
    for (let z = 0; z < 3; z++) {
      items.push({
        id: String(id++),
        color: COLOR_L,
        dimensions: { width: L.w, height: L.h, length: L.l },
        position: { x: row * L.w, y: 0, z: z * L.l },
        containerIndex: 0
      });
    }
  }
  // 2층 - L*3 + L*3
  for (let row = 0; row < 2; row++) {
    for (let z = 0; z < 3; z++) {
      items.push({
        id: String(id++),
        color: COLOR_L,
        dimensions: { width: L.w, height: L.h, length: L.l },
        position: { x: row * L.w, y: L.h, z: z * L.l },
        containerIndex: 0
      });
    }
  }

  // 컨테이너 1: M 16개 + S 4개 (M*4+S=585 이빨 딱 맞음)
  // 1층 row1: M M M M S (130*4+65=585)
  for (let z = 0; z < 4; z++) {
    items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: 0, y: 0, z: z * M.l }, containerIndex: 1 });
  }
  items.push({ id: String(id++), color: COLOR_S, dimensions: { width: S.w, height: S.h, length: S.l }, position: { x: 0, y: 0, z: 4 * M.l }, containerIndex: 1 });
  // 1층 row2: M M M M S
  for (let z = 0; z < 4; z++) {
    items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: M.w, y: 0, z: z * M.l }, containerIndex: 1 });
  }
  items.push({ id: String(id++), color: COLOR_S, dimensions: { width: S.w, height: S.h, length: S.l }, position: { x: M.w, y: 0, z: 4 * M.l }, containerIndex: 1 });
  // 2층 row1: M M M M S
  for (let z = 0; z < 4; z++) {
    items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: 0, y: M.h, z: z * M.l }, containerIndex: 1 });
  }
  items.push({ id: String(id++), color: COLOR_S, dimensions: { width: S.w, height: S.h, length: S.l }, position: { x: 0, y: M.h, z: 4 * M.l }, containerIndex: 1 });
  // 2층 row2: M M M M S
  for (let z = 0; z < 4; z++) {
    items.push({ id: String(id++), color: COLOR_M, dimensions: { width: M.w, height: M.h, length: M.l }, position: { x: M.w, y: M.h, z: z * M.l }, containerIndex: 1 });
  }
  items.push({ id: String(id++), color: COLOR_S, dimensions: { width: S.w, height: S.h, length: S.l }, position: { x: M.w, y: M.h, z: 4 * M.l }, containerIndex: 1 });

  return items;
};

const INEFFICIENT_LAYOUT = generateInefficientLayout();
const OPTIMIZED_LAYOUT = generateOptimizedLayout();

// ============ 3D 컴포넌트 ============

const CargoBox: React.FC<{
  cargo: CargoData;
  isOptimized: boolean;
}> = ({ cargo, isOptimized }) => {
  // 비최적화: 항상 3개 기준, 최적화: 2개 기준 (화물 이동 방지)
  const layoutCount = isOptimized ? 2 : 3;
  const getContainerOffset = (idx: number) => (idx - (layoutCount - 1) / 2) * (CONTAINER.width + CONTAINER_GAP) * SCALE;

  const gap = 3;
  const size: [number, number, number] = [
    (cargo.dimensions.width - gap) * SCALE,
    (cargo.dimensions.height - gap) * SCALE,
    (cargo.dimensions.length - gap) * SCALE
  ];

  const position: [number, number, number] = [
    getContainerOffset(cargo.containerIndex) + (cargo.position.x + cargo.dimensions.width / 2) * SCALE - (CONTAINER.width * SCALE / 2),
    (cargo.position.y + cargo.dimensions.height / 2) * SCALE,
    (cargo.position.z + cargo.dimensions.length / 2) * SCALE - (CONTAINER.length * SCALE / 2)
  ];

  return (
    <mesh position={position} renderOrder={1}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={cargo.color}
        transparent
        opacity={0.95}
        roughness={0.3}
        metalness={0.1}
        depthWrite={true}
      />
      <lineSegments renderOrder={2}>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color="#000" transparent opacity={0.6} />
      </lineSegments>
    </mesh>
  );
};

const Container: React.FC<{
  position: [number, number, number];
  isActive?: boolean;
  visible?: boolean;
}> = ({ position, isActive = false, visible = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(visible ? 1 : 0);

  const size: [number, number, number] = [
    CONTAINER.width * SCALE,
    CONTAINER.height * SCALE,
    CONTAINER.length * SCALE
  ];

  // 부드러운 scale 애니메이션 (사라질 때 매우 빠르게)
  useFrame((_, delta) => {
    const target = visible ? 1 : 0;
    const speed = visible ? 20 : 50; // 나타날 때 20, 사라질 때 50
    scaleRef.current += (target - scaleRef.current) * delta * speed;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group position={[0, size[1] / 2, 0]}>
        {/* 바닥 */}
        <mesh position={[0, -size[1] / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={0}>
          <planeGeometry args={[size[0], size[2]]} />
          <meshStandardMaterial color="#1e293b" side={THREE.DoubleSide} />
        </mesh>
        <gridHelper
          args={[Math.max(size[0], size[2]), 20, '#334155', '#1e293b']}
          position={[0, -size[1] / 2 + 0.002, 0]}
        />

        {/* 외곽선만 표시 (벽면 제거로 가림 해결) */}
        <lineSegments renderOrder={3}>
          <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
          <lineBasicMaterial color={isActive ? '#3b82f6' : '#475569'} linewidth={2} />
        </lineSegments>
      </group>
    </group>
  );
};

const ScanLine: React.FC<{ progress: number; containerCount: number }> = ({ progress, containerCount }) => {
  const totalWidth = containerCount * CONTAINER.width + (containerCount - 1) * CONTAINER_GAP;
  const zPos = -CONTAINER.length * SCALE / 2 + progress * CONTAINER.length * SCALE;

  return (
    <group position={[0, 0.1, zPos]}>
      <mesh renderOrder={10}>
        <planeGeometry args={[totalWidth * SCALE, 0.03]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh renderOrder={9}>
        <planeGeometry args={[totalWidth * SCALE, 0.2]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ============ 메인 씬 ============
const Scene: React.FC<{
  phase: 'filling' | 'scanning' | 'optimizing' | 'done';
  visibleCargoCount: number;
  containerCount: number;
  scanProgress: number;
  isOptimized: boolean;
}> = ({ phase, visibleCargoCount, containerCount, scanProgress, isOptimized }) => {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(8, 7, 10));

  // 카메라는 phase 변경될 때만 부드럽게 이동
  useEffect(() => {
    const r = 18;
    if (phase === 'filling' || phase === 'scanning') {
      // 3개 컨테이너 기준 (화물 채우기 + 스캔)
      targetCamPos.current.set(r * 0.6, r * 0.45, r * 0.55);
    } else if (phase === 'optimizing' || phase === 'done') {
      // 2개 컨테이너 기준 (최적화 후)
      targetCamPos.current.set(r * 0.45, r * 0.45, r * 0.55);
    }
  }, [phase]);

  // 초기 카메라 위치 설정
  useEffect(() => {
    const r = 18;
    targetCamPos.current.set(r * 0.6, r * 0.45, r * 0.55);
  }, []);

  useFrame((_, delta) => {
    camera.position.lerp(targetCamPos.current, delta * 0.3);
    camera.lookAt(0, 1, 0);
  });

  // 컨테이너 수 (애니메이션으로 부드럽게 표시)
  const displayContainerCount = isOptimized ? 2 : containerCount;
  const currentLayout = isOptimized ? OPTIMIZED_LAYOUT : INEFFICIENT_LAYOUT;

  // 컨테이너 위치 계산 (비최적화: 3개 기준, 최적화: 2개 기준)
  const containerLayoutCount = isOptimized ? 2 : 3;

  const getContainerPosition = (idx: number): [number, number, number] => {
    const offset = (idx - (containerLayoutCount - 1) / 2) * (CONTAINER.width + CONTAINER_GAP) * SCALE;
    return [offset, 0, 0];
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} />
      <directionalLight position={[-5, 10, -5]} intensity={0.4} />

      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 18]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <gridHelper args={[30, 60, '#1e293b', '#0f172a']} />

      {/* 항상 3개 컨테이너 렌더링, visible로 부드럽게 나타남/사라짐 */}
      {/* 순서: 가운데(1) → 왼쪽(0) → 오른쪽(2) */}
      {Array.from({ length: 3 }).map((_, idx) => {
        let isVisible = false;
        if (isOptimized) {
          // 최적화 후: 왼쪽(0), 가운데(1)만
          isVisible = idx < 2;
        } else {
          // 비최적화: 가운데 → 왼쪽 → 오른쪽 순서
          if (containerCount >= 1) isVisible = idx === 1; // 가운데
          if (containerCount >= 2) isVisible = idx === 0 || idx === 1; // + 왼쪽
          if (containerCount >= 3) isVisible = true; // + 오른쪽
        }
        return (
          <Container
            key={`container-${idx}`}
            position={getContainerPosition(idx)}
            isActive={phase === 'scanning' || phase === 'optimizing'}
            visible={isVisible}
          />
        );
      })}

      {currentLayout.slice(0, visibleCargoCount).map((cargo) => (
        <CargoBox
          key={cargo.id}
          cargo={cargo}
          isOptimized={isOptimized}
        />
      ))}

      {phase === 'scanning' && (
        <ScanLine progress={scanProgress} containerCount={containerCount} />
      )}

      <OrbitControls makeDefault enableDamping dampingFactor={0.1} minDistance={4} maxDistance={30} />
    </>
  );
};

// ============ UI 컴포넌트 ============
const PhaseIndicator: React.FC<{ phase: string; containerCount: number }> = ({ phase, containerCount }) => {
  const steps = [
    { key: 'filling', label: `Fill (${containerCount})`, icon: '📦' },
    { key: 'scanning', label: 'Scan', icon: '🔍' },
    { key: 'optimizing', label: 'Optimize', icon: '⚡' },
    { key: 'done', label: 'Done (2)', icon: '✅' },
  ];
  const stepIndex = steps.findIndex(s => s.key === phase);

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, idx) => (
        <React.Fragment key={s.key}>
          <div className={`flex items-center gap-1 px-2 py-1 rounded transition-all text-xs ${
            idx === stepIndex ? 'bg-blue-600 text-white' :
            idx < stepIndex ? 'bg-green-600/20 text-green-400' : 'bg-slate-700/50 text-slate-500'
          }`}>
            <span className="text-sm">{s.icon}</span>
            <span className="font-medium">{s.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-3 h-0.5 ${idx < stepIndex ? 'bg-green-500' : 'bg-slate-600'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const StatsPanel: React.FC<{ phase: string; containerCount: number; cargoCount: number }> = ({
  phase, containerCount, cargoCount
}) => {
  const isDone = phase === 'done';
  const totalCargo = INEFFICIENT_LAYOUT.length;

  return (
    <div className="text-xs space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2 rounded-lg border ${!isDone ? 'bg-slate-800/80 border-slate-600' : 'bg-slate-800/40 border-slate-700'}`}>
          <div className="text-slate-400 text-[10px]">BEFORE</div>
          <div className="text-white font-bold">3 containers</div>
          <div className="text-slate-400">{totalCargo} items</div>
        </div>
        <div className={`p-2 rounded-lg border ${isDone ? 'bg-green-900/30 border-green-600' : 'bg-slate-800/40 border-slate-700'}`}>
          <div className="text-slate-400 text-[10px]">AFTER</div>
          <div className={`font-bold ${isDone ? 'text-green-400' : 'text-slate-500'}`}>
            {isDone ? '2 containers' : '—'}
          </div>
          <div className={isDone ? 'text-green-400' : 'text-slate-500'}>
            {isDone ? `${totalCargo} items` : '—'}
          </div>
        </div>
      </div>
      {isDone && (
        <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-600 text-center">
          <span className="text-blue-300 font-bold">-1 container</span>
          <span className="text-blue-400 ml-1">saved</span>
        </div>
      )}
    </div>
  );
};

// ============ 메인 컴포넌트 ============
const ContainerDemo: React.FC = () => {
  const [phase, setPhase] = useState<'filling' | 'scanning' | 'optimizing' | 'done'>('filling');
  const [visibleCargoCount, setVisibleCargoCount] = useState(0);
  const [containerCount, setContainerCount] = useState(1);
  const [scanProgress, setScanProgress] = useState(0);
  const [isOptimized, setIsOptimized] = useState(false);
  const runIdRef = useRef(0);

  const TOTAL_CARGO = INEFFICIENT_LAYOUT.length; // 32개

  useEffect(() => {
    const currentRunId = ++runIdRef.current;
    const timeouts: NodeJS.Timeout[] = [];
    const intervals: NodeJS.Timeout[] = [];

    const runDemo = () => {
      setPhase('filling');
      setVisibleCargoCount(0);
      setContainerCount(1);
      setScanProgress(0);
      setIsOptimized(false);

      let cargoIdx = 0;
      const fillInterval = setInterval(() => {
        if (runIdRef.current !== currentRunId) {
          clearInterval(fillInterval);
          return;
        }

        cargoIdx++;
        setVisibleCargoCount(cargoIdx);

        // 컨테이너별 화물 수: 11, 11, 10
        if (cargoIdx <= 11) setContainerCount(1);
        else if (cargoIdx <= 22) setContainerCount(2);
        else setContainerCount(3);

        if (cargoIdx >= TOTAL_CARGO) {
          clearInterval(fillInterval);

          timeouts.push(setTimeout(() => {
            if (runIdRef.current !== currentRunId) return;
            setPhase('scanning');
            let progress = 0;
            const scanInterval = setInterval(() => {
              if (runIdRef.current !== currentRunId) {
                clearInterval(scanInterval);
                return;
              }
              progress += 0.04;
              setScanProgress(Math.min(progress, 1));

              if (progress >= 1) {
                clearInterval(scanInterval);
                timeouts.push(setTimeout(() => {
                  if (runIdRef.current !== currentRunId) return;
                  setPhase('optimizing');
                  setIsOptimized(true);

                  timeouts.push(setTimeout(() => {
                    if (runIdRef.current !== currentRunId) return;
                    setPhase('done');

                    timeouts.push(setTimeout(() => {
                      if (runIdRef.current !== currentRunId) return;
                      runDemo();
                    }, 1200));
                  }, 250));
                }, 300));
              }
            }, 30);
            intervals.push(scanInterval);
          }, 400));
        }
      }, 80);
      intervals.push(fillInterval);
    };

    runDemo();

    return () => {
      runIdRef.current++;
      timeouts.forEach(t => clearTimeout(t));
      intervals.forEach(i => clearInterval(i));
    };
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-slate-800/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-700">
          <PhaseIndicator phase={phase} containerCount={containerCount} />
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-10 w-48">
        <div className="bg-slate-800/90 backdrop-blur p-2 rounded-lg border border-slate-700">
          <StatsPanel phase={phase} containerCount={containerCount} cargoCount={visibleCargoCount} />
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-10">
        <div className={`px-3 py-2 rounded-lg backdrop-blur border flex items-center gap-2 text-xs ${
          phase === 'filling' ? 'bg-slate-800/50 border-slate-600' :
          phase === 'scanning' ? 'bg-blue-900/50 border-blue-600' :
          phase === 'optimizing' ? 'bg-yellow-900/50 border-yellow-600' :
          'bg-green-900/50 border-green-600'
        }`}>
          {phase === 'filling' && <><span>📦</span><span className="text-slate-300">{visibleCargoCount}/{TOTAL_CARGO}</span></>}
          {phase === 'scanning' && <><div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /><span className="text-slate-300">{Math.round(scanProgress * 100)}%</span></>}
          {phase === 'optimizing' && <><span className="animate-pulse">⚡</span><span className="text-slate-300">3 → 2</span></>}
          {phase === 'done' && <><span>✅</span><span className="text-green-300">-33%</span></>}
        </div>
      </div>

      <Canvas
        camera={{ position: [8, 8, 10], fov: 50, near: 0.01, far: 100 }}
        onCreated={({ gl }) => gl.setClearColor('#0f172a')}
      >
        <Scene
          phase={phase}
          visibleCargoCount={visibleCargoCount}
          containerCount={containerCount}
          scanProgress={scanProgress}
          isOptimized={isOptimized}
        />
      </Canvas>
    </div>
  );
};

export default ContainerDemo;
