
import React, { useState } from 'react';
import { CargoItem, Dimensions } from '../types';
import { DEFAULT_CARGO_COLORS } from '../constants';

interface CargoControlsProps {
  onAddCargo: (cargo: Omit<CargoItem, 'id'> | CargoItem) => void;
  cargoList: CargoItem[];
  onRemoveCargo: (id: string) => void;
  onClear: () => void;
  onRotateCargo?: (id: string) => void;
  onAutoArrange?: () => void;
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  isArranging?: boolean;
  packingMode: 'bottom-first' | 'inner-first';
  onPackingModeChange: (mode: 'bottom-first' | 'inner-first') => void;
  noStandUp?: boolean;
  onNoStandUpChange?: (value: boolean) => void;
  noStack?: boolean;
  onNoStackChange?: (value: boolean) => void;
}

export const CargoControls: React.FC<CargoControlsProps> = ({
  onAddCargo,
  cargoList,
  onRemoveCargo,
  onClear,
  onRotateCargo,
  onAutoArrange,
  selectedGroupId,
  onSelectGroup,
  isArranging = false,
  packingMode,
  onPackingModeChange,
  noStandUp = false,
  onNoStandUpChange,
  noStack = false,
  onNoStackChange
}) => {
  const [name, setName] = useState('New Item');
  const [dims, setDims] = useState<Dimensions>({ width: 100, height: 100, length: 100 });
  const [quantity, setQuantity] = useState('1');
  const [weight, setWeight] = useState<string>('1');
  const [color, setColor] = useState(DEFAULT_CARGO_COLORS[0]);
  const [customPresets, setCustomPresets] = useState<{w: number, h: number, l: number, n: string}[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCargo({
      name,
      dimensions: dims,
      quantity: Math.min(100, Math.max(1, Number(quantity) || 1)),
      weight: weight ? Number(weight) : 0,
      color
    });
  };

  const handlePreset = (w: number, h: number, l: number, n: string) => {
    setDims({ width: w, height: h, length: l });
    setName(n);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 flex flex-col h-full overflow-hidden">

      {/* Fixed Header Only */}
      <div className="p-5 pb-3 shrink-0 border-b border-slate-100">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2 2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
           </div>
           <h2 className="text-base font-black text-slate-900 tracking-tight">화물 추가</h2>
        </div>
      </div>

      {/* Scrollable Content (Form + List) */}
      <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-6 scrollbar-hide">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">화물 식별명</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">규격 (L x W x H cm)</label>
              <button
                type="button"
                onClick={() => setDims({ width: dims.length, height: dims.height, length: dims.width })}
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
                value={dims.length}
                onChange={e => setDims({...dims, length: Math.min(1200, Number(e.target.value))})}
                className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                min="10" max="1200"
              />
              <input
                type="number"
                value={dims.width}
                onChange={e => setDims({...dims, width: Math.min(250, Number(e.target.value))})}
                className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                min="10" max="250"
              />
              <input
                type="number"
                value={dims.height}
                onChange={e => setDims({...dims, height: Math.min(300, Number(e.target.value))})}
                className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-center text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                min="10" max="300"
              />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                {[
                  {w: 110, h: 180, l: 110, n: 'KR팔레트'},
                  {w: 30, h: 30, l: 40, n: 'S박스'},
                  {w: 40, h: 40, l: 50, n: 'M박스'},
                  {w: 50, h: 50, l: 60, n: 'L박스'},
                  {w: 60, h: 60, l: 70, n: 'XL박스'},
                  {w: 120, h: 100, l: 80, n: 'IBC탱크'},
                  ...customPresets
                ].map((preset, idx) => (
                  <button
                    key={`${preset.n}-${idx}`}
                    type="button"
                    onClick={() => handlePreset(preset.w, preset.h, preset.l, preset.n)}
                    className="px-2.5 py-1 text-[9px] font-black bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:border-blue-500 transition-all flex items-center gap-1 group"
                  >
                    {preset.n}
                    {customPresets.includes(preset) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomPresets(customPresets.filter(p => p !== preset));
                        }}
                        className="w-3 h-3 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 적재 옵션 토글 */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onNoStandUpChange?.(!noStandUp)}
              className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                noStandUp
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              눕히기 금지
            </button>
            <button
              type="button"
              onClick={() => onNoStackChange?.(!noStack)}
              className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                noStack
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              2단 적재 금지
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">수량 (최대 100)</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                onFocus={() => setQuantity('')}
                onBlur={e => {
                  const val = Number(e.target.value);
                  if (!val || val < 1) setQuantity('1');
                  else if (val > 100) setQuantity('100');
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                min="1" max="100"
              />
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">무게 (kg)</label>
               <input
                type="number"
                value={weight}
                onChange={e => setWeight(String(Math.min(50000, Number(e.target.value))))}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner placeholder:text-slate-300"
                min="0" max="50000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">컬러</label>
              <div className="grid grid-cols-4 gap-1.5">
                {DEFAULT_CARGO_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-full aspect-square rounded-lg shadow-sm transition-all hover:scale-110 flex items-center justify-center ${color === c ? 'ring-2 ring-offset-1 ring-slate-900' : ''}`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <div className="w-1 h-1 bg-white rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">정렬 방식</label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => onPackingModeChange('bottom-first')}
                  className={`w-full px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                    packingMode === 'bottom-first'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  바닥부터 채우기
                </button>
                <button
                  type="button"
                  onClick={() => onPackingModeChange('inner-first')}
                  className={`w-full px-3 py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                    packingMode === 'inner-first'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  안쪽부터 채우기
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
          >
            화물 리스트에 추가
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-black text-slate-900 text-xs tracking-tight">화물 리스트 <span className="text-slate-300 font-bold ml-1">{cargoList.length}</span></h3>
            {cargoList.length > 0 && (
               <button onClick={onClear} className="text-[9px] text-slate-400 hover:text-red-500 font-black uppercase tracking-widest transition-colors">Clear</button>
            )}
          </div>
          
          <div className="space-y-2">
            {cargoList.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-300 text-[10px] font-bold">리스트가 비어있습니다.</p>
              </div>
            ) : (
              cargoList.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => onSelectGroup(item.id)}
                  className={`group relative flex items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedGroupId === item.id 
                      ? 'bg-white border-slate-900 shadow-md translate-x-1' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="w-1.5 h-8 rounded-full mr-3 shrink-0" style={{ backgroundColor: item.color }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1.5 truncate flex-1">
                        <p className={`font-black text-[11px] truncate ${selectedGroupId === item.id ? 'text-slate-900' : 'text-slate-700'}`}>
                          {item.name}
                        </p>
                      </div>
                      {item.weight ? (
                        <span className="shrink-0 text-[8px] font-black text-slate-400 uppercase ml-2">
                          {item.weight}KG
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center text-[9px] text-slate-400 font-bold gap-2">
                      <span className="text-blue-600 font-black">{item.quantity}EA</span>
                      <span className="truncate opacity-60">
                        {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onRotateCargo && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRotateCargo(item.id); }}
                        className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="90도 회전"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveCargo(item.id); }}
                      className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {onAutoArrange && cargoList.length > 0 && (
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
           <button
             onClick={onAutoArrange}
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
                 <span className="text-[10px] font-black uppercase tracking-widest">
                   자동 최적화 ({packingMode === 'inner-first' ? '안쪽부터' : '바닥부터'})
                 </span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </>
             )}
           </button>
        </div>
      )}

    </div>
  );
};
