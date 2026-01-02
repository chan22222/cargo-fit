// 운송사 데이터 타입
export interface Carrier {
  name: string;
  code: string;
  trackingUrl: string;
  category: 'container' | 'air' | 'courier' | 'post' | 'rail';
  region?: string;
  isMajor?: boolean; // 주요 운송사 여부
}

export type CategoryType = 'container' | 'air' | 'courier' | 'post' | 'rail';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  count: number;
}
