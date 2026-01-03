// FS/SC (Fuel Surcharge / Security Charge) 타입 정의

export type FSSCType = 'FS' | 'SC';
export type CurrencyType = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY';
export type RegionType = 'ASIA' | 'EUROPE' | 'AMERICA' | 'OCEANIA' | 'AFRICA' | 'MIDDLE_EAST' | 'ALL';
export type SourceType = 'AIRLINE' | 'FORWARDER' | 'IATA' | 'MANUAL';

// 지역 코드
export const REGION_NAMES: Record<RegionType, string> = {
  'ASIA': '아시아',
  'EUROPE': '유럽',
  'AMERICA': '미주',
  'OCEANIA': '오세아니아',
  'AFRICA': '아프리카',
  'MIDDLE_EAST': '중동',
  'ALL': '전체',
};

// 데이터 출처
export const SOURCE_NAMES: Record<SourceType, string> = {
  'AIRLINE': '항공사 공지',
  'FORWARDER': '포워더 제공',
  'IATA': 'IATA/TACT',
  'MANUAL': '직접 입력',
};
// 자주 사용되는 코드들 (자유 입력도 가능)
export type ChargeCode = string;

export const CHARGE_CODES: Record<string, string> = {
  'FSC': 'Fuel Surcharge (유류할증료)',
  'SCC': 'Security Charge (보안료)',
  'MYC': 'My Carrier (항공사 자체)',
  'MTC': 'Miscellaneous Terminal Charge (기타)',
  'SSC': 'Special Surcharge (특별할증료)',
  'AWC': 'All-in Weight Charge (통합중량요금)',
  'EFS': 'Emergency Fuel Surcharge (긴급유류할증)',
  'THC': 'Terminal Handling Charge (터미널처리비)',
};

export interface FSSCRecord {
  id: string;
  type: FSSCType;           // FS: Fuel Surcharge, SC: Security Charge
  carrier_code: string;      // 항공사 코드 (2자리)
  carrier_name?: string;     // 항공사 이름 (선택)
  start_date: string;        // 적용시작일 (YYYY-MM-DD)
  end_date: string;          // 적용종료일 (YYYY-MM-DD)
  currency: CurrencyType;    // 화폐 (KRW, USD 등)
  min_charge?: number;       // 최소 금액
  over_charge?: number;      // 초과 시 금액 (kg당)
  route: string;             // 적용대상 (노선 정보)
  remark?: string;           // 비고
  charge_code: ChargeCode;   // 코드 (FSC, MYC 등)
  region?: RegionType;       // 지역 분류
  source?: SourceType;       // 데이터 출처
  verified?: boolean;        // 검증 여부
  created_at?: string;
  updated_at?: string;
}

export interface FSSCFormData {
  type: FSSCType;
  carrier_code: string;
  carrier_name?: string;
  start_date: string;
  end_date: string;
  currency: CurrencyType;
  min_charge?: number | null;
  over_charge?: number | null;
  route: string;
  remark?: string;
  charge_code: ChargeCode;
  region?: RegionType;
  source?: SourceType;
  verified?: boolean;
}

// 항공사 코드 목록 (참고용)
export const AIRLINE_CODES: Record<string, string> = {
  '5X': 'UPS Airlines',
  '5Y': 'Atlas Air',
  '7A': 'Express Air Cargo',
  '7L': 'Silk Way Airlines',
  '9U': 'Air Moldova',
  'A2': 'Animawings',
  'AC': 'Air Canada',
  'AF': 'Air France',
  'AH': 'Air Algerie',
  'AM': 'Aeromexico',
  'AY': 'Finnair',
  'BA': 'British Airways',
  'BI': 'Royal Brunei Airlines',
  'BR': 'EVA Air',
  'C8': 'Cargolux Italia',
  'CA': 'Air China',
  'CI': 'China Airlines',
  'CU': 'Cubana',
  'CV': 'Cargolux',
  'CX': 'Cathay Pacific',
  'D0': 'DHL Air',
  'DL': 'Delta Air Lines',
  'EK': 'Emirates',
  'ET': 'Ethiopian Airlines',
  'EY': 'Etihad Airways',
  'FX': 'FedEx',
  'GA': 'Garuda Indonesia',
  'IJ': 'Spring Airlines Japan',
  'JI': 'Meraj Airlines',
  'JL': 'Japan Airlines',
  'JP': 'Adria Airways',
  'JW': 'Vanilla Air',
  'KC': 'Air Astana',
  'KE': 'Korean Air',
  'KJ': 'Air Incheon',
  'KL': 'KLM',
  'KY': 'Kunming Airlines',
  'LH': 'Lufthansa',
  'LN': 'Libyan Airlines',
  'LO': 'LOT Polish Airlines',
  'LY': 'El Al Israel Airlines',
  'MB': 'MNG Airlines',
  'MH': 'Malaysia Airlines',
  'MY': 'MASwings',
  'NH': 'All Nippon Airways',
  'NW': 'Northwest Airlines',
  'OM': 'MIAT Mongolian',
  'OZ': 'Asiana Airlines',
  'PO': 'Polar Air Cargo',
  'PR': 'Philippine Airlines',
  'PX': 'Air Niugini',
  'QP': 'Skytrans',
  'QR': 'Qatar Airways',
  'RF': 'Florida West Intl',
  'RJ': 'Royal Jordanian',
  'SE': 'XL Airways France',
  'SN': 'Brussels Airlines',
  'SQ': 'Singapore Airlines',
  'TA': 'TACA Airlines',
  'TG': 'Thai Airways',
  'TK': 'Turkish Airlines',
  'TP': 'TAP Air Portugal',
  'UA': 'United Airlines',
  'UC': 'LAN Cargo Chile',
  'US': 'US Airways',
  'UU': 'Air Austral',
  'VN': 'Vietnam Airlines',
  'VV': 'Aerosvit Airlines',
  'WS': 'WestJet',
  'WY': 'Oman Air',
  'YP': 'Air Premia',
  'ZA': 'Sky Angkor Airlines',
};

// 기본 필터
export interface FSSCFilter {
  type?: FSSCType | 'A';  // A: 전체
  carrier_code?: string;
  date?: string;  // 기준일
}
