import React, { useState, useEffect, useMemo } from 'react';

interface DemoItem {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; length: number };
  delay: number;
  weight?: number;
}

const ContainerDemo: React.FC = () => {
  const [rotation, setRotation] = useState({ x: -25, y: 25 });
  const [loadedItems, setLoadedItems] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [efficiency, setEfficiency] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showCoG, setShowCoG] = useState(true);
  const [scale, setScale] = useState(1.2);

  // Container dimensions (20ft container in cm)
  const container = {
    width: 235,
    height: 239,
    length: 590
  };

  // Scaling: 1cm = 0.6px
  const PIXEL_SCALE = 0.6;

  const cVisualWidth = container.length * PIXEL_SCALE;
  const cVisualHeight = container.height * PIXEL_SCALE;
  const cVisualDepth = container.width * PIXEL_SCALE;

  // Demo items with tight packing and varied sizes
  // 색상: 세련된 블루톤 + 포인트 (반투명)
  const colors = {
    blue: 'rgba(37, 99, 235, 0.75)',      // 진한 블루
    cyan: 'rgba(6, 182, 212, 0.75)',      // 시안/청록
    slate: 'rgba(100, 116, 139, 0.75)',   // 슬레이트 그레이
    orange: 'rgba(249, 115, 22, 0.75)',   // 포인트 주황
  };

  const demoItems: DemoItem[] = [
    // Bottom Layer - Base foundation (cm 단위)
    { id: '1', name: 'Heavy Machine', color: colors.blue, position: { x: 0, y: 0, z: 0 }, dimensions: { width: 150, height: 120, length: 200 }, delay: 500, weight: 3500 },
    { id: '2', name: 'Electronics', color: colors.cyan, position: { x: 150, y: 0, z: 0 }, dimensions: { width: 80, height: 90, length: 120 }, delay: 650, weight: 850 },
    { id: '3', name: 'Furniture Set', color: colors.slate, position: { x: 150, y: 0, z: 120 }, dimensions: { width: 80, height: 90, length: 80 }, delay: 800, weight: 720 },
    { id: '4', name: 'Steel Coils', color: colors.orange, position: { x: 0, y: 0, z: 200 }, dimensions: { width: 115, height: 110, length: 120 }, delay: 950, weight: 4800 },
    { id: '5', name: 'Textiles', color: colors.blue, position: { x: 115, y: 0, z: 200 }, dimensions: { width: 115, height: 70, length: 120 }, delay: 1100, weight: 650 },
    { id: '6', name: 'Machinery', color: colors.cyan, position: { x: 0, y: 0, z: 320 }, dimensions: { width: 230, height: 80, length: 270 }, delay: 1250, weight: 3200 },

    // Second Layer - Fill tightly
    { id: '7', name: 'Toys', color: colors.slate, position: { x: 150, y: 90, z: 0 }, dimensions: { width: 80, height: 60, length: 200 }, delay: 1400, weight: 320 },
    { id: '8', name: 'Books', color: colors.blue, position: { x: 0, y: 120, z: 0 }, dimensions: { width: 150, height: 70, length: 200 }, delay: 1550, weight: 1600 },
    { id: '9', name: 'Glass Items', color: colors.cyan, position: { x: 115, y: 70, z: 200 }, dimensions: { width: 115, height: 100, length: 120 }, delay: 1700, weight: 450 },
    { id: '10', name: 'Plastics', color: colors.blue, position: { x: 0, y: 110, z: 200 }, dimensions: { width: 115, height: 60, length: 120 }, delay: 1850, weight: 280 },
    { id: '11', name: 'Metal Parts', color: colors.slate, position: { x: 0, y: 80, z: 320 }, dimensions: { width: 115, height: 90, length: 270 }, delay: 2000, weight: 2100 },
    { id: '12', name: 'Chemicals', color: colors.orange, position: { x: 115, y: 80, z: 320 }, dimensions: { width: 115, height: 90, length: 270 }, delay: 2150, weight: 890 },

    // Upper Layer - Smaller items filling remaining space
    { id: '13', name: 'Tools', color: colors.cyan, position: { x: 150, y: 150, z: 0 }, dimensions: { width: 80, height: 60, length: 120 }, delay: 2300, weight: 680 },
    { id: '14', name: 'Samples', color: colors.blue, position: { x: 150, y: 150, z: 120 }, dimensions: { width: 80, height: 60, length: 80 }, delay: 2450, weight: 150 },
    { id: '15', name: 'Documents', color: colors.slate, position: { x: 0, y: 170, z: 200 }, dimensions: { width: 230, height: 50, length: 120 }, delay: 2600, weight: 45 },
    { id: '16', name: 'Spare Parts', color: colors.blue, position: { x: 0, y: 170, z: 320 }, dimensions: { width: 115, height: 50, length: 270 }, delay: 2750, weight: 520 },
    { id: '17', name: 'Express', color: colors.cyan, position: { x: 115, y: 170, z: 320 }, dimensions: { width: 115, height: 50, length: 270 }, delay: 2900, weight: 95 },
    { id: '18', name: 'Priority', color: colors.slate, position: { x: 0, y: 190, z: 0 }, dimensions: { width: 150, height: 40, length: 200 }, delay: 3050, weight: 210 },
  ];

  // Calculate efficiency based on loaded items
  const totalVolume = useMemo(() => {
    const containerVolume = container.width * container.height * container.length;
    const loadedVolume = demoItems
      .filter(item => loadedItems.includes(item.id))
      .reduce((acc, item) => acc + (item.dimensions.width * item.dimensions.height * item.dimensions.length), 0);
    return {
      container: containerVolume,
      loaded: loadedVolume,
      efficiency: ((loadedVolume / containerVolume) * 100).toFixed(1)
    };
  }, [loadedItems]);

  // Calculate total weight and CoG
  const weightStats = useMemo(() => {
    let totalWeight = 0;
    let momentX = 0;
    let momentZ = 0;

    const loadedDemoItems = demoItems.filter(item => loadedItems.includes(item.id));

    loadedDemoItems.forEach(item => {
      const w = item.weight || 0;
      totalWeight += w;

      const centerX = item.position.x + (item.dimensions.width / 2);
      const centerZ = item.position.z + (item.dimensions.length / 2);

      momentX += w * centerX;
      momentZ += w * centerZ;
    });

    const cogX = totalWeight > 0 ? momentX / totalWeight : container.width / 2;
    const cogZ = totalWeight > 0 ? momentZ / totalWeight : container.length / 2;

    return {
      totalWeight,
      cogX,
      cogZ,
      offsetX: cogX - container.width / 2,
      offsetZ: cogZ - container.length / 2
    };
  }, [loadedItems]);

  // Set scale based on window size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScale(0.75);  // Mobile - 더 크게 조정
      } else if (width < 768) {
        setScale(0.85);   // Small tablet
      } else if (width < 1024) {
        setScale(1);     // Medium
      } else {
        setScale(1.2);   // Large
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Staged loading with rotation
  const [currentStage, setCurrentStage] = useState(0);
  const [targetRotation, setTargetRotation] = useState(25);

  // Stage configuration: each stage has rotation angle and items to load
  // 앞쪽으로 회전 (양수에서 음수 방향)
  const stages = useMemo(() => [
    { rotation: 25, itemCount: 9 },     // Stage 1: 25도 → 9개 쌓기
    { rotation: 0, itemCount: 5 },      // Stage 2: 25도 앞으로 회전 → 5개 쌓기
    { rotation: -25, itemCount: 4 },    // Stage 3: 25도 앞으로 회전 → 4개 쌓기
  ], []);

  // Smooth rotation animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setRotation(prev => {
        const diff = targetRotation - prev.y;
        if (Math.abs(diff) < 0.5) {
          return { ...prev, y: targetRotation };
        }
        return { ...prev, y: prev.y + diff * 0.12 };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, targetRotation]);

  // Staged loading logic
  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    let isCancelled = false;

    const runStage = (stageIndex: number, startItemIndex: number) => {
      if (isCancelled || stageIndex >= stages.length) {
        // All stages complete, reset after delay
        const resetTimer = setTimeout(() => {
          if (!isCancelled) {
            setLoadedItems([]);
            setCurrentStage(0);
            setTargetRotation(25);
            runStage(0, 0);
          }
        }, 1500);
        timers.push(resetTimer);
        return;
      }

      const stage = stages[stageIndex];
      setCurrentStage(stageIndex);
      setTargetRotation(stage.rotation);

      // Wait for rotation to complete, then load items
      const rotationDelay = setTimeout(() => {
        if (isCancelled) return;

        // Load items one by one
        for (let i = 0; i < stage.itemCount; i++) {
          const itemIndex = startItemIndex + i;
          if (itemIndex < demoItems.length) {
            const loadTimer = setTimeout(() => {
              if (!isCancelled) {
                setLoadedItems(prev => [...prev, demoItems[itemIndex].id]);
              }
            }, i * 120); // 120ms delay between each item
            timers.push(loadTimer);
          }
        }

        // Move to next stage
        const nextStageTimer = setTimeout(() => {
          if (!isCancelled) {
            runStage(stageIndex + 1, startItemIndex + stage.itemCount);
          }
        }, stage.itemCount * 120 + 500); // Wait for all items + extra delay
        timers.push(nextStageTimer);
      }, 600); // Wait 0.6s for rotation

      timers.push(rotationDelay);
    };

    runStage(0, 0);

    return () => {
      isCancelled = true;
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const Face = ({ w, h, tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0, bg = '#000', opacity = 1, border = false, children }: any) => (
    <div
      className={`absolute ${border ? 'border border-slate-600' : ''}`}
      style={{
        width: w, height: h, background: bg, opacity,
        left: '50%', top: '50%',
        marginLeft: -w / 2, marginTop: -h / 2,
        transform: `
          translateX(${tx}px) translateY(${ty}px) translateZ(${tz}px)
          rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)
        `,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">

      {/* Top Status */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-slate-800/80 backdrop-blur text-white text-[10px] px-3 py-2 rounded border border-slate-600 shadow-lg">
          <p className="font-bold">20ft Standard Container</p>
        </div>
      </div>

      {/* Efficiency Widget - Right Side */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-600 rounded p-3 shadow-lg">
          <div className="text-[10px] text-slate-400 mb-2 font-bold">효율성 분석</div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-300">적재율</span>
              <span className="text-blue-400 font-bold">{totalVolume.efficiency}%</span>
            </div>

            <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full w-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-transform duration-1000 origin-left"
                style={{ transform: `scaleX(${totalVolume.efficiency / 100})` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-300">총 중량</span>
              <span className="text-green-400 font-bold">{weightStats.totalWeight.toLocaleString()} kg</span>
            </div>

            {showCoG && weightStats.totalWeight > 0 && (
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-700">
                <span className="text-slate-300">무게중심</span>
                <span className="text-red-400 text-[9px] font-bold">
                  X:{weightStats.offsetX.toFixed(1)}cm Z:{weightStats.offsetZ.toFixed(1)}cm
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-300">적재 박스</span>
              <span className="text-yellow-400 font-bold">{loadedItems.length} / {demoItems.length}</span>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="bg-slate-800/80 backdrop-blur border border-slate-600 rounded px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOptimizing ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
            <span className="text-[10px] text-white font-bold">
              {isOptimizing ? 'Optimizing' : 'Loading'}
            </span>
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <div className="perspective-container w-full h-full flex items-center justify-center pt-32 sm:pt-28 md:pt-20" style={{ perspective: '2000px' }}>
        <div
          className="transition-transform duration-75 ease-linear"
          style={{
            transform: `scale(${scale}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            width: 0, height: 0, position: 'relative',
          }}
        >
          {/* Container */}
          {/* Floor */}
          <Face
            w={cVisualWidth} h={cVisualDepth}
            ty={cVisualHeight / 2}
            rx={90}
            bg="#1e293b"
            opacity={0.9}
            border
          >
            <div className="absolute top-1/2 w-full h-[1px] bg-slate-500/30"></div>
            <div className="absolute left-1/2 h-full w-[1px] bg-slate-500/30"></div>
          </Face>

          {/* Grid Pattern on Floor */}
          <div className="absolute pointer-events-none" style={{
            width: cVisualWidth, height: cVisualDepth,
            left: '50%', top: '50%',
            marginLeft: -cVisualWidth/2, marginTop: -cVisualDepth/2,
            transform: `translateY(${cVisualHeight/2}px) rotateX(90deg)`,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />

          {/* Ceiling for CoG visualization */}
          <Face
            w={cVisualWidth} h={cVisualDepth}
            ty={-cVisualHeight / 2}
            rx={90}
            bg="transparent"
            opacity={1}
            border
          >
            {showCoG && weightStats.totalWeight > 0 && (
              <div className="absolute top-0 left-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                {/* CoG Marker */}
                <div
                  className="absolute w-6 h-6 rounded-full border-2 border-red-500 bg-red-500/30 flex items-center justify-center z-50 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse"
                  style={{
                    left: '50%', top: '50%',
                    marginLeft: -12, marginTop: -12,
                    transform: `translate(${(weightStats.cogZ - container.length/2) * PIXEL_SCALE}px, ${(weightStats.cogX - container.width/2) * PIXEL_SCALE}px)`
                  }}
                >
                  <div className="w-[1px] h-full bg-red-500"></div>
                  <div className="h-[1px] w-full bg-red-500 absolute"></div>
                </div>
                {/* Drop line */}
                <div
                  className="absolute w-[1px] bg-gradient-to-b from-red-500 to-transparent opacity-80"
                  style={{
                    left: '50%', top: '50%',
                    height: cVisualHeight,
                    transform: `translate(${(weightStats.cogZ - container.length/2) * PIXEL_SCALE}px, ${(weightStats.cogX - container.width/2) * PIXEL_SCALE}px) rotateX(-90deg)`,
                    transformOrigin: 'top center',
                  }}
                />
              </div>
            )}
          </Face>

          {/* Walls */}
          <Face w={cVisualWidth} h={cVisualHeight} tz={-cVisualDepth / 2} bg="#334155" opacity={0.5} border />
          <Face w={cVisualWidth} h={cVisualHeight} tz={cVisualDepth / 2} bg="transparent" border opacity={0.1} />
          <Face w={cVisualDepth} h={cVisualHeight} tx={-cVisualWidth / 2} ry={90} bg="#334155" opacity={0.5} border />
          <Face w={cVisualDepth} h={cVisualHeight} tx={cVisualWidth / 2} ry={90} bg="#334155" opacity={0.5} border />

          {/* Cargo Items */}
          {demoItems.filter(item => loadedItems.includes(item.id)).map((item) => {
            const iVisualWidth = item.dimensions.length * PIXEL_SCALE;
            const iVisualHeight = item.dimensions.height * PIXEL_SCALE;
            const iVisualDepth = item.dimensions.width * PIXEL_SCALE;

            const xPos = (item.position.z * PIXEL_SCALE) - (cVisualWidth / 2) + (iVisualWidth / 2);
            const yPos = (cVisualHeight / 2) - (item.position.y * PIXEL_SCALE) - (iVisualHeight / 2);
            const zPos = (item.position.x * PIXEL_SCALE) - (cVisualDepth / 2) + (iVisualDepth / 2);

            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  width: iVisualWidth,
                  height: iVisualHeight,
                  left: '50%', top: '50%',
                  marginLeft: -iVisualWidth / 2, marginTop: -iVisualHeight / 2,
                  transform: `translateX(${xPos}px) translateY(${yPos}px) translateZ(${zPos}px)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Box Faces - inset shadow로 외곽선 표시 (틈 방지) */}
                <div className="absolute w-full h-full"
                     style={{ background: item.color, transform: `translateZ(${iVisualDepth / 2}px)`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)' }} />
                <div className="absolute w-full h-full"
                     style={{ background: item.color, transform: `rotateY(180deg) translateZ(${iVisualDepth / 2}px)`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)' }} />
                <div className="absolute h-full"
                     style={{ width: iVisualDepth, background: item.color, transform: `rotateY(90deg) translateZ(${iVisualWidth / 2}px)`, left: '50%', marginLeft: -iVisualDepth/2, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)' }} />
                <div className="absolute h-full"
                     style={{ width: iVisualDepth, background: item.color, transform: `rotateY(-90deg) translateZ(${iVisualWidth / 2}px)`, left: '50%', marginLeft: -iVisualDepth/2, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)' }} />
                <div className="absolute w-full flex items-center justify-center"
                     style={{ height: iVisualDepth, background: item.color, transform: `rotateX(90deg) translateZ(${iVisualHeight / 2}px)`, top: '50%', marginTop: -iVisualDepth/2, filter: 'brightness(1.1)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)' }}>
                  <span className="text-[10px] text-black font-bold px-1 bg-white/30 rounded">{item.name}</span>
                </div>
                <div className="absolute w-full"
                     style={{ height: iVisualDepth, background: item.color, transform: `rotateX(-90deg) translateZ(${iVisualHeight / 2}px)`, top: '50%', marginTop: -iVisualDepth/2, filter: 'brightness(0.8)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContainerDemo;