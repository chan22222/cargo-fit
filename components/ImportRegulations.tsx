import React, { useState, useMemo } from 'react';

interface ImportRegulationsProps {
  leftSideAdSlot?: React.ReactNode;
  rightSideAdSlot?: React.ReactNode;
}

interface RegulationInfo {
  country: string;
  code: string;
  flag: string;
  overview: string;
  importAuthority: string;
  documents: string[];
  prohibitedItems: string[];
  restrictedItems: string[];
  dutyInfo: {
    averageRate: string;
    vatRate: string;
    freeTradeAgreements: string[];
  };
  specialRequirements: {
    category: string;
    requirements: string[];
  }[];
  usefulLinks: {
    name: string;
    url: string;
  }[];
}

const regulationsData: RegulationInfo[] = [
  {
    country: '미국',
    code: 'US',
    flag: '🇺🇸',
    overview: '미국 관세국경보호청(CBP)이 수입을 관리합니다. $800 이하 개인 사용 물품은 면세입니다.',
    importAuthority: 'U.S. Customs and Border Protection (CBP)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서 (필요시)',
      'FDA 사전통관 (식품/의약품)',
      'FCC 인증 (전자제품)'
    ],
    prohibitedItems: [
      '마약류 및 약물',
      '위조품/상표권 침해물품',
      '특정 농산물 (과일, 채소, 육류)',
      '멸종위기 야생동식물',
      '쿠바산 제품 (일부 예외)'
    ],
    restrictedItems: [
      '주류 (면허 필요)',
      '담배 (수량 제한)',
      '의약품 (FDA 승인 필요)',
      '화장품 (FDA 등록)',
      '전자제품 (FCC 인증)',
      '식품 (FDA 사전통관)'
    ],
    dutyInfo: {
      averageRate: '평균 3-5%',
      vatRate: '없음 (주별 Sales Tax 별도)',
      freeTradeAgreements: ['한-미 FTA', 'USMCA', 'CAFTA-DR']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['FDA 시설등록', 'FDA 사전통관 (Prior Notice)', '영양성분표시 (Nutrition Facts)']
      },
      {
        category: '전자제품',
        requirements: ['FCC 인증', 'UL 안전인증 (권장)', '에너지효율등급 (Energy Star)']
      },
      {
        category: '화장품',
        requirements: ['FDA 등록 (권장)', '성분표시 라벨링', '동물실험 규제 없음']
      },
      {
        category: '섬유/의류',
        requirements: ['섬유성분 라벨링', '원산지 표시', '세탁방법 표시']
      }
    ],
    usefulLinks: [
      { name: 'CBP 공식 사이트', url: 'https://www.cbp.gov' },
      { name: 'FDA Import Program', url: 'https://www.fda.gov/imports' },
      { name: '한-미 FTA 포털', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '중국',
    code: 'CN',
    flag: '🇨🇳',
    overview: '중국 해관총서(GACC)가 수입을 관리합니다. CCC 인증이 많은 제품에 필수입니다.',
    importAuthority: 'General Administration of Customs of China (GACC)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '수입허가증 (특정 품목)',
      'CCC 인증서 (해당 품목)',
      '위생증명서 (식품)'
    ],
    prohibitedItems: [
      '무기 및 폭발물',
      '마약류',
      '중국 정치에 해가 되는 인쇄물',
      '멸종위기 동식물',
      '위조화폐'
    ],
    restrictedItems: [
      '통신장비 (허가 필요)',
      '의약품 (NMPA 등록)',
      '화장품 (NMPA 등록)',
      '식품 (GACC 등록)',
      '중고 기계류'
    ],
    dutyInfo: {
      averageRate: '평균 7-15%',
      vatRate: '13% (일반), 9% (필수품)',
      freeTradeAgreements: ['한-중 FTA', 'RCEP', 'ASEAN-China FTA']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['해외 제조시설 GACC 등록', '중문 라벨링', '위생증명서', '수입허가증']
      },
      {
        category: '전자제품',
        requirements: ['CCC 강제인증', 'SRRC 무선인증 (무선기기)', 'NAL 네트워크 접속허가']
      },
      {
        category: '화장품',
        requirements: ['NMPA 등록/비안', '동물실험 (일부 면제)', '중문 라벨']
      },
      {
        category: '의료기기',
        requirements: ['NMPA 등록', '임상시험 (Class II, III)', '중국 대리인 필요']
      }
    ],
    usefulLinks: [
      { name: '중국 해관총서', url: 'http://www.customs.gov.cn' },
      { name: 'CCC 인증 안내', url: 'http://www.cqc.com.cn' },
      { name: '한-중 FTA 포털', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '일본',
    code: 'JP',
    flag: '🇯🇵',
    overview: '일본 세관(Customs)이 수입을 관리합니다. 식품위생법, PSE 등 다양한 인증이 요구됩니다.',
    importAuthority: 'Japan Customs',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서 (FTA 적용시)',
      '식품등수입신고서 (식품)',
      'PSE 적합성 증명 (전기용품)'
    ],
    prohibitedItems: [
      '마약류',
      '총기류',
      '위조품',
      '음란물',
      '특정 동식물 (검역 미통과)'
    ],
    restrictedItems: [
      '의약품 (후생노동성 허가)',
      '화장품 (제조판매업 허가)',
      '식품 (식품위생법)',
      '주류 (면허 필요)',
      '무선기기 (기술기준적합증명)'
    ],
    dutyInfo: {
      averageRate: '평균 0-10%',
      vatRate: '10% (소비세)',
      freeTradeAgreements: ['한-일 없음 (RCEP 활용)', 'RCEP', 'CPTPP']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['식품등수입신고', '식품위생법 기준 적합', '일본어 라벨링', '원재료명 표시']
      },
      {
        category: '전자제품',
        requirements: ['PSE 마크 (전기용품)', '기술기준적합증명 (무선)', 'S-Mark (권장)']
      },
      {
        category: '화장품',
        requirements: ['제조판매업 허가', '화장품기준 적합', '일본어 전성분 표시']
      },
      {
        category: '의류/섬유',
        requirements: ['가정용품품질표시법', '섬유조성 표시', '취급주의사항 표시']
      }
    ],
    usefulLinks: [
      { name: '일본 세관', url: 'https://www.customs.go.jp' },
      { name: '후생노동성 수입식품', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/' },
      { name: 'JETRO 수입규제', url: 'https://www.jetro.go.jp/world/qa/' }
    ]
  },
  {
    country: '유럽연합 (EU)',
    code: 'EU',
    flag: '🇪🇺',
    overview: 'EU 회원국 공통 관세 및 규정 적용. CE 마킹이 많은 제품에 필수입니다.',
    importAuthority: 'European Commission / 각 회원국 세관',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      'EUR.1 원산지증명서 (FTA)',
      'CE 적합성선언서',
      '통관서류 (SAD - Single Administrative Document)'
    ],
    prohibitedItems: [
      '마약류',
      '위조품',
      '특정 화학물질 (REACH 미등록)',
      '특정 살충제',
      '일부 동물성 제품'
    ],
    restrictedItems: [
      '의약품 (EMA 승인)',
      '화장품 (EU 규정 적합)',
      '식품 (EU 식품법)',
      '전자폐기물 (WEEE)',
      '배터리 (EU 배터리규정)'
    ],
    dutyInfo: {
      averageRate: '평균 4-14%',
      vatRate: '15-27% (국가별 상이)',
      freeTradeAgreements: ['한-EU FTA', 'EU-UK TCA', 'EU-Japan EPA']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['EU 식품법 적합', 'EU 언어 라벨링', '영양정보 표시', 'HACCP']
      },
      {
        category: '전자제품',
        requirements: ['CE 마킹', 'RoHS 적합', 'WEEE 등록', 'EMC 지침']
      },
      {
        category: '화장품',
        requirements: ['CPNP 등록', 'EU 책임자 지정', '동물실험 금지', 'EU 언어 라벨']
      },
      {
        category: '화학물질/완구',
        requirements: ['REACH 등록', 'CLP 분류/라벨링', 'EN71 (완구안전)', 'CE 마킹']
      }
    ],
    usefulLinks: [
      { name: 'EU Trade Helpdesk', url: 'https://trade.ec.europa.eu/access-to-markets/' },
      { name: 'CE 마킹 안내', url: 'https://europa.eu/youreurope/business/product-requirements/labels-markings/ce-marking/' },
      { name: '한-EU FTA 포털', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '베트남',
    code: 'VN',
    flag: '🇻🇳',
    overview: '베트남 관세총국이 수입을 관리합니다. 한-베트남 FTA로 많은 품목 관세 철폐.',
    importAuthority: 'General Department of Vietnam Customs',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서 (C/O)',
      '수입허가서 (해당 품목)',
      '품질적합증명 (해당 품목)'
    ],
    prohibitedItems: [
      '무기, 폭발물',
      '마약류',
      '유독 화학물질',
      '반정부 인쇄물',
      '특정 중고품'
    ],
    restrictedItems: [
      '의약품 (보건부 허가)',
      '화장품 (CFS 필요)',
      '식품 (위생증명)',
      '중고기계 (연식 제한)',
      '주류/담배 (면허)'
    ],
    dutyInfo: {
      averageRate: '평균 5-15%',
      vatRate: '10% (일반), 5% (필수품)',
      freeTradeAgreements: ['한-베트남 FTA', 'RCEP', 'CPTPP', 'ASEAN']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['위생증명서', '자유판매증명 (CFS)', '베트남어 라벨링', '유통기한 표시']
      },
      {
        category: '전자제품',
        requirements: ['적합성 인증', 'CR 마크', '베트남어 사용설명서']
      },
      {
        category: '화장품',
        requirements: ['화장품공고 등록', 'CFS 증명', '베트남어 라벨', '성분 신고']
      },
      {
        category: '기계류',
        requirements: ['품질적합증명', '제조일 10년 이내 (중고)', '에너지효율등급']
      }
    ],
    usefulLinks: [
      { name: '베트남 관세청', url: 'https://www.customs.gov.vn' },
      { name: '한-베트남 FTA', url: 'https://www.customs.go.kr/ftaportalkor/main.do' },
      { name: 'KOTRA 베트남', url: 'https://www.kotra.or.kr' }
    ]
  },
  {
    country: '태국',
    code: 'TH',
    flag: '🇹🇭',
    overview: '태국 관세청이 수입을 관리합니다. TISI 인증이 많은 공산품에 요구됩니다.',
    importAuthority: 'Thai Customs Department',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서',
      '수입허가서 (해당 품목)',
      'TISI 인증서 (해당 품목)'
    ],
    prohibitedItems: [
      '마약류',
      '음란물',
      '위조품',
      '특정 전자담배',
      '도박기구'
    ],
    restrictedItems: [
      '의약품 (FDA 허가)',
      '화장품 (FDA 등록)',
      '식품 (FDA 등록)',
      '주류 (면허)',
      '중고차 (수입금지에 가까움)'
    ],
    dutyInfo: {
      averageRate: '평균 5-30%',
      vatRate: '7%',
      freeTradeAgreements: ['한-ASEAN FTA', 'RCEP', 'ASEAN', 'Thai-Australia FTA']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['FDA 제품등록', '태국어 라벨링', '영양정보 표시', '유통기한 표시']
      },
      {
        category: '전자제품',
        requirements: ['TISI 강제인증', 'NBTC 인증 (통신)', '에너지라벨링']
      },
      {
        category: '화장품',
        requirements: ['FDA 제품등록', '태국어 라벨', '성분표시', '제조일/유통기한']
      },
      {
        category: '의료기기',
        requirements: ['FDA 등록', '태국 대리인 필요', 'Thai 라벨링']
      }
    ],
    usefulLinks: [
      { name: '태국 관세청', url: 'https://www.customs.go.th' },
      { name: '태국 FDA', url: 'https://www.fda.moph.go.th' },
      { name: 'TISI', url: 'https://www.tisi.go.th' }
    ]
  },
  {
    country: '인도네시아',
    code: 'ID',
    flag: '🇮🇩',
    overview: '인도네시아 관세청이 수입을 관리합니다. SNI 인증이 많은 제품에 필수입니다.',
    importAuthority: 'Directorate General of Customs and Excise',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서',
      'API (수입업 허가)',
      'SNI 인증서 (해당 품목)'
    ],
    prohibitedItems: [
      '마약류',
      '무기류',
      '음란물',
      '도박기구',
      '특정 중고의류'
    ],
    restrictedItems: [
      '의약품 (BPOM 등록)',
      '화장품 (BPOM 등록)',
      '식품 (BPOM 등록)',
      '주류 (엄격 제한)',
      '중고 자본재'
    ],
    dutyInfo: {
      averageRate: '평균 5-40%',
      vatRate: '11%',
      freeTradeAgreements: ['한-ASEAN FTA', 'RCEP', 'IK-CEPA (한-인니)', 'ASEAN']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['BPOM 등록', '할랄 인증 (MUI)', '인도네시아어 라벨링', 'ML 번호']
      },
      {
        category: '전자제품',
        requirements: ['SNI 강제인증', 'SDPPI 인증 (통신)', 'TKDN (국산부품비율)']
      },
      {
        category: '화장품',
        requirements: ['BPOM 등록', '인도네시아어 라벨', '할랄 인증 (권장)']
      },
      {
        category: '섬유/의류',
        requirements: ['SNI (일부 품목)', '수입업허가 (API)', '라벨링 요건']
      }
    ],
    usefulLinks: [
      { name: '인도네시아 관세청', url: 'https://www.beacukai.go.id' },
      { name: 'BPOM', url: 'https://www.pom.go.id' },
      { name: 'SNI 인증', url: 'https://www.bsn.go.id' }
    ]
  },
  {
    country: '호주',
    code: 'AU',
    flag: '🇦🇺',
    overview: '호주 국경수비대(ABF)가 수입을 관리합니다. 엄격한 검역 규정이 적용됩니다.',
    importAuthority: 'Australian Border Force (ABF)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서 (FTA)',
      '수입신고서',
      '검역허가 (해당 품목)'
    ],
    prohibitedItems: [
      '마약류',
      '무기류',
      '특정 식물/동물 제품',
      '석면 함유 제품',
      '특정 목재 제품'
    ],
    restrictedItems: [
      '의약품 (TGA 등록)',
      '식품 (FSANZ 기준)',
      '화장품 (AICIS 등록)',
      '전자제품 (RCM)',
      '목재/식물 (엄격한 검역)'
    ],
    dutyInfo: {
      averageRate: '평균 0-5%',
      vatRate: '10% (GST)',
      freeTradeAgreements: ['한-호주 FTA', 'RCEP', 'CPTPP', 'AANZFTA']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['FSANZ 기준 적합', '영양정보 라벨', '원산지 표시', '엄격한 검역']
      },
      {
        category: '전자제품',
        requirements: ['RCM (규제적합마크)', 'AS/NZS 표준', '에너지효율등급']
      },
      {
        category: '화장품',
        requirements: ['AICIS 등록 (구 NICNAS)', '영어 라벨링', '성분 목록']
      },
      {
        category: '의약품/건강식품',
        requirements: ['TGA 등록', 'ARTG 등재', '호주 스폰서 필요']
      }
    ],
    usefulLinks: [
      { name: '호주 국경수비대', url: 'https://www.abf.gov.au' },
      { name: 'DAWE 검역', url: 'https://www.agriculture.gov.au' },
      { name: '한-호주 FTA', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '인도',
    code: 'IN',
    flag: '🇮🇳',
    overview: '인도 관세청(CBIC)이 수입을 관리합니다. GST와 함께 복잡한 관세 체계가 적용됩니다.',
    importAuthority: 'Central Board of Indirect Taxes and Customs (CBIC)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서',
      '수입허가증 (IEC)',
      'BIS 인증서 (해당 품목)'
    ],
    prohibitedItems: [
      '마약류',
      '야생동물 및 상아',
      '가짜 화폐',
      '음란물',
      '특정 화학물질'
    ],
    restrictedItems: [
      '의약품 (CDSCO 등록)',
      '식품 (FSSAI 등록)',
      '전자제품 (BIS 인증)',
      '화장품 (CDSCO 등록)',
      '무선기기 (WPC 승인)'
    ],
    dutyInfo: {
      averageRate: '평균 10-30%',
      vatRate: 'GST 5-28% (품목별 상이)',
      freeTradeAgreements: ['한-인도 CEPA', 'RCEP 미가입', 'SAFTA']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['FSSAI 등록/라이센스', '영문+힌디어 라벨링', 'NOC 필요 (일부 품목)', '채식/비채식 표시']
      },
      {
        category: '전자제품',
        requirements: ['BIS 강제인증 (ISI 마크)', 'WPC 무선승인', 'ETA 형식승인', 'MEITY 등록']
      },
      {
        category: '화장품',
        requirements: ['CDSCO 등록', '인도 에이전트 필요', '영문 라벨링', '제조일 6개월 이내']
      },
      {
        category: '의료기기',
        requirements: ['CDSCO 등록', '인도 대리인 필요', '임상시험 (Class C, D)']
      }
    ],
    usefulLinks: [
      { name: '인도 관세청 CBIC', url: 'https://www.cbic.gov.in' },
      { name: 'FSSAI', url: 'https://www.fssai.gov.in' },
      { name: '한-인도 CEPA', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '캐나다',
    code: 'CA',
    flag: '🇨🇦',
    overview: '캐나다 국경서비스청(CBSA)이 수입을 관리합니다. 한-캐나다 FTA로 많은 품목 관세 철폐.',
    importAuthority: 'Canada Border Services Agency (CBSA)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서 (한-캐 FTA)',
      'CFIA 수입허가 (식품)',
      'CFIA 라이센스 (해당 품목)'
    ],
    prohibitedItems: [
      '마약류',
      '무기류',
      '아동 음란물',
      '증오 선전물',
      '특정 동식물 제품'
    ],
    restrictedItems: [
      '식품 (CFIA 규정)',
      '의약품 (Health Canada)',
      '화장품 (Health Canada)',
      '주류/담배 (주별 규정)',
      '무선기기 (ISED 인증)'
    ],
    dutyInfo: {
      averageRate: '평균 0-8%',
      vatRate: 'GST 5% + PST 0-10% (주별 상이)',
      freeTradeAgreements: ['한-캐나다 FTA', 'CUSMA (구 NAFTA)', 'CPTPP']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['CFIA 식품안전규정', '영어/불어 라벨링', '영양성분 표시', 'SFC 등록']
      },
      {
        category: '전자제품',
        requirements: ['ISED 인증 (구 IC)', 'CSA 안전인증', '에너지효율 (NRCan)']
      },
      {
        category: '화장품',
        requirements: ['CNF 신고', '영어/불어 라벨', '성분표시 (INCI)']
      },
      {
        category: '의료기기',
        requirements: ['MDEL 라이센스', 'Health Canada 등록', 'ISO 13485']
      }
    ],
    usefulLinks: [
      { name: '캐나다 CBSA', url: 'https://www.cbsa-asfc.gc.ca' },
      { name: 'Health Canada', url: 'https://www.canada.ca/en/health-canada.html' },
      { name: '한-캐나다 FTA', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '영국',
    code: 'GB',
    flag: '🇬🇧',
    overview: '영국 세관(HMRC)이 수입을 관리합니다. 브렉시트 이후 EU와 별도 규정 적용.',
    importAuthority: 'HM Revenue & Customs (HMRC)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서 (한-영 FTA)',
      'EORI 번호',
      'UKCA/CE 적합성선언서'
    ],
    prohibitedItems: [
      '마약류',
      '무기류',
      '위조품',
      '음란물',
      '특정 동식물 (CITES)'
    ],
    restrictedItems: [
      '식품 (FSA 규정)',
      '의약품 (MHRA 승인)',
      '화장품 (SCPN 등록)',
      '전자폐기물 (WEEE)',
      '화학물질 (UK REACH)'
    ],
    dutyInfo: {
      averageRate: '평균 0-12%',
      vatRate: '20% (표준), 5%/0% (경감)',
      freeTradeAgreements: ['한-영 FTA', 'UK-EU TCA', 'CPTPP']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['FSA 규정 적합', '영어 라벨링', '영양정보 표시', '알레르기 표시']
      },
      {
        category: '전자제품',
        requirements: ['UKCA 마크 (CE도 인정)', 'UK RoHS 적합', 'WEEE 등록']
      },
      {
        category: '화장품',
        requirements: ['SCPN 등록', 'UK 책임자 지정', '영어 라벨', '동물실험 금지']
      },
      {
        category: '화학물질',
        requirements: ['UK REACH 등록', 'GB CLP 분류/라벨링', '안전데이터시트']
      }
    ],
    usefulLinks: [
      { name: '영국 HMRC', url: 'https://www.gov.uk/government/organisations/hm-revenue-customs' },
      { name: 'UK 관세율 조회', url: 'https://www.trade-tariff.service.gov.uk' },
      { name: '한-영 FTA', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '싱가포르',
    code: 'SG',
    flag: '🇸🇬',
    overview: '싱가포르 관세청이 수입을 관리합니다. 99% 품목 무관세, GST 9% 적용.',
    importAuthority: 'Singapore Customs',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '수입허가 (Import Permit)',
      '제품등록증 (해당 품목)',
      'HSA 라이센스 (의약품/화장품)'
    ],
    prohibitedItems: [
      '마약류',
      '무기류',
      '껌 (치료용 제외)',
      '음란물',
      '담배 모조품'
    ],
    restrictedItems: [
      '식품 (SFA 승인)',
      '의약품 (HSA 라이센스)',
      '화장품 (HSA 등록)',
      '주류/담배 (고율 관세)',
      '무선기기 (IMDA 승인)'
    ],
    dutyInfo: {
      averageRate: '대부분 0% (주류/담배/차량 제외)',
      vatRate: '9% (GST, 2024년 기준)',
      freeTradeAgreements: ['한-싱가포르 FTA', 'RCEP', 'CPTPP', 'ASEAN']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['SFA 수입허가', '라벨링 규정 준수', '유통기한 표시', '성분표시']
      },
      {
        category: '전자제품',
        requirements: ['안전마크 (Safety Mark)', 'IMDA 무선승인', '에너지라벨링']
      },
      {
        category: '화장품',
        requirements: ['HSA ASEAN 신고', '영어 라벨링', '성분표시', '수입업 라이센스']
      },
      {
        category: '건강보조식품',
        requirements: ['HSA 라이센스', '광고 사전승인', '효능 주장 제한']
      }
    ],
    usefulLinks: [
      { name: '싱가포르 관세청', url: 'https://www.customs.gov.sg' },
      { name: 'HSA', url: 'https://www.hsa.gov.sg' },
      { name: '한-싱가포르 FTA', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '말레이시아',
    code: 'MY',
    flag: '🇲🇾',
    overview: '말레이시아 관세청(RMCD)이 수입을 관리합니다. 할랄 인증이 식품에 중요합니다.',
    importAuthority: 'Royal Malaysian Customs Department (RMCD)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서',
      '수입허가증 (AP)',
      'SIRIM 인증서 (해당 품목)'
    ],
    prohibitedItems: [
      '마약류',
      '무기류',
      '음란물',
      '위조품',
      '이스라엘산 제품'
    ],
    restrictedItems: [
      '식품 (MFDS/JAKIM)',
      '의약품 (NPRA 등록)',
      '화장품 (NPRA 신고)',
      '전자제품 (SIRIM 인증)',
      '주류 (면허 필요)'
    ],
    dutyInfo: {
      averageRate: '평균 0-30%',
      vatRate: 'SST 판매세 10%, 서비스세 8%',
      freeTradeAgreements: ['한-ASEAN FTA', 'RCEP', 'CPTPP', 'ASEAN']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['할랄 인증 (JAKIM)', '말레이어 라벨링', '영양정보 표시', 'MFDS 등록']
      },
      {
        category: '전자제품',
        requirements: ['SIRIM 강제인증', 'MCMC 무선승인', 'CoA 인증서']
      },
      {
        category: '화장품',
        requirements: ['NPRA 신고', '할랄 인증 (권장)', '말레이어 라벨', '성분표시']
      },
      {
        category: '의료기기',
        requirements: ['MDA 등록', '말레이시아 대리인 필요', 'GMP 인증']
      }
    ],
    usefulLinks: [
      { name: '말레이시아 관세청', url: 'https://www.customs.gov.my' },
      { name: 'SIRIM', url: 'https://www.sirim.my' },
      { name: '한-ASEAN FTA', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '필리핀',
    code: 'PH',
    flag: '🇵🇭',
    overview: '필리핀 관세청(BOC)이 수입을 관리합니다. FDA 등록이 많은 품목에 필요합니다.',
    importAuthority: 'Bureau of Customs (BOC)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서',
      'FDA CPR/LTO (해당 품목)',
      '수입허가 (Import Clearance)'
    ],
    prohibitedItems: [
      '마약류',
      '무기류',
      '음란물',
      '도박기구',
      '특정 농산물'
    ],
    restrictedItems: [
      '식품 (FDA 등록)',
      '의약품 (FDA 등록)',
      '화장품 (FDA 신고)',
      '전자제품 (BPS 인증)',
      '중고차 (수입금지)'
    ],
    dutyInfo: {
      averageRate: '평균 0-30%',
      vatRate: '12% (VAT)',
      freeTradeAgreements: ['한-ASEAN FTA', 'RCEP', 'ASEAN', 'PH-Japan EPA']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['FDA CPR 등록', '영어/필리핀어 라벨', '영양정보 표시', 'LTO 라이센스']
      },
      {
        category: '전자제품',
        requirements: ['BPS PS 마크', 'ICC 인증', 'NTC 무선승인']
      },
      {
        category: '화장품',
        requirements: ['FDA 신고', '영어 라벨링', '성분표시', '제조일/유통기한']
      },
      {
        category: '의료기기',
        requirements: ['FDA CMDN 등록', '필리핀 대리인 필요', 'LTO 라이센스']
      }
    ],
    usefulLinks: [
      { name: '필리핀 관세청', url: 'https://customs.gov.ph' },
      { name: '필리핀 FDA', url: 'https://www.fda.gov.ph' },
      { name: '한-ASEAN FTA', url: 'https://www.customs.go.kr/ftaportalkor/main.do' }
    ]
  },
  {
    country: '사우디아라비아',
    code: 'SA',
    flag: '🇸🇦',
    overview: '사우디 관세청(ZATCA)이 수입을 관리합니다. 할랄 인증과 SASO 적합성이 필수입니다.',
    importAuthority: 'Zakat, Tax and Customs Authority (ZATCA)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서',
      'SASO 적합성인증서 (CoC)',
      '할랄 인증서 (식품)'
    ],
    prohibitedItems: [
      '마약류',
      '주류',
      '돼지고기 제품',
      '음란물',
      '이스라엘산 제품'
    ],
    restrictedItems: [
      '식품 (SFDA 등록)',
      '의약품 (SFDA 등록)',
      '화장품 (SFDA 등록)',
      '전자제품 (SASO)',
      '화학물질 (허가 필요)'
    ],
    dutyInfo: {
      averageRate: '평균 5-12%',
      vatRate: '15% (VAT)',
      freeTradeAgreements: ['한-GCC FTA (협상중)', 'GCC 관세동맹', 'GAFTA']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['할랄 인증 필수', 'SFDA 등록', '아랍어 라벨링', 'SASO 적합성']
      },
      {
        category: '전자제품',
        requirements: ['SASO 적합성인증', 'IECEE CB 인증', '에너지효율등급 (SEEC)']
      },
      {
        category: '화장품',
        requirements: ['SFDA 등록', '아랍어 라벨', '성분표시', 'GCC 규격 적합']
      },
      {
        category: '의료기기',
        requirements: ['SFDA 등록', 'ISO 13485', 'CE/FDA 인증 (참조)']
      }
    ],
    usefulLinks: [
      { name: '사우디 ZATCA', url: 'https://zatca.gov.sa' },
      { name: 'SFDA', url: 'https://www.sfda.gov.sa' },
      { name: 'SABER 시스템', url: 'https://saber.sa' }
    ]
  },
  {
    country: '멕시코',
    code: 'MX',
    flag: '🇲🇽',
    overview: '멕시코 관세청(SAT)이 수입을 관리합니다. NOM 인증이 다양한 품목에 필수입니다.',
    importAuthority: 'Servicio de Administración Tributaria (SAT)',
    documents: [
      '상업송장 (Commercial Invoice)',
      '포장명세서 (Packing List)',
      '선하증권/항공화물운송장 (B/L or AWB)',
      '원산지증명서',
      'NOM 인증서 (해당 품목)',
      '수입업 등록 (Padrón)'
    ],
    prohibitedItems: [
      '마약류',
      '무기류',
      '특정 화학물질',
      '멸종위기 동식물',
      '특정 중고품'
    ],
    restrictedItems: [
      '식품 (COFEPRIS)',
      '의약품 (COFEPRIS 등록)',
      '화장품 (COFEPRIS)',
      '전자제품 (NOM 인증)',
      '주류/담배 (면허 필요)'
    ],
    dutyInfo: {
      averageRate: '평균 0-20%',
      vatRate: '16% (IVA)',
      freeTradeAgreements: ['한-멕시코 없음', 'USMCA', 'EU-Mexico FTA', 'CPTPP']
    },
    specialRequirements: [
      {
        category: '식품',
        requirements: ['COFEPRIS 등록', '스페인어 라벨링', '영양정보 표시', 'NOM-051 적합']
      },
      {
        category: '전자제품',
        requirements: ['NOM 강제인증', 'NYCE 인증', 'IFT 무선승인', '에너지효율']
      },
      {
        category: '화장품',
        requirements: ['COFEPRIS 신고', '스페인어 라벨', '성분표시', 'NOM-141 적합']
      },
      {
        category: '의료기기',
        requirements: ['COFEPRIS 등록', '멕시코 대리인 필요', 'NOM 적합']
      }
    ],
    usefulLinks: [
      { name: '멕시코 SAT', url: 'https://www.sat.gob.mx' },
      { name: 'COFEPRIS', url: 'https://www.gob.mx/cofepris' },
      { name: 'KOTRA 멕시코', url: 'https://www.kotra.or.kr' }
    ]
  }
];

const ImportRegulations: React.FC<ImportRegulationsProps> = ({
  leftSideAdSlot,
  rightSideAdSlot,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'documents' | 'prohibited' | 'special' | 'duty'>('overview');

  const selectedRegulation = useMemo(() => {
    return regulationsData.find(r => r.code === selectedCountry) || regulationsData[0];
  }, [selectedCountry]);

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return regulationsData;
    return regulationsData.filter(r =>
      r.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="flex-1 overflow-visible bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">국가별 수입규제 정보</h1>
                <p className="text-slate-400 text-xs">Import Regulations by Country</p>
              </div>
            </div>

            {/* Country Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="국가 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 pl-9 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Side Rails */}
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
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left: Country List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-700">국가 선택</h2>
            </div>
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredCountries.map((reg) => (
                <button
                  key={reg.code}
                  onClick={() => setSelectedCountry(reg.code)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all border-b border-slate-100 last:border-b-0 ${
                    selectedCountry === reg.code
                      ? 'bg-indigo-50 border-l-4 border-l-indigo-500'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{reg.flag}</span>
                  <div>
                    <div className={`text-sm font-bold ${selectedCountry === reg.code ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {reg.country}
                    </div>
                    <div className="text-xs text-slate-400">{reg.code}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Regulation Details */}
          <div className="space-y-4">
            {/* Country Header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <span className="text-5xl">{selectedRegulation.flag}</span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800">{selectedRegulation.country}</h2>
                  <p className="text-sm text-slate-500 mt-1">{selectedRegulation.importAuthority}</p>
                  <p className="text-sm text-slate-600 mt-3">{selectedRegulation.overview}</p>
                </div>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'overview', label: '개요' },
                { id: 'documents', label: '필요서류' },
                { id: 'prohibited', label: '금지/제한품목' },
                { id: 'special', label: '품목별 요건' },
                { id: 'duty', label: '관세/FTA' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${
                    activeSection === tab.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Section Content */}
            {activeSection === 'overview' && (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Documents Summary */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    주요 필요서류
                  </h3>
                  <ul className="space-y-2">
                    {selectedRegulation.documents.map((doc, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-indigo-400">•</span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prohibited Summary */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    수입금지 품목
                  </h3>
                  <ul className="space-y-2">
                    {selectedRegulation.prohibitedItems.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Duty Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    관세 정보
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">평균 관세율</span>
                      <span className="font-bold text-slate-700">{selectedRegulation.dutyInfo.averageRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">부가세/VAT</span>
                      <span className="font-bold text-slate-700">{selectedRegulation.dutyInfo.vatRate}</span>
                    </div>
                  </div>
                </div>

                {/* FTA Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    FTA 협정
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegulation.dutyInfo.freeTradeAgreements.map((fta, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        {fta}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'documents' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">필요서류 목록</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {selectedRegulation.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-sm text-slate-700">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'prohibited' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-red-600 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    수입금지 품목
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedRegulation.prohibitedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg text-sm text-red-700">
                        <span className="text-red-400">✕</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-amber-600 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    수입제한 품목 (허가/인증 필요)
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedRegulation.restrictedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-sm text-amber-700">
                        <span className="text-amber-400">!</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'special' && (
              <div className="space-y-4">
                {selectedRegulation.specialRequirements.map((req, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      {req.category}
                    </h3>
                    <ul className="space-y-2">
                      {req.requirements.map((r, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'duty' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">관세 및 세금 정보</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1">평균 관세율</div>
                      <div className="text-xl font-bold text-slate-800">{selectedRegulation.dutyInfo.averageRate}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1">부가가치세 (VAT)</div>
                      <div className="text-xl font-bold text-slate-800">{selectedRegulation.dutyInfo.vatRate}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">적용 가능한 FTA</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegulation.dutyInfo.freeTradeAgreements.map((fta, idx) => (
                      <div key={idx} className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="text-sm font-bold text-blue-700">{fta}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    * FTA 적용 시 관세 감면 혜택을 받을 수 있습니다. 원산지증명서가 필요합니다.
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">유용한 링크</h3>
                  <div className="space-y-2">
                    {selectedRegulation.usefulLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                      >
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="text-sm text-slate-600 group-hover:text-indigo-600">{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <div className="text-sm font-bold text-amber-700">주의사항</div>
                  <p className="text-xs text-amber-600 mt-1">
                    본 정보는 참고용이며, 실제 수입 시에는 해당 국가의 최신 규정을 확인하시기 바랍니다.
                    규정은 수시로 변경될 수 있으므로 공식 기관을 통해 최신 정보를 확인하세요.
                  </p>
                </div>
              </div>
            </div>
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

export default ImportRegulations;
