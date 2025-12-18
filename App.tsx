
import React, { useState, useMemo, useCallback } from 'react';
import { ContainerType, CargoItem, PackedItem, ContainerSpec } from './types';
import { CONTAINER_SPECS } from './constants';
import { calculatePacking } from './services/packingService';
import ContainerVisualizer from './components/ContainerVisualizer';
import { CargoControls } from './components/CargoControls';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'simulator'>('home');

  // Simulator State
  const [containerType, setContainerType] = useState<ContainerType>(ContainerType.FT20);
  const [cargoList, setCargoList] = useState<CargoItem[]>([]);
  const [packedItems, setPackedItems] = useState<PackedItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isArranging, setIsArranging] = useState<boolean>(false);

  // Stats calculation
  const stats = useMemo(() => {
    const currentContainer = CONTAINER_SPECS[containerType];
    const totalVolume = currentContainer.width * currentContainer.height * currentContainer.length;
    const usedVolume = packedItems.reduce((acc, i) => acc + (i.dimensions.width * i.dimensions.height * i.dimensions.length), 0);
    return {
      volumeEfficiency: totalVolume > 0 ? (usedVolume / totalVolume) * 100 : 0,
      count: packedItems.length
    };
  }, [packedItems, containerType]);

  const findFreePosition = (
    container: ContainerSpec, 
    existingItems: PackedItem[], 
    dims: { width: number, height: number, length: number }
  ) => {
    const step = 100;
    for (let y = 0; y <= container.height - dims.height; y += step) {
      for (let z = 0; z <= container.length - dims.length; z += step) {
        for (let x = 0; x <= container.width - dims.width; x += step) {
          const candidateMinX = x;
          const candidateMaxX = x + dims.width;
          const candidateMinY = y;
          const candidateMaxY = y + dims.height;
          const candidateMinZ = z;
          const candidateMaxZ = z + dims.length;

          let collision = false;
          for (const item of existingItems) {
            const iMinX = item.position.x;
            const iMaxX = item.position.x + item.dimensions.width;
            const iMinY = item.position.y;
            const iMaxY = item.position.y + item.dimensions.height;
            const iMinZ = item.position.z;
            const iMaxZ = item.position.z + item.dimensions.length;

            if (
              candidateMinX < iMaxX && candidateMaxX > iMinX &&
              candidateMinY < iMaxY && candidateMaxY > iMinY &&
              candidateMinZ < iMaxZ && candidateMaxZ > iMinZ
            ) {
              collision = true;
              break;
            }
          }
          if (!collision) return { x, y, z };
        }
      }
    }
    return { x: 0, y: 0, z: 0 };
  };

  const handleAddCargo = (newItem: Omit<CargoItem, 'id'>) => {
    const item: CargoItem = {
      ...newItem,
      id: Math.random().toString(36).substr(2, 9),
    };
    setCargoList(prev => [...prev, item]);
    setSelectedGroupId(item.id);
    const currentContainer = CONTAINER_SPECS[containerType];
    let currentPackedItems = [...packedItems];
    for(let i=0; i<item.quantity; i++) {
      const pos = findFreePosition(currentContainer, currentPackedItems, item.dimensions);
      const newInstance: PackedItem = {
        ...item,
        uniqueId: `${item.id}-${i}-${Date.now()}`,
        weight: item.weight,
        position: pos
      };
      currentPackedItems.push(newInstance);
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

    // 1.5초 동안 고민하는 척
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = calculatePacking(currentContainer, cargoList);
    setPackedItems(result.packedItems);

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
             onClick={() => setActiveTab('simulator')}
             className={`text-sm font-bold transition-all duration-300 ${activeTab === 'simulator' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}
           >
             SIMULATOR
           </button>
           <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
           <button className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10">
             KOREAN / KRW
           </button>
        </nav>
      </header>

      {/* Content Injection */}
      {activeTab === 'home' ? (
        <LandingPage onStart={() => setActiveTab('simulator')} />
      ) : (
        <main className="flex-1 p-6 mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden min-h-0 bg-slate-50/50">

          {/* Main Visualizer Area with Left Ad Space */}
          <div className="lg:col-span-3 flex h-full min-h-0 gap-4">
              {/* Left Vertical Ad Space */}
              <div className="hidden lg:block w-24 bg-white border border-slate-200 rounded-2xl flex-shrink-0 shadow-sm">
                <div className="h-full flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest -rotate-90 whitespace-nowrap">
                    Sidebar Ad Slot
                  </span>
                </div>
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
            />
          </div>

        </main>
      )}
    </div>
  );
};

export default App;
