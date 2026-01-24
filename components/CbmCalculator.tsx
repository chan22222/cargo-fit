import React, { useState, useMemo } from 'react';

interface CargoItem {
  id: string;
  name: string;
  length: number; // cm
  width: number;  // cm
  height: number; // cm
  weight: number; // kg
  quantity: number;
}

interface CbmCalculatorProps {
  leftSideAdSlot?: React.ReactNode;
  rightSideAdSlot?: React.ReactNode;
  bottomAdSlot?: React.ReactNode;
}

const CbmCalculator: React.FC<CbmCalculatorProps> = ({
  leftSideAdSlot,
  rightSideAdSlot,
  bottomAdSlot,
}) => {
  const [items, setItems] = useState<CargoItem[]>([
    { id: '1', name: '박스 1', length: 0, width: 0, height: 0, weight: 0, quantity: 1 }
  ]);
  const [unit, setUnit] = useState<'cm' | 'inch'>('cm');

  const addItem = () => {
    const newId = String(Date.now());
    setItems([...items, {
      id: newId,
      name: `박스 ${items.length + 1}`,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      quantity: 1
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof CargoItem, value: number | string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const convertToCm = (value: number) => {
    return unit === 'inch' ? value * 2.54 : value;
  };

  const calculations = useMemo(() => {
    let totalCbm = 0;
    let totalWeight = 0;
    let totalQuantity = 0;

    const itemResults = items.map(item => {
      const lengthCm = convertToCm(item.length);
      const widthCm = convertToCm(item.width);
      const heightCm = convertToCm(item.height);

      // CBM = L x W x H (m) = L x W x H (cm) / 1,000,000
      const cbmPerUnit = (lengthCm * widthCm * heightCm) / 1000000;
      const totalItemCbm = cbmPerUnit * item.quantity;
      const totalItemWeight = item.weight * item.quantity;

      totalCbm += totalItemCbm;
      totalWeight += totalItemWeight;
      totalQuantity += item.quantity;

      return {
        ...item,
        cbmPerUnit,
        totalItemCbm,
        totalItemWeight
      };
    });

    // Weight Ton (1 W/T = 1000kg)
    const weightTon = totalWeight / 1000;

    // Revenue Ton - 해상: CBM vs W/T 중 큰 값
    // 일반적으로 1 CBM = 1 R/T, 1 M/T = 1 R/T
    const revenueTonSea = Math.max(totalCbm, weightTon);

    // 항공: Chargeable Weight (1 CBM = 167kg 기준)
    const volumeWeightAir = totalCbm * 167;
    const chargeableWeightAir = Math.max(totalWeight, volumeWeightAir);

    // FCL/LCL 판단 (대략적 기준)
    const containerAdvice = totalCbm < 1
      ? 'LCL (소량화물)'
      : totalCbm < 15
        ? 'LCL 권장'
        : totalCbm < 28
          ? '20ft FCL 검토'
          : totalCbm < 60
            ? '40ft FCL 검토'
            : '40ft HQ 또는 복수 컨테이너';

    return {
      itemResults,
      totalCbm,
      totalWeight,
      totalQuantity,
      weightTon,
      revenueTonSea,
      volumeWeightAir,
      chargeableWeightAir,
      containerAdvice
    };
  }, [items, unit]);

  const resetAll = () => {
    setItems([{ id: '1', name: '박스 1', length: 0, width: 0, height: 0, weight: 0, quantity: 1 }]);
  };

  return (
    <div className="flex-1 overflow-visible bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">CBM / R.T 계산기</h1>
                <p className="text-slate-400 text-xs">해상/항공 운임 산정을 위한 용적 계산</p>
              </div>
            </div>

            {/* Unit Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">단위:</span>
              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    unit === 'cm' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  CM
                </button>
                <button
                  onClick={() => setUnit('inch')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    unit === 'inch' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  INCH
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Side Rail Ad - Desktop Only */}
          {leftSideAdSlot && (
            <div className="hidden md:block w-40 shrink-0">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ minHeight: '600px', maxHeight: '800px' }}>
                {leftSideAdSlot}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left: Input Section */}
            <div className="space-y-4">
            {/* Items List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700">화물 정보 입력</h2>
                <div className="flex gap-2">
                  <button
                    onClick={resetAll}
                    className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    초기화
                  </button>
                  <button
                    onClick={addItem}
                    className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    + 추가
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        className="text-sm font-bold text-slate-700 bg-transparent border-none focus:outline-none"
                      />
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">가로 ({unit})</label>
                        <input
                          type="number"
                          value={item.length || ''}
                          onChange={(e) => updateItem(item.id, 'length', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">세로 ({unit})</label>
                        <input
                          type="number"
                          value={item.width || ''}
                          onChange={(e) => updateItem(item.id, 'width', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">높이 ({unit})</label>
                        <input
                          type="number"
                          value={item.height || ''}
                          onChange={(e) => updateItem(item.id, 'height', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">중량 (kg)</label>
                        <input
                          type="number"
                          value={item.weight || ''}
                          onChange={(e) => updateItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">수량</label>
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          placeholder="1"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Item Result */}
                    {calculations.itemResults[index]?.cbmPerUnit > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
                        <div>
                          <span className="text-slate-500">단위 CBM:</span>
                          <span className="ml-1 font-bold text-slate-700">
                            {calculations.itemResults[index].cbmPerUnit.toFixed(4)} m³
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">합계 CBM:</span>
                          <span className="ml-1 font-bold text-emerald-600">
                            {calculations.itemResults[index].totalItemCbm.toFixed(4)} m³
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">합계 중량:</span>
                          <span className="ml-1 font-bold text-slate-700">
                            {calculations.itemResults[index].totalItemWeight.toFixed(1)} kg
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Formula Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3">계산 공식</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="font-bold text-slate-700 mb-1">CBM (Cubic Meter)</div>
                  <div className="text-slate-500">가로(m) × 세로(m) × 높이(m)</div>
                  <div className="text-slate-400 mt-1">= 가로(cm) × 세로(cm) × 높이(cm) ÷ 1,000,000</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="font-bold text-slate-700 mb-1">Revenue Ton (해상)</div>
                  <div className="text-slate-500">CBM과 Weight Ton 중 큰 값</div>
                  <div className="text-slate-400 mt-1">1 CBM = 1 R/T, 1 M/T = 1 R/T</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="font-bold text-slate-700 mb-1">Chargeable Weight (항공)</div>
                  <div className="text-slate-500">실중량과 용적중량 중 큰 값</div>
                  <div className="text-slate-400 mt-1">용적중량 = CBM × 167 kg</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="font-bold text-slate-700 mb-1">컨테이너 기준</div>
                  <div className="text-slate-500">20ft: ~28 CBM / 40ft: ~58 CBM</div>
                  <div className="text-slate-400 mt-1">40ft HQ: ~68 CBM</div>
                </div>
              </div>
            </div>

            {/* Bottom Multiplex Ad */}
            {bottomAdSlot && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {bottomAdSlot}
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {/* Total Results */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-4">계산 결과</h3>

              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="text-xs text-emerald-600 font-bold mb-2">총 합계</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-slate-500">총 수량</div>
                      <div className="text-lg font-black text-slate-800">{calculations.totalQuantity} 박스</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">총 중량</div>
                      <div className="text-lg font-black text-slate-800">{calculations.totalWeight.toFixed(1)} kg</div>
                    </div>
                  </div>
                </div>

                {/* CBM */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-slate-500">총 CBM</div>
                    <div className="text-xs text-slate-400">Cubic Meter</div>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    {calculations.totalCbm.toFixed(4)} m³
                  </div>
                </div>

                {/* Sea Freight */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-blue-600 font-bold mb-3">해상운송</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Weight Ton</span>
                      <span className="text-sm font-bold text-slate-700">{calculations.weightTon.toFixed(3)} M/T</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Revenue Ton</span>
                      <span className="text-sm font-bold text-blue-600">{calculations.revenueTonSea.toFixed(3)} R/T</span>
                    </div>
                  </div>
                </div>

                {/* Air Freight */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-xs text-purple-600 font-bold mb-3">항공운송</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">실중량</span>
                      <span className="text-sm font-bold text-slate-700">{calculations.totalWeight.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">용적중량</span>
                      <span className="text-sm font-bold text-slate-700">{calculations.volumeWeightAir.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-500">Chargeable Weight</span>
                      <span className="text-sm font-bold text-purple-600">{calculations.chargeableWeightAir.toFixed(1)} kg</span>
                    </div>
                  </div>
                </div>

                {/* Container Advice */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="text-xs text-amber-700 font-bold mb-2">컨테이너 추천</div>
                  <div className="text-sm font-bold text-amber-800">{calculations.containerAdvice}</div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3">알아두세요</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>LCL은 1 CBM 또는 1 R/T 단위로 과금됩니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>항공화물은 6000 cm³ = 1kg 기준도 사용됩니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>실제 운임은 선사/항공사마다 다를 수 있습니다.</span>
                </li>
              </ul>
            </div>
          </div>
          </div>

          {/* Right Side Rail Ad - Desktop Only */}
          {rightSideAdSlot && (
            <div className="hidden md:block w-40 shrink-0">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ minHeight: '600px', maxHeight: '800px' }}>
                {rightSideAdSlot}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CbmCalculator;
