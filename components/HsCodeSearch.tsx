import React, { useState, useMemo } from 'react';

interface HsCodeItem {
  code: string;
  nameKo: string;
  nameEn: string;
  category: string;
  subCategory?: string;
  keywords: string[];
  dutyRate?: string;
  unit?: string;
  notes?: string;
}

// HS Code 섹션 (대분류)
const hsSections = [
  { id: '01-05', name: '동물 및 동물성 생산품', icon: '🐄' },
  { id: '06-14', name: '식물성 생산품', icon: '🌾' },
  { id: '15', name: '동물성/식물성 유지', icon: '🫒' },
  { id: '16-24', name: '조제 식료품, 음료, 담배', icon: '🍽️' },
  { id: '25-27', name: '광물성 생산품', icon: '�ite' },
  { id: '28-38', name: '화학공업 생산품', icon: '🧪' },
  { id: '39-40', name: '플라스틱, 고무 및 그 제품', icon: '♻️' },
  { id: '41-43', name: '가죽, 모피 및 그 제품', icon: '👜' },
  { id: '44-46', name: '목재 및 그 제품', icon: '🪵' },
  { id: '47-49', name: '펄프, 종이 및 인쇄물', icon: '📰' },
  { id: '50-63', name: '섬유 및 섬유제품', icon: '👔' },
  { id: '64-67', name: '신발, 모자, 우산 등', icon: '👟' },
  { id: '68-70', name: '석재, 세라믹, 유리', icon: '🏺' },
  { id: '71', name: '귀금속, 보석', icon: '💎' },
  { id: '72-83', name: '비금속 및 그 제품', icon: '🔩' },
  { id: '84-85', name: '기계류, 전자제품', icon: '⚙️' },
  { id: '86-89', name: '차량, 항공기, 선박', icon: '🚗' },
  { id: '90-92', name: '광학기기, 악기', icon: '📷' },
  { id: '93', name: '무기류', icon: '🔫' },
  { id: '94-96', name: '가구, 완구, 잡화', icon: '🪑' },
  { id: '97', name: '예술품, 수집품', icon: '🎨' },
];

// 주요 HS Code 데이터
const hsCodeData: HsCodeItem[] = [
  // 섬유/의류
  { code: '6109.10', nameKo: '면 티셔츠', nameEn: 'T-shirts of cotton', category: '섬유', subCategory: '의류', keywords: ['티셔츠', '면', '코튼', '상의', 't-shirt'], dutyRate: '13%', unit: 'EA/KG' },
  { code: '6109.90', nameKo: '기타 섬유 티셔츠', nameEn: 'T-shirts of other textiles', category: '섬유', subCategory: '의류', keywords: ['티셔츠', '폴리에스터', '상의'], dutyRate: '13%', unit: 'EA/KG' },
  { code: '6110.20', nameKo: '면 스웨터', nameEn: 'Sweaters of cotton', category: '섬유', subCategory: '의류', keywords: ['스웨터', '니트', '면'], dutyRate: '13%', unit: 'EA/KG' },
  { code: '6110.30', nameKo: '합성섬유 스웨터', nameEn: 'Sweaters of man-made fibres', category: '섬유', subCategory: '의류', keywords: ['스웨터', '니트', '합성섬유'], dutyRate: '13%', unit: 'EA/KG' },
  { code: '6203.42', nameKo: '면 바지 (남성)', nameEn: 'Mens trousers of cotton', category: '섬유', subCategory: '의류', keywords: ['바지', '청바지', '면', '남성'], dutyRate: '13%', unit: 'EA/KG' },
  { code: '6204.62', nameKo: '면 바지 (여성)', nameEn: 'Womens trousers of cotton', category: '섬유', subCategory: '의류', keywords: ['바지', '청바지', '면', '여성'], dutyRate: '13%', unit: 'EA/KG' },
  { code: '6205.20', nameKo: '면 셔츠 (남성)', nameEn: 'Mens shirts of cotton', category: '섬유', subCategory: '의류', keywords: ['셔츠', '와이셔츠', '면', '남성'], dutyRate: '13%', unit: 'EA/KG' },
  { code: '6402.19', nameKo: '고무/플라스틱 신발', nameEn: 'Sports footwear with rubber soles', category: '신발', keywords: ['신발', '운동화', '스포츠'], dutyRate: '13%', unit: 'PR' },
  { code: '6403.99', nameKo: '가죽 신발', nameEn: 'Leather footwear', category: '신발', keywords: ['신발', '가죽', '구두'], dutyRate: '13%', unit: 'PR' },
  { code: '6404.11', nameKo: '섬유 스포츠 신발', nameEn: 'Sports footwear with textile uppers', category: '신발', keywords: ['신발', '운동화', '섬유'], dutyRate: '13%', unit: 'PR' },

  // 전자제품
  { code: '8471.30', nameKo: '휴대용 컴퓨터 (노트북)', nameEn: 'Portable computers (laptops)', category: '전자제품', subCategory: '컴퓨터', keywords: ['노트북', '랩탑', '컴퓨터', '휴대용'], dutyRate: '0%', unit: 'EA' },
  { code: '8471.41', nameKo: '데스크탑 컴퓨터', nameEn: 'Desktop computers', category: '전자제품', subCategory: '컴퓨터', keywords: ['데스크탑', '컴퓨터', 'PC'], dutyRate: '0%', unit: 'EA' },
  { code: '8517.12', nameKo: '휴대폰/스마트폰', nameEn: 'Mobile phones/smartphones', category: '전자제품', subCategory: '통신기기', keywords: ['휴대폰', '스마트폰', '핸드폰', '모바일'], dutyRate: '0%', unit: 'EA' },
  { code: '8517.62', nameKo: '통신용 기기', nameEn: 'Communication apparatus', category: '전자제품', subCategory: '통신기기', keywords: ['라우터', '모뎀', '통신장비'], dutyRate: '0%', unit: 'EA' },
  { code: '8518.30', nameKo: '이어폰/헤드폰', nameEn: 'Headphones and earphones', category: '전자제품', subCategory: '음향기기', keywords: ['이어폰', '헤드폰', '에어팟', '버즈'], dutyRate: '8%', unit: 'EA' },
  { code: '8519.81', nameKo: '음성 재생기기', nameEn: 'Sound reproducing apparatus', category: '전자제품', subCategory: '음향기기', keywords: ['MP3', '음악', '재생기'], dutyRate: '8%', unit: 'EA' },
  { code: '8521.90', nameKo: '비디오 기록/재생기', nameEn: 'Video recording apparatus', category: '전자제품', keywords: ['비디오', 'DVD', '블루레이'], dutyRate: '8%', unit: 'EA' },
  { code: '8525.80', nameKo: 'TV 카메라/디지털 카메라', nameEn: 'Television cameras, digital cameras', category: '전자제품', subCategory: '카메라', keywords: ['카메라', '캠코더', 'DSLR', '미러리스'], dutyRate: '0%', unit: 'EA' },
  { code: '8528.72', nameKo: 'TV 수상기 (컬러)', nameEn: 'Color television receivers', category: '전자제품', subCategory: 'TV', keywords: ['TV', '텔레비전', '모니터'], dutyRate: '8%', unit: 'EA' },
  { code: '8543.70', nameKo: '기타 전자기기', nameEn: 'Other electrical machines', category: '전자제품', keywords: ['전자기기', '리모컨'], dutyRate: '8%', unit: 'EA' },

  // 기계류
  { code: '8414.30', nameKo: '압축기 (냉동용)', nameEn: 'Compressors for refrigerating', category: '기계류', keywords: ['압축기', '컴프레셔', '냉동'], dutyRate: '8%', unit: 'EA' },
  { code: '8414.51', nameKo: '선풍기', nameEn: 'Table, floor fans', category: '기계류', subCategory: '가전', keywords: ['선풍기', '팬'], dutyRate: '8%', unit: 'EA' },
  { code: '8418.10', nameKo: '냉장고', nameEn: 'Refrigerators', category: '기계류', subCategory: '가전', keywords: ['냉장고', '냉동고'], dutyRate: '8%', unit: 'EA' },
  { code: '8418.21', nameKo: '압축식 냉장고 (가정용)', nameEn: 'Household refrigerators', category: '기계류', subCategory: '가전', keywords: ['냉장고', '가정용'], dutyRate: '8%', unit: 'EA' },
  { code: '8450.11', nameKo: '전자동 세탁기', nameEn: 'Fully-automatic washing machines', category: '기계류', subCategory: '가전', keywords: ['세탁기', '전자동'], dutyRate: '8%', unit: 'EA' },
  { code: '8451.21', nameKo: '건조기 (10kg 이하)', nameEn: 'Drying machines (10kg or less)', category: '기계류', subCategory: '가전', keywords: ['건조기', '드라이어'], dutyRate: '8%', unit: 'EA' },
  { code: '8467.11', nameKo: '공압식 핸드툴', nameEn: 'Pneumatic hand tools', category: '기계류', subCategory: '공구', keywords: ['공구', '핸드툴', '공압'], dutyRate: '8%', unit: 'EA' },
  { code: '8467.21', nameKo: '전동 드릴', nameEn: 'Electric drills', category: '기계류', subCategory: '공구', keywords: ['드릴', '전동공구'], dutyRate: '8%', unit: 'EA' },
  { code: '8481.80', nameKo: '밸브류', nameEn: 'Valves', category: '기계류', keywords: ['밸브', '콕', '수도'], dutyRate: '8%', unit: 'EA' },
  { code: '8483.40', nameKo: '기어박스', nameEn: 'Gear boxes', category: '기계류', keywords: ['기어박스', '변속기'], dutyRate: '8%', unit: 'EA' },

  // 화장품
  { code: '3303.00', nameKo: '향수/오드뚜왈렛', nameEn: 'Perfumes and toilet waters', category: '화장품', keywords: ['향수', '퍼퓸', '오드뚜왈렛'], dutyRate: '6.5%', unit: 'KG/L' },
  { code: '3304.10', nameKo: '립 메이크업', nameEn: 'Lip make-up preparations', category: '화장품', subCategory: '색조', keywords: ['립스틱', '립글로스', '립밤'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3304.20', nameKo: '아이 메이크업', nameEn: 'Eye make-up preparations', category: '화장품', subCategory: '색조', keywords: ['아이섀도우', '아이라이너', '마스카라'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3304.30', nameKo: '매니큐어/페디큐어', nameEn: 'Manicure/pedicure preparations', category: '화장품', keywords: ['매니큐어', '네일', '페디큐어'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3304.91', nameKo: '파우더 (분첩 포함)', nameEn: 'Powders', category: '화장품', subCategory: '베이스', keywords: ['파우더', '팩트', '분첩'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3304.99', nameKo: '기타 화장품 (스킨케어)', nameEn: 'Other beauty preparations', category: '화장품', subCategory: '스킨케어', keywords: ['스킨', '로션', '세럼', '에센스', '크림', '선크림'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3305.10', nameKo: '샴푸', nameEn: 'Shampoos', category: '화장품', subCategory: '헤어케어', keywords: ['샴푸', '머리'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3305.90', nameKo: '기타 헤어케어', nameEn: 'Other hair preparations', category: '화장품', subCategory: '헤어케어', keywords: ['린스', '컨디셔너', '트리트먼트', '염색'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3306.10', nameKo: '치약', nameEn: 'Dentifrices', category: '화장품', keywords: ['치약'], dutyRate: '8%', unit: 'KG' },
  { code: '3307.10', nameKo: '면도용 제품', nameEn: 'Shaving preparations', category: '화장품', keywords: ['면도', '셰이빙'], dutyRate: '6.5%', unit: 'KG' },

  // 식품
  { code: '0901.21', nameKo: '볶은 커피 (카페인 제거X)', nameEn: 'Roasted coffee, not decaffeinated', category: '식품', subCategory: '음료', keywords: ['커피', '원두', '로스팅'], dutyRate: '2%', unit: 'KG' },
  { code: '0902.10', nameKo: '녹차 (3kg 이하)', nameEn: 'Green tea (up to 3kg)', category: '식품', subCategory: '음료', keywords: ['녹차', '차', '티'], dutyRate: '40%', unit: 'KG' },
  { code: '1704.90', nameKo: '설탕과자 (캔디, 젤리 등)', nameEn: 'Sugar confectionery', category: '식품', subCategory: '과자', keywords: ['캔디', '젤리', '사탕', '과자'], dutyRate: '8%', unit: 'KG' },
  { code: '1806.31', nameKo: '초콜릿 (속을 채운 것)', nameEn: 'Filled chocolate', category: '식품', subCategory: '과자', keywords: ['초콜릿', '초코'], dutyRate: '8%', unit: 'KG' },
  { code: '1806.32', nameKo: '초콜릿 (속을 채우지 않은 것)', nameEn: 'Chocolate, not filled', category: '식품', subCategory: '과자', keywords: ['초콜릿', '초코'], dutyRate: '8%', unit: 'KG' },
  { code: '1905.31', nameKo: '비스킷, 쿠키', nameEn: 'Biscuits and cookies', category: '식품', subCategory: '과자', keywords: ['비스킷', '쿠키', '과자'], dutyRate: '8%', unit: 'KG' },
  { code: '1905.90', nameKo: '빵, 케이크, 페이스트리', nameEn: 'Bread, cakes, pastries', category: '식품', subCategory: '제과', keywords: ['빵', '케이크', '페이스트리'], dutyRate: '8%', unit: 'KG' },
  { code: '2009.11', nameKo: '오렌지주스 (냉동)', nameEn: 'Orange juice, frozen', category: '식품', subCategory: '음료', keywords: ['오렌지', '주스', '냉동'], dutyRate: '30%', unit: 'KG' },
  { code: '2106.90', nameKo: '기타 조제 식료품', nameEn: 'Other food preparations', category: '식품', keywords: ['조제식품', '건강식품', '보조제'], dutyRate: '8%', unit: 'KG' },
  { code: '2202.10', nameKo: '가당/가향 음료', nameEn: 'Waters with sugar or flavored', category: '식품', subCategory: '음료', keywords: ['음료', '탄산', '사이다', '콜라'], dutyRate: '8%', unit: 'L' },

  // 자동차 부품
  { code: '8407.34', nameKo: '가솔린 엔진 (1000cc 초과)', nameEn: 'Spark-ignition engines over 1000cc', category: '자동차', subCategory: '엔진', keywords: ['엔진', '가솔린', '자동차'], dutyRate: '8%', unit: 'EA' },
  { code: '8408.20', nameKo: '디젤 엔진 (차량용)', nameEn: 'Diesel engines for vehicles', category: '자동차', subCategory: '엔진', keywords: ['엔진', '디젤', '자동차'], dutyRate: '8%', unit: 'EA' },
  { code: '8507.60', nameKo: '리튬이온 배터리', nameEn: 'Lithium-ion batteries', category: '자동차', subCategory: '배터리', keywords: ['배터리', '리튬', '전기차'], dutyRate: '8%', unit: 'EA' },
  { code: '8708.10', nameKo: '범퍼', nameEn: 'Bumpers', category: '자동차', subCategory: '부품', keywords: ['범퍼', '자동차부품'], dutyRate: '8%', unit: 'EA' },
  { code: '8708.29', nameKo: '차체 부품', nameEn: 'Body parts', category: '자동차', subCategory: '부품', keywords: ['차체', '도어', '본넷'], dutyRate: '8%', unit: 'EA' },
  { code: '8708.30', nameKo: '브레이크', nameEn: 'Brakes', category: '자동차', subCategory: '부품', keywords: ['브레이크', '제동장치'], dutyRate: '8%', unit: 'EA' },
  { code: '8708.40', nameKo: '변속기', nameEn: 'Gear boxes', category: '자동차', subCategory: '부품', keywords: ['변속기', '기어박스', '트랜스미션'], dutyRate: '8%', unit: 'EA' },
  { code: '8708.80', nameKo: '서스펜션', nameEn: 'Suspension systems', category: '자동차', subCategory: '부품', keywords: ['서스펜션', '현가장치', '쇼바'], dutyRate: '8%', unit: 'EA' },
  { code: '8708.91', nameKo: '라디에이터', nameEn: 'Radiators', category: '자동차', subCategory: '부품', keywords: ['라디에이터', '냉각'], dutyRate: '8%', unit: 'EA' },
  { code: '4011.10', nameKo: '자동차 타이어 (신품)', nameEn: 'New pneumatic tires for cars', category: '자동차', subCategory: '타이어', keywords: ['타이어', '자동차'], dutyRate: '8%', unit: 'EA' },

  // 플라스틱/고무
  { code: '3901.10', nameKo: '폴리에틸렌 (PE)', nameEn: 'Polyethylene', category: '플라스틱', keywords: ['폴리에틸렌', 'PE', '플라스틱'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3902.10', nameKo: '폴리프로필렌 (PP)', nameEn: 'Polypropylene', category: '플라스틱', keywords: ['폴리프로필렌', 'PP', '플라스틱'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3903.19', nameKo: '폴리스티렌 (PS)', nameEn: 'Polystyrene', category: '플라스틱', keywords: ['폴리스티렌', 'PS', '플라스틱'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3904.10', nameKo: 'PVC (폴리염화비닐)', nameEn: 'Polyvinyl chloride', category: '플라스틱', keywords: ['PVC', '폴리염화비닐', '플라스틱'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3907.61', nameKo: 'PET (폴리에틸렌테레프탈레이트)', nameEn: 'Polyethylene terephthalate', category: '플라스틱', keywords: ['PET', '페트', '플라스틱', '병'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3923.21', nameKo: '플라스틱 포대/봉지 (PE)', nameEn: 'Sacks and bags of polymers', category: '플라스틱', subCategory: '포장재', keywords: ['비닐', '봉지', '포대'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3923.30', nameKo: '플라스틱 병/용기', nameEn: 'Plastic bottles and containers', category: '플라스틱', subCategory: '용기', keywords: ['병', '용기', '플라스틱'], dutyRate: '6.5%', unit: 'KG' },
  { code: '3926.20', nameKo: '플라스틱 의류/액세서리', nameEn: 'Articles of apparel of plastics', category: '플라스틱', keywords: ['플라스틱', '의류', '장갑'], dutyRate: '6.5%', unit: 'KG' },
  { code: '4016.93', nameKo: '고무 가스켓/와셔', nameEn: 'Rubber gaskets and washers', category: '고무', keywords: ['가스켓', '와셔', '고무'], dutyRate: '8%', unit: 'KG' },
  { code: '4016.99', nameKo: '기타 고무제품', nameEn: 'Other articles of rubber', category: '고무', keywords: ['고무', '제품'], dutyRate: '8%', unit: 'KG' },

  // 철강/금속
  { code: '7208.10', nameKo: '열연강판 (코일)', nameEn: 'Hot-rolled steel coils', category: '철강', keywords: ['철강', '열연', '강판', '코일'], dutyRate: '0%', unit: 'KG' },
  { code: '7209.15', nameKo: '냉연강판 (3mm 이상)', nameEn: 'Cold-rolled steel sheets', category: '철강', keywords: ['철강', '냉연', '강판'], dutyRate: '0%', unit: 'KG' },
  { code: '7210.49', nameKo: '아연도금 강판', nameEn: 'Zinc-plated steel sheets', category: '철강', keywords: ['철강', '아연도금', '강판'], dutyRate: '0%', unit: 'KG' },
  { code: '7304.31', nameKo: '강관 (이음매없는)', nameEn: 'Seamless steel tubes', category: '철강', keywords: ['강관', '파이프', '튜브'], dutyRate: '0%', unit: 'KG' },
  { code: '7318.15', nameKo: '볼트/너트', nameEn: 'Bolts and nuts', category: '철강', subCategory: '체결구', keywords: ['볼트', '너트', '나사'], dutyRate: '8%', unit: 'KG' },
  { code: '7326.90', nameKo: '기타 철강 제품', nameEn: 'Other articles of iron or steel', category: '철강', keywords: ['철강', '제품'], dutyRate: '8%', unit: 'KG' },
  { code: '7601.10', nameKo: '알루미늄 괴 (비합금)', nameEn: 'Unwrought aluminium', category: '금속', subCategory: '알루미늄', keywords: ['알루미늄', '괴'], dutyRate: '1%', unit: 'KG' },
  { code: '7606.11', nameKo: '알루미늄 판/시트', nameEn: 'Aluminium plates/sheets', category: '금속', subCategory: '알루미늄', keywords: ['알루미늄', '판', '시트'], dutyRate: '3%', unit: 'KG' },
  { code: '7607.11', nameKo: '알루미늄 박 (두께 0.2mm 이하)', nameEn: 'Aluminium foil', category: '금속', subCategory: '알루미늄', keywords: ['알루미늄', '호일', '박'], dutyRate: '3%', unit: 'KG' },

  // 가구/완구
  { code: '9401.30', nameKo: '회전의자', nameEn: 'Swivel seats', category: '가구', keywords: ['의자', '회전의자', '사무용'], dutyRate: '8%', unit: 'EA' },
  { code: '9401.61', nameKo: '목재 의자 (쿠션)', nameEn: 'Wooden seats with cushion', category: '가구', keywords: ['의자', '목재', '쿠션'], dutyRate: '8%', unit: 'EA' },
  { code: '9403.20', nameKo: '금속 가구', nameEn: 'Metal furniture', category: '가구', keywords: ['가구', '금속', '책상'], dutyRate: '8%', unit: 'EA' },
  { code: '9403.30', nameKo: '사무용 목재가구', nameEn: 'Wooden office furniture', category: '가구', keywords: ['가구', '사무용', '목재', '책상'], dutyRate: '8%', unit: 'EA' },
  { code: '9403.50', nameKo: '침실용 목재가구', nameEn: 'Wooden bedroom furniture', category: '가구', keywords: ['가구', '침실', '침대', '옷장'], dutyRate: '8%', unit: 'EA' },
  { code: '9403.60', nameKo: '기타 목재가구', nameEn: 'Other wooden furniture', category: '가구', keywords: ['가구', '목재'], dutyRate: '8%', unit: 'EA' },
  { code: '9503.00', nameKo: '완구/게임용품', nameEn: 'Toys and games', category: '완구', keywords: ['완구', '장난감', '인형', '게임'], dutyRate: '0%', unit: 'EA' },
  { code: '9504.50', nameKo: '비디오게임 콘솔', nameEn: 'Video game consoles', category: '완구', subCategory: '게임', keywords: ['게임기', '콘솔', '플레이스테이션', '닌텐도'], dutyRate: '0%', unit: 'EA' },
  { code: '9506.91', nameKo: '헬스 기구', nameEn: 'Fitness equipment', category: '스포츠', keywords: ['헬스', '운동기구', '피트니스'], dutyRate: '8%', unit: 'EA' },
  { code: '9506.99', nameKo: '기타 스포츠용품', nameEn: 'Other sports equipment', category: '스포츠', keywords: ['스포츠', '운동', '용품'], dutyRate: '8%', unit: 'EA' },
];

const HsCodeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<HsCodeItem | null>(null);

  const filteredCodes = useMemo(() => {
    let results = hsCodeData;

    if (selectedSection) {
      const [start, end] = selectedSection.split('-').map(s => parseInt(s));
      results = results.filter(item => {
        const chapterNum = parseInt(item.code.substring(0, 2));
        if (end) {
          return chapterNum >= start && chapterNum <= end;
        }
        return chapterNum === start;
      });
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(item =>
        item.code.includes(term) ||
        item.nameKo.toLowerCase().includes(term) ||
        item.nameEn.toLowerCase().includes(term) ||
        item.keywords.some(k => k.toLowerCase().includes(term)) ||
        item.category.toLowerCase().includes(term) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(term))
      );
    }

    return results;
  }, [searchTerm, selectedSection]);

  const categories = useMemo(() => {
    const cats = new Set(hsCodeData.map(item => item.category));
    return Array.from(cats);
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">HS Code 검색</h1>
                <p className="text-slate-400 text-xs">Harmonized System Code Finder</p>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="품목명, HS Code, 키워드 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Left: Sections */}
          <div className="space-y-4">
            {/* HS Sections */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700">HS 분류</h2>
                {selectedSection && (
                  <button
                    onClick={() => setSelectedSection(null)}
                    className="text-xs text-orange-500 hover:text-orange-600"
                  >
                    전체보기
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {hsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-all border-b border-slate-100 last:border-b-0 ${
                      selectedSection === section.id
                        ? 'bg-orange-50 border-l-4 border-l-orange-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold ${selectedSection === section.id ? 'text-orange-700' : 'text-slate-700'}`}>
                        {section.id}류
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{section.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Categories */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3">빠른 검색</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSearchTerm(cat)}
                    className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-orange-100 hover:text-orange-700 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <h3 className="text-sm font-bold text-orange-700 mb-2">HS Code란?</h3>
              <p className="text-xs text-orange-600 leading-relaxed">
                HS Code (Harmonized System Code)는 국제 통일 상품분류체계로,
                세계관세기구(WCO)가 제정한 국제 무역 상품 분류 코드입니다.
                6자리까지는 국제 공통이며, 각 국가별로 10자리까지 확장하여 사용합니다.
              </p>
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">
                검색결과 <span className="text-orange-500">{filteredCodes.length}</span>건
              </h2>
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedSection(null); }}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  초기화
                </button>
              )}
            </div>

            {/* Results Grid */}
            {filteredCodes.length > 0 ? (
              <div className="grid gap-3">
                {filteredCodes.map((item) => (
                  <div
                    key={item.code}
                    onClick={() => setSelectedCode(selectedCode?.code === item.code ? null : item)}
                    className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all ${
                      selectedCode?.code === item.code
                        ? 'border-orange-300 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-mono font-bold rounded">
                            {item.code}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                            {item.category}
                          </span>
                          {item.subCategory && (
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] rounded">
                              {item.subCategory}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">{item.nameKo}</h3>
                        <p className="text-xs text-slate-500">{item.nameEn}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {item.dutyRate && (
                          <div className="text-xs">
                            <span className="text-slate-400">관세</span>
                            <span className="ml-1 font-bold text-slate-700">{item.dutyRate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedCode?.code === item.code && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="grid sm:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400">관세율</span>
                            <div className="font-bold text-slate-700">{item.dutyRate || '-'}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">단위</span>
                            <div className="font-bold text-slate-700">{item.unit || '-'}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">카테고리</span>
                            <div className="font-bold text-slate-700">{item.category} {item.subCategory && `> ${item.subCategory}`}</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs text-slate-400">관련 키워드</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.keywords.map((kw, idx) => (
                              <span
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setSearchTerm(kw); }}
                                className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full hover:bg-orange-100 hover:text-orange-700 cursor-pointer"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        {item.notes && (
                          <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                            <span className="text-xs text-amber-700">{item.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-slate-500">검색 결과가 없습니다.</p>
                <p className="text-xs text-slate-400 mt-1">다른 키워드로 검색해 보세요.</p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-xs font-bold text-slate-600">참고사항</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    본 데이터는 참고용이며, 정확한 HS Code 분류와 관세율은 관세청 또는 품목분류 전문기관에 확인하시기 바랍니다.
                    FTA 적용 시 협정세율이 다를 수 있습니다.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <a
                      href="https://unipass.customs.go.kr/clip/index.do"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      관세청 품목분류
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a
                      href="https://www.customs.go.kr/ftaportalkor/main.do"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-orange-500 hover:text-orange-600 flex items-center gap-1"
                    >
                      FTA 포털
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HsCodeSearch;
