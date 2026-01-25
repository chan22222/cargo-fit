export enum ContainerType {
  FT10 = '10ft',
  FT20 = '20ft',
  HQ20 = '20HQ',
  FT40 = '40ft',
  HQ40 = '40HQ',
  HQ45 = '45HQ',
  OT20 = '20OT', // Open Top
  OT40 = '40OT'  // Open Top
}

export interface Dimensions {
  width: number;  // x axis (cm)
  height: number; // y axis (cm)
  length: number; // z axis (cm)
}

export interface ContainerSpec extends Dimensions {
  type: ContainerType;
  maxWeight: number; // kg
  color: string;
}

export interface CargoItem {
  id: string;
  name: string;
  dimensions: Dimensions;
  color: string;
  quantity: number;
  weight?: number; // kg per item
  packingMode?: 'bottom-first' | 'inner-first'; // 정렬 방식
}

export interface PackedItem extends CargoItem {
  position: { x: number; y: number; z: number }; // cm relative to container origin
  uniqueId: string; // Individual instance ID
  containerIndex?: number; // 컨테이너 번호 (0부터 시작, 다중 컨테이너용)
}

export interface PackingResult {
  packedItems: PackedItem[];
  volumeEfficiency: number; // Percentage
  totalItems: number;
  remainingSpace: number; // Approximate cubic cm
}

// 팔레트 관련 타입
export enum PalletType {
  EUR = 'EUR',     // 120×100
  KR = 'KR',       // 110×110
  US = 'US',       // 122×102 (48"×40")
  HALF = 'HALF',   // 120×80
  AU = 'AU',       // 114×114
  CUSTOM = 'CUSTOM'
}

export interface PalletSpec {
  type: PalletType;
  width: number;   // cm
  length: number;  // cm
  height: number;  // 팔레트 자체 높이 (cm)
  maxLoadHeight: number; // 최대 적재 높이 (cm)
  color: string;
}

export interface PackedPalletItem extends CargoItem {
  position: { x: number; y: number; z: number }; // cm, y는 팔레트 상단 기준
  uniqueId: string;
  palletIndex?: number; // 다중 팔레트용
  isOverHeight?: boolean; // 높이 초과 여부
}