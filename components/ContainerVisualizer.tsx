import React, { useState, useRef, useMemo } from 'react';
import { ContainerSpec, PackedItem } from '../types';

interface ContainerVisualizerProps {
  container: ContainerSpec;
  packedItems: PackedItem[];
  onItemMove?: (uniqueId: string, newPos: { x: number; y: number; z: number }) => void;
  selectedGroupId?: string | null;
  onSelectGroup?: (id: string) => void;
  isArranging?: boolean;
}

const ContainerVisualizer: React.FC<ContainerVisualizerProps> = ({
  container,
  packedItems,
  onItemMove,
  selectedGroupId,
  onSelectGroup,
  isArranging = false
}) => {
  // Camera State
  const [rotation, setRotation] = useState({ x: -25, y: 45 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.8);
  const [showCoG, setShowCoG] = useState(true); // Controls visual marker - default ON

  // Interaction State
  const [isRotateDragging, setIsRotateDragging] = useState(false);
  const [isPanDragging, setIsPanDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Scaling: 1mm = 0.06px (approx)
  const PIXEL_SCALE = 0.06;

  // -- Weight & CoG Calculation --
  const weightStats = useMemo(() => {
    let totalWeight = 0;
    let momentX = 0; // Moment around Z-axis (affecting X coord)
    let momentZ = 0; // Moment around X-axis (affecting Z coord)

    packedItems.forEach(item => {
      const w = item.weight || 0;
      totalWeight += w;
      
      // Center of item position
      const centerX = item.position.x + (item.dimensions.width / 2);
      const centerZ = item.position.z + (item.dimensions.length / 2);
      
      momentX += w * centerX;
      momentZ += w * centerZ;
    });

    const cogX = totalWeight > 0 ? momentX / totalWeight : container.width / 2;
    const cogZ = totalWeight > 0 ? momentZ / totalWeight : container.length / 2;

    return { totalWeight, cogX, cogZ };
  }, [packedItems, container]);

  // -- Event Handlers --

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const direction = -Math.sign(e.deltaY); 
    const zoomFactor = 0.1; 
    let newScale = scale + (direction * zoomFactor);
    newScale = Math.max(0.2, Math.min(4.0, newScale));
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (e.button === 2) {
      setIsRotateDragging(true);
    } else if (e.button === 1) {
      setIsPanDragging(true);
    }
  };

  const handleItemMouseDown = (e: React.MouseEvent, item: PackedItem) => {
    if (e.button !== 0) return; 
    e.stopPropagation();
    e.preventDefault();
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setDraggedItemId(item.uniqueId);
    
    if (onSelectGroup) {
      onSelectGroup(item.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    // 1. Item Dragging (Left Click)
    if (draggedItemId && onItemMove) {
      const item = packedItems.find(i => i.uniqueId === draggedItemId);
      if (item) {
        const radY = (rotation.y * Math.PI) / 180;
        const sin = Math.sin(radY);
        const cos = Math.cos(radY);
        
        const moveFactor = 1.0 / (scale * PIXEL_SCALE); 

        // Apply rotation to delta (Screen -> World)
        const dVisualLength = (deltaX * cos + deltaY * sin) * moveFactor; // Z movement
        const dVisualWidth = (-deltaX * sin + deltaY * cos) * moveFactor; // X movement

        let newPackerZ = item.position.z + dVisualLength;
        let newPackerX = item.position.x + dVisualWidth;

        // Clamp to container bounds
        newPackerX = Math.max(0, Math.min(container.width - item.dimensions.width, newPackerX));
        newPackerZ = Math.max(0, Math.min(container.length - item.dimensions.length, newPackerZ));

        // -- Gravity / Stacking Logic --
        let newPackerY = 0;
        const tolerance = 2; 

        const myMinX = newPackerX + tolerance;
        const myMaxX = newPackerX + item.dimensions.width - tolerance;
        const myMinZ = newPackerZ + tolerance;
        const myMaxZ = newPackerZ + item.dimensions.length - tolerance;

        for (const other of packedItems) {
           if (other.uniqueId === draggedItemId) continue;

           const oMinX = other.position.x;
           const oMaxX = other.position.x + other.dimensions.width;
           const oMinZ = other.position.z;
           const oMaxZ = other.position.z + other.dimensions.length;
           const oMaxY = other.position.y + other.dimensions.height;

           const intersects = (myMinX < oMaxX && myMaxX > oMinX) &&
                              (myMinZ < oMaxZ && myMaxZ > oMinZ);

           if (intersects) {
              if (oMaxY > newPackerY) {
                 newPackerY = oMaxY;
              }
           }
        }

        if (newPackerY + item.dimensions.height <= container.height) {
           onItemMove(draggedItemId, { x: newPackerX, y: newPackerY, z: newPackerZ });
        }
      }
      return;
    }

    // 2. Rotate
    if (isRotateDragging) {
      setRotation(prev => ({
        x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
        y: prev.y + deltaX * 0.5
      }));
      return;
    }

    // 3. Pan
    if (isPanDragging) {
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsRotateDragging(false);
    setIsPanDragging(false);
    setDraggedItemId(null);
  };

  // -- Visual Dimensions --
  const cVisualWidth = container.length * PIXEL_SCALE; // Screen X
  const cVisualHeight = container.height * PIXEL_SCALE; // Screen Y
  const cVisualDepth = container.width * PIXEL_SCALE;   // Screen Z

  // Calculate visual CoG position
  const visualCogX = (weightStats.cogZ * PIXEL_SCALE) - (cVisualWidth / 2);
  const visualCogZ = (weightStats.cogX * PIXEL_SCALE) - (cVisualDepth / 2);

  const Face = ({ w, h, tx, ty, tz, rx, ry, rz, bg, border, opacity = 1, children }: any) => (
    <div 
      className={`absolute border-slate-600 ${border ? 'border' : ''} transition-colors`}
      style={{
        width: w, 
        height: h,
        backgroundColor: bg,
        opacity: opacity,
        left: '50%',
        top: '50%',
        marginLeft: -w / 2,
        marginTop: -h / 2,
        transform: `
          translateX(${tx || 0}px) translateY(${ty || 0}px) translateZ(${tz || 0}px) 
          rotateX(${rx || 0}deg) rotateY(${ry || 0}deg) rotateZ(${rz || 0}deg)
        `,
        pointerEvents: 'none', 
      }} 
    >
      {children}
    </div>
  );

  return (
    <div
      className="w-full h-full bg-slate-900 overflow-hidden relative cursor-move select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
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
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></span>
            </div>
          </div>
        </div>
      )}
      {/* UI Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-slate-800/80 backdrop-blur text-white text-xs p-2 rounded border border-slate-600 shadow-lg">
           <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 좌클릭 드래그: 화물 이동/적재</p>
           <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> 우클릭 드래그: 화면 회전</p>
           <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 휠 드래그: 화면 이동 (Pan)</p>
           <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> 휠 스크롤: 확대/축소</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 text-slate-400">
        <div className="text-xs">
          <p>Container: {container.type}</p>
          <p>Scale: {scale.toFixed(2)}x</p>
        </div>
        {/* Always Show Weight Stats if weight exists */}
        {weightStats.totalWeight > 0 && (
          <div className="bg-slate-800/80 backdrop-blur border border-slate-600 rounded p-2 text-xs mt-1 shadow-lg transition-all animate-fade-in-up">
             <p className="text-white font-bold mb-1">⚖️ Weight Stats</p>
             <p>Total: <span className="text-blue-400">{weightStats.totalWeight.toLocaleString()} kg</span></p>
             <p>CoG Offset: <span className="text-slate-400">X:{(weightStats.cogX - container.width/2).toFixed(0)}mm / Z:{(weightStats.cogZ - container.length/2).toFixed(0)}mm</span></p>
          </div>
        )}
      </div>

      {/* Analysis Toggle */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
        <button 
          onClick={() => setShowCoG(!showCoG)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all shadow-lg border ${
            showCoG 
              ? 'bg-blue-600 text-white border-blue-500' 
              : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
          }`}
        >
          {showCoG ? '🎯' : '⭕'} 무게 중심(CoG) 시각화
        </button>
      </div>

      {/* 3D Scene Root */}
      <div 
        className="perspective-container w-full h-full flex items-center justify-center"
        style={{ perspective: '2000px' }}
      >
        <div 
          className="preserve-3d transition-transform duration-75 ease-linear"
          style={{
            transform: `
              translateX(${pan.x}px) translateY(${pan.y}px)
              scale(${scale}) 
              rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)
            `,
            width: 0, height: 0, 
            position: 'relative',
          }}
        >
          {/* Floor (Bottom) */}
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

          {/* Ceiling (Top Face) for CoG Visualization - Transparent but active for marker */}
          <Face 
            w={cVisualWidth} h={cVisualDepth} 
            ty={-cVisualHeight / 2} 
            rx={90} 
            bg="transparent" 
            opacity={1}
            border
          >
             {showCoG && weightStats.totalWeight > 0 && (
               <div className="absolute top-0 left-0 w-full h-full preserve-3d">
                   {/* Top Marker */}
                   <div 
                     className="absolute w-8 h-8 rounded-full border-2 border-red-500 bg-red-500/30 flex items-center justify-center z-50 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse"
                     style={{
                        left: '50%', top: '50%',
                        marginLeft: -16, marginTop: -16, 
                        transform: `translate(${visualCogX}px, ${visualCogZ}px)` 
                     }}
                   >
                      <div className="w-[1px] h-full bg-red-500"></div>
                      <div className="h-[1px] w-full bg-red-500 absolute"></div>
                      <div className="absolute -top-6 text-[10px] font-bold text-red-400 bg-black/80 px-1 rounded whitespace-nowrap">CoG Target</div>
                   </div>

                   {/* Laser Drop Line to Bottom */}
                    <div 
                     className="absolute w-[1px] bg-gradient-to-b from-red-500 to-transparent opacity-80"
                     style={{
                        left: '50%', top: '50%',
                        height: cVisualHeight,
                        transformOrigin: 'top center',
                        transform: `translate(${visualCogX}px, ${visualCogZ}px) rotateX(-90deg)`,
                        borderLeft: '1px dashed rgba(239,68,68,0.5)'
                     }}
                   />
               </div>
             )}
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
          
          {/* Walls */}
          <Face w={cVisualWidth} h={cVisualHeight} tz={-cVisualDepth / 2} bg="#334155" opacity={0.5} border />
          <Face w={cVisualWidth} h={cVisualHeight} tz={cVisualDepth / 2} bg="transparent" border opacity={0.1} />
          <Face w={cVisualDepth} h={cVisualHeight} tx={-cVisualWidth / 2} ry={90} bg="#334155" opacity={0.5} border />
          <Face w={cVisualDepth} h={cVisualHeight} tx={cVisualWidth / 2} ry={90} bg="#334155" opacity={0.5} border />

          {/* Cargo Items */}
          {packedItems.map((item) => {
            const iVisualWidth = item.dimensions.length * PIXEL_SCALE; 
            const iVisualHeight = item.dimensions.height * PIXEL_SCALE; 
            const iVisualDepth = item.dimensions.width * PIXEL_SCALE; 

            const xPos = (item.position.z * PIXEL_SCALE) - (cVisualWidth / 2) + (iVisualWidth / 2);
            const yPos = (cVisualHeight / 2) - (item.position.y * PIXEL_SCALE) - (iVisualHeight / 2);
            const zPos = (item.position.x * PIXEL_SCALE) - (cVisualDepth / 2) + (iVisualDepth / 2);

            const isHovered = hoveredItemId === item.uniqueId;
            const isDragged = draggedItemId === item.uniqueId;
            const isGroupSelected = selectedGroupId === item.id;
            
            const isFaded = selectedGroupId && !isGroupSelected;
            const faceFilter = isFaded ? 'brightness(0.6) grayscale(0.5)' : 'brightness(1.0)';

            return (
              <div
                key={item.uniqueId}
                className="absolute preserve-3d group cursor-pointer"
                style={{
                  width: iVisualWidth,
                  height: iVisualHeight,
                  left: '50%', top: '50%',
                  marginLeft: -iVisualWidth / 2, marginTop: -iVisualHeight / 2,
                  transform: `translateX(${xPos}px) translateY(${yPos}px) translateZ(${zPos}px)`,
                  zIndex: isDragged ? 100 : 'auto',
                }}
                onMouseDown={(e) => handleItemMouseDown(e, item)}
                onMouseEnter={() => setHoveredItemId(item.uniqueId)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                {/* Selection Highlight */}
                {isGroupSelected && (
                    <div className="absolute inset-0 border-2 border-white/80 pointer-events-none z-50 animate-pulse" 
                         style={{ transform: `translateZ(${iVisualDepth/2 + 1}px)` }} />
                )}

                {/* Box Faces */}
                <div className={`absolute border border-black/20 w-full h-full transition-colors ${isHovered || isDragged ? 'brightness-125' : ''}`} 
                     style={{ background: item.color, transform: `translateZ(${iVisualDepth / 2}px)`, filter: faceFilter }}>
                      {(isHovered || isDragged) && <div className="absolute inset-0 border-2 border-white/50"></div>}
                     </div>
                <div className={`absolute border border-black/20 w-full h-full transition-colors ${isHovered || isDragged ? 'brightness-125' : ''}`} 
                     style={{ background: item.color, transform: `rotateY(180deg) translateZ(${iVisualDepth / 2}px)`, filter: faceFilter }} />
                <div className={`absolute border border-black/20 h-full transition-colors ${isHovered || isDragged ? 'brightness-125' : ''}`} 
                     style={{ width: iVisualDepth, background: item.color, transform: `rotateY(90deg) translateZ(${iVisualWidth / 2}px)`, left: '50%', marginLeft: -iVisualDepth/2, filter: faceFilter }} />
                <div className={`absolute border border-black/20 h-full transition-colors ${isHovered || isDragged ? 'brightness-125' : ''}`} 
                     style={{ width: iVisualDepth, background: item.color, transform: `rotateY(-90deg) translateZ(${iVisualWidth / 2}px)`, left: '50%', marginLeft: -iVisualDepth/2, filter: faceFilter }} />
                <div className={`absolute border border-black/20 w-full flex flex-col items-center justify-center overflow-hidden transition-colors ${isHovered || isDragged ? 'brightness-125' : ''}`} 
                     style={{ height: iVisualDepth, background: item.color, transform: `rotateX(90deg) translateZ(${iVisualHeight / 2}px)`, top: '50%', marginTop: -iVisualDepth/2, filter: `${faceFilter} brightness(1.1)` }}>
                   {(isHovered || isDragged || isGroupSelected) && <span className="text-[10px] text-black font-bold px-1 bg-white/30 rounded">{item.name}</span>}
                   {isHovered && item.weight && showCoG && <span className="text-[8px] text-black font-medium mt-0.5 bg-white/30 px-1 rounded">{item.weight}kg</span>}
                </div>
                <div className={`absolute border border-black/20 w-full transition-colors ${isHovered || isDragged ? 'brightness-125' : ''}`} 
                     style={{ height: iVisualDepth, background: item.color, transform: `rotateX(-90deg) translateZ(${iVisualHeight / 2}px)`, top: '50%', marginTop: -iVisualDepth/2, filter: `${faceFilter} brightness(0.8)` }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContainerVisualizer;