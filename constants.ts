import { ContainerType, ContainerSpec } from './types';

// Internal Dimensions in Millimeters
export const CONTAINER_SPECS: Record<ContainerType, ContainerSpec> = {
  [ContainerType.FT10]: {
    type: ContainerType.FT10,
    length: 2831,
    width: 2352,
    height: 2393,
    maxWeight: 10000,
    color: '#60a5fa'
  },
  [ContainerType.FT20]: {
    type: ContainerType.FT20,
    length: 5898,
    width: 2352,
    height: 2393,
    maxWeight: 25000,
    color: '#3b82f6'
  },
  [ContainerType.HQ20]: {
    type: ContainerType.HQ20,
    length: 5898,
    width: 2352,
    height: 2698,
    maxWeight: 28000,
    color: '#2563eb'
  },
  [ContainerType.FT40]: {
    type: ContainerType.FT40,
    length: 12025,
    width: 2352,
    height: 2393,
    maxWeight: 27600,
    color: '#2563eb'
  },
  [ContainerType.HQ40]: {
    type: ContainerType.HQ40,
    length: 12025,
    width: 2352,
    height: 2698,
    maxWeight: 28550,
    color: '#1d4ed8'
  },
  [ContainerType.HQ45]: {
    type: ContainerType.HQ45,
    length: 13556,
    width: 2352,
    height: 2698,
    maxWeight: 30480,
    color: '#1e40af'
  },
  // Open Tops: Height increased to simulate open capability (approx double standard)
  [ContainerType.OT20]: {
    type: ContainerType.OT20,
    length: 5898,
    width: 2352,
    height: 4500, // Artificially high to simulate open top
    maxWeight: 25000,
    color: '#0891b2' // Cyan-700
  },
  [ContainerType.OT40]: {
    type: ContainerType.OT40,
    length: 12025,
    width: 2352,
    height: 4500, // Artificially high to simulate open top
    maxWeight: 27600,
    color: '#0e7490' // Cyan-800
  }
};

export const DEFAULT_CARGO_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
];