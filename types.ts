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
}

export interface PackingResult {
  packedItems: PackedItem[];
  volumeEfficiency: number; // Percentage
  totalItems: number;
  remainingSpace: number; // Approximate cubic cm
}