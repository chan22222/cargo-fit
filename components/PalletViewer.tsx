import React, { useState, useRef, useEffect } from 'react';
import { Dimensions } from '../types';

interface PalletItem {
  id: string;
  name: string;
  dimensions: Dimensions;
  position: { x: number; y: number; z: number };
  color: string;
}

interface PalletViewerProps {
  palletSize: Dimensions;
  palletItems: PalletItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  maxHeight: number;
}

const PalletViewer: React.FC<PalletViewerProps> = ({
  palletSize,
  palletItems,
  selectedItemId,
  onSelectItem,
  maxHeight
}) => {
  const [rotation, setRotation] = useState({ x: -25, y: 45 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'rotate' | 'pan' | null>(null);
  const [showOpaque, setShowOpaque] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const PIXEL_SCALE = 0.08;

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
        x: prev.x + deltaY * 0.5,  // 원래 방향으로 복구
        y: prev.y + deltaX * 0.5   // 원래 방향으로 복구
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
    const baseOpacity = showOpaque ? 1.0 : (isPallet ? 0.9 : 0.85);

    return (
      <g key={id} onClick={() => !isPallet && onSelectItem(id)} className="cursor-pointer">
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
    const maxHeight = palletItems.length > 0
      ? Math.max(...palletItems.map(i => i.position.y + i.dimensions.height))
      : palletSize.height;

    const totalVolume = palletItems.reduce((acc, item) =>
      acc + (item.dimensions.width * item.dimensions.height * item.dimensions.length), 0);

    const containerVolume = palletSize.width * palletSize.length * (maxHeight - palletSize.height);
    const efficiency = containerVolume > 0 ? (totalVolume / containerVolume) * 100 : 0;

    return { itemCount: palletItems.length, maxHeight, efficiency };
  }, [palletItems, palletSize]);

  return (
    <div className="w-full h-full bg-slate-900 relative">
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

      {/* 통계 표시 */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-white/90 backdrop-blur p-4 rounded-xl">
          <p className="text-xs font-bold text-slate-600 mb-1">적재 현황</p>
          <p className="text-sm font-black text-slate-900">아이템: {stats.itemCount}개</p>
          <p className="text-sm font-black text-slate-900">최고 높이: {(stats.maxHeight / 10).toFixed(0)}cm</p>
          <p className="text-sm font-black text-slate-900">효율성: {stats.efficiency.toFixed(1)}%</p>
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
  );
};

export default PalletViewer;