import React, { useState, useMemo } from 'react';
import { Carrier } from './types';
import { TruckIcon, SearchIcon } from './icons';

// 특송/택배 데이터
const courierCarriers: Carrier[] = [
  { name: 'DHL Express', code: 'DHL', trackingUrl: 'https://www.dhl.com/kr-ko/home/tracking.html', category: 'courier', region: 'Global', isMajor: true },
  { name: 'FedEx', code: 'FDX', trackingUrl: 'https://www.fedex.com/en-kr/tracking.html', category: 'courier', region: 'Global', isMajor: true },
  { name: 'UPS', code: 'UPS', trackingUrl: 'https://www.ups.com/track', category: 'courier', region: 'Global', isMajor: true },
  { name: 'TNT (FedEx)', code: 'TNT', trackingUrl: 'https://www.tnt.com/express/ko_kr/site/shipping-tools/tracking.html', category: 'courier', region: 'Global', isMajor: true },
  { name: 'DB Schenker', code: 'DBS', trackingUrl: 'https://www.dbschenker.com/global/tracking', category: 'courier', region: 'Global', isMajor: true },
  { name: 'Kuehne + Nagel', code: 'KN', trackingUrl: 'https://onlineservices.kuehne-nagel.com/public-tracking/', category: 'courier', region: 'Global', isMajor: true },
  { name: 'DSV', code: 'DSV', trackingUrl: 'https://www.dsv.com/en/tools/track-and-trace', category: 'courier', region: 'Global', isMajor: true },
  { name: 'Expeditors', code: 'EXPO', trackingUrl: 'https://www.expeditors.com/tracking', category: 'courier', region: 'Global', isMajor: true },
  { name: 'CH Robinson', code: 'CHRW', trackingUrl: 'https://www.chrobinson.com/en/navisphere-carrier/shipment-tracking/', category: 'courier', region: 'Global' },
  { name: 'Nippon Express', code: 'NX', trackingUrl: 'https://www.nipponexpress.com/service/tracking/', category: 'courier', region: 'Asia', isMajor: true },
  { name: 'Yusen Logistics', code: 'YLG', trackingUrl: 'https://www.yusen-logistics.com/tracking/', category: 'courier', region: 'Asia' },
  { name: 'Kintetsu World Express', code: 'KWE', trackingUrl: 'https://www.kwe.com/tracking/', category: 'courier', region: 'Asia' },
  { name: 'CEVA Logistics', code: 'CEVA', trackingUrl: 'https://www.cevalogistics.com/en/tools-resources/tracking', category: 'courier', region: 'Global' },
  { name: 'Bollore Logistics', code: 'BOLL', trackingUrl: 'https://www.bollore-logistics.com/en/tracking/', category: 'courier', region: 'Global' },
  { name: 'Panalpina (DSV)', code: 'PAN', trackingUrl: 'https://www.dsv.com/en/tools/track-and-trace', category: 'courier', region: 'Global' },
  { name: 'Kerry Logistics', code: 'KLOG', trackingUrl: 'https://www.kerrylogistics.com/track-trace/', category: 'courier', region: 'Asia' },
  { name: 'Agility', code: 'AGIL', trackingUrl: 'https://www.agility.com/en/tools/track-and-trace/', category: 'courier', region: 'Global' },
  { name: 'Hellmann Worldwide', code: 'HWLD', trackingUrl: 'https://www.hellmann.com/en/tracking', category: 'courier', region: 'Global' },
  { name: 'SF Express', code: 'SF', trackingUrl: 'https://www.sf-express.com/kr/ko/dynamic_function/waybill/', category: 'courier', region: 'Asia', isMajor: true },
  { name: 'YTO Express', code: 'YTO', trackingUrl: 'https://www.yto.net.cn/en/parcelTracking.html', category: 'courier', region: 'Asia' },
  { name: 'ZTO Express', code: 'ZTO', trackingUrl: 'https://www.zto.com/en/express/expressQuery', category: 'courier', region: 'Asia' },
  { name: 'CJ대한통운', code: 'CJ', trackingUrl: 'https://www.cjlogistics.com/ko/tool/parcel/tracking', category: 'courier', region: 'Korea', isMajor: true },
  { name: '한진택배', code: 'HANJIN', trackingUrl: 'https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do', category: 'courier', region: 'Korea', isMajor: true },
  { name: '롯데택배', code: 'LOTTE', trackingUrl: 'https://www.lotteglogis.com/home/reservation/tracking/linkView', category: 'courier', region: 'Korea', isMajor: true },
  { name: '로젠택배', code: 'LOGEN', trackingUrl: 'https://www.ilogen.com/web/personal/trace', category: 'courier', region: 'Korea', isMajor: true },
  { name: '우체국택배', code: 'EPOST', trackingUrl: 'https://service.epost.go.kr/trace.RetrieveRegiPrclDeliv.postal', category: 'courier', region: 'Korea', isMajor: true },
  // 한국 추가 택배사
  { name: '경동택배', code: 'KDEXP', trackingUrl: 'http://www.kdexp.com/sub3_shipping.asp?stype=1', category: 'courier', region: 'Korea' },
  { name: '대신택배', code: 'DAESIN', trackingUrl: 'https://www.ds3211.co.kr/freight/internalFreightSearch.ht', category: 'courier', region: 'Korea' },
  { name: '동부익스프레스', code: 'DONGBU', trackingUrl: 'http://www.dongbups.com/newHtml/delivery/delivery_search.jsp', category: 'courier', region: 'Korea' },
  { name: '범한판토스', code: 'PANTOS', trackingUrl: 'http://www.epantos.com/jsp/gx/tracking/tracking/trackingInquery.jsp', category: 'courier', region: 'Korea' },
  { name: '일양로지스', code: 'ILYANG', trackingUrl: 'http://www.ilyanglogis.com/functionality/tracking_result.asp', category: 'courier', region: 'Korea' },
  { name: '천일택배', code: 'CHUNIL', trackingUrl: 'http://www.chunil.co.kr/HTrace/HTrace.jsp', category: 'courier', region: 'Korea' },
  { name: '한덱스', code: 'HANDEX', trackingUrl: 'http://www.handex.co.kr/tracking', category: 'courier', region: 'Korea' },
  { name: '한의사랑택배', code: 'HANIPS', trackingUrl: 'http://www.hanips.com/html/sub03_03_1.html', category: 'courier', region: 'Korea' },
  { name: 'CVS편의점택배', code: 'CVSNET', trackingUrl: 'http://www.cvsnet.co.kr/invoice/tracking.do', category: 'courier', region: 'Korea' },
  { name: 'GTX로지스', code: 'GTX', trackingUrl: 'http://www.gtxlogis.co.kr/tracking/default.asp', category: 'courier', region: 'Korea' },
  { name: 'KG로지스', code: 'KGLOGIS', trackingUrl: 'https://www.kglogis.co.kr/delivery/deliveryList.do', category: 'courier', region: 'Korea' },
  { name: 'OCS', code: 'OCS', trackingUrl: 'http://www.ocskorea.com/online_bl_multi.asp', category: 'courier', region: 'Korea' },
];

// 운송장 번호 패턴으로 택배사 자동 감지
const detectCourierByPattern = (trackingNo: string): Carrier | null => {
  const cleaned = trackingNo.replace(/[\s-]/g, '').toUpperCase();

  // UPS: 1Z로 시작하는 18자리
  if (/^1Z[A-Z0-9]{16}$/.test(cleaned)) {
    return courierCarriers.find(c => c.code === 'UPS') || null;
  }

  // SF Express: SF로 시작
  if (/^SF\d{12,}$/.test(cleaned)) {
    return courierCarriers.find(c => c.code === 'SF') || null;
  }

  // FedEx: 15, 20, 22자리 숫자 (12자리는 한국 택배와 겹쳐서 제외)
  if (/^\d{15}$/.test(cleaned) || /^\d{20}$/.test(cleaned) || /^\d{22}$/.test(cleaned)) {
    return courierCarriers.find(c => c.code === 'FDX') || null;
  }

  // DHL: 10자리 숫자
  if (/^\d{10}$/.test(cleaned)) {
    return courierCarriers.find(c => c.code === 'DHL') || null;
  }

  // EMS: E로 시작하는 13자리 (EE123456789KR 형식)
  if (/^E[A-Z]\d{9}[A-Z]{2}$/.test(cleaned)) {
    return courierCarriers.find(c => c.code === 'EPOST') || null;
  }

  return null;
};

// 운송장 번호 유효성 검사 (최소 8자리)
const validateTrackingNo = (trackingNo: string): boolean => {
  const cleaned = trackingNo.replace(/[\s-]/g, '');
  return cleaned.length >= 8;
};

// 한글 포함 여부 체크
const containsKorean = (text: string): boolean => {
  return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text);
};

// 운송장 번호 포맷팅
const formatTrackingNo = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

// 택배사별 추적 URL 빌더
const buildTrackingUrl = (carrier: Carrier, trackingNo: string): string => {
  const cleaned = trackingNo.replace(/[\s-]/g, '');

  const urlPatterns: Record<string, () => string> = {
    // 글로벌
    'DHL': () => `https://www.dhl.com/kr-ko/home/tracking/tracking-parcel.html?submit=1&tracking-id=${cleaned}`,
    'FDX': () => `https://www.fedex.com/fedextrack/?trknbr=${cleaned}`,
    'UPS': () => `https://www.ups.com/track?tracknum=${cleaned}`,
    'TNT': () => `https://www.tnt.com/express/ko_kr/site/shipping-tools/tracking.html?searchType=con&cons=${cleaned}`,
    'SF': () => `https://www.sf-express.com/kr/ko/dynamic_function/waybill/#search/bill-number/${cleaned}`,
    'YTO': () => `https://www.yto.net.cn/en/parcelTracking.html?mailNo=${cleaned}`,
    'ZTO': () => `https://www.zto.com/en/express/expressQuery?billCode=${cleaned}`,
    // 한국 주요
    'CJ': () => `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=${cleaned}`,
    'HANJIN': () => `https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mession-path=&wblnum=${cleaned}`,
    'LOTTE': () => `https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=${cleaned}`,
    'LOGEN': () => `https://www.ilogen.com/web/personal/trace/${cleaned}`,
    'EPOST': () => `https://service.epost.go.kr/trace.RetrieveRegiPrclDeliv.postal?sid1=${cleaned}`,
    // 한국 추가
    'KDEXP': () => `http://www.kdexp.com/sub3_shipping.asp?stype=1&p_item=${cleaned}`,
    'DAESIN': () => `https://www.ds3211.co.kr/freight/internalFreightSearch.ht?billno=${cleaned}`,
    'DONGBU': () => `http://www.dongbups.com/newHtml/delivery/delivery_search_view.jsp?item_no=${cleaned}`,
    'PANTOS': () => `http://www.epantos.com/jsp/gx/tracking/tracking/trackingInquery.jsp?refNo=${cleaned}`,
    'ILYANG': () => `http://www.ilyanglogis.com/functionality/tracking_result.asp?hawb_no=${cleaned}`,
    'CHUNIL': () => `http://www.chunil.co.kr/HTrace/HTrace.jsp?transNo=${cleaned}`,
    'HANDEX': () => `http://www.handex.co.kr/tracking?invoice=${cleaned}`,
    'HANIPS': () => `http://www.hanips.com/html/sub03_03_1.html?logicnum=${cleaned}`,
    'CVSNET': () => `http://www.cvsnet.co.kr/invoice/tracking.do?invoice_no=${cleaned}`,
    'GTX': () => `http://www.gtxlogis.co.kr/tracking/default.asp?awblno=${cleaned}`,
    'KGLOGIS': () => `https://www.kglogis.co.kr/delivery/deliveryList.do?deliveryNo=${cleaned}`,
    'OCS': () => `http://www.ocskorea.com/online_bl_multi.asp?mode=search&search_no=${cleaned}`,
  };

  if (urlPatterns[carrier.code]) {
    return urlPatterns[carrier.code]();
  }
  return carrier.trackingUrl;
};

// URL 빌더 지원 택배사 코드 목록
const autoTrackingCodes = new Set([
  'DHL', 'FDX', 'UPS', 'TNT', 'SF', 'YTO', 'ZTO',
  'CJ', 'HANJIN', 'LOTTE', 'LOGEN', 'EPOST',
  'KDEXP', 'DAESIN', 'DONGBU', 'PANTOS', 'ILYANG', 'CHUNIL',
  'HANDEX', 'HANIPS', 'CVSNET', 'GTX', 'KGLOGIS', 'OCS'
]);

interface TrackerCourierProps {
  adSlot?: React.ReactNode;
}

const TrackerCourier: React.FC<TrackerCourierProps> = ({ adSlot }) => {
  const [trackingInput, setTrackingInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMajorOnly, setShowMajorOnly] = useState(false);
  const [detectedCarrier, setDetectedCarrier] = useState<Carrier | null>(null);
  const [showManualSelect, setShowManualSelect] = useState(false);
  const [showKoreanWarning, setShowKoreanWarning] = useState(false);

  // 운송장 번호 입력 처리
  const handleTrackingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // 한글 입력 감지 시 경고 표시
    if (containsKorean(rawValue)) {
      setShowKoreanWarning(true);
      setTimeout(() => setShowKoreanWarning(false), 1500);
    }

    const formatted = formatTrackingNo(rawValue);
    setTrackingInput(formatted);

    // 8자리 이상일 때 패턴 감지
    if (formatted.length >= 8) {
      const carrier = detectCourierByPattern(formatted);
      setDetectedCarrier(carrier);
    } else {
      setDetectedCarrier(null);
    }
  };

  // 추적 실행
  const handleTrack = (carrier?: Carrier) => {
    const targetCarrier = carrier || detectedCarrier;
    if (!targetCarrier) return;

    // 클립보드에 복사
    if (trackingInput) {
      navigator.clipboard.writeText(trackingInput).catch(() => {});
    }

    const url = trackingInput ? buildTrackingUrl(targetCarrier, trackingInput) : targetCarrier.trackingUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 수동 선택으로 추적
  const handleManualTrack = (carrier: Carrier) => {
    // 클립보드에 복사
    if (trackingInput) {
      navigator.clipboard.writeText(trackingInput).catch(() => {});
    }

    const url = trackingInput && validateTrackingNo(trackingInput)
      ? buildTrackingUrl(carrier, trackingInput)
      : carrier.trackingUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowManualSelect(false);
  };

  // 필터링된 운송사 목록
  const filteredCarriers = useMemo(() => {
    return courierCarriers.filter(carrier => {
      const matchesSearch =
        carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carrier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (carrier.region?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesMajor = !showMajorOnly || carrier.isMajor;
      return matchesSearch && matchesMajor;
    });
  }, [searchTerm, showMajorOnly]);

  const sortedCarriers = useMemo(() => {
    return [...filteredCarriers].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredCarriers]);

  const isValidTracking = validateTrackingNo(trackingInput);

  return (
    <div className="space-y-4">
      {/* 운송장 자동 추적 섹션 */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* 설명 영역 */}
          <div className="lg:w-72 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                <TruckIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-bold text-slate-800">운송장 자동 추적</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              운송장 번호 패턴으로 택배사를 자동 감지합니다.
              <span className="text-slate-400 block mt-0.5">예: <span className="font-mono">1Z...</span> → UPS, <span className="font-mono">SF...</span> → SF Express</span>
            </p>
          </div>

          {/* 입력 영역 */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch">
            <div className={`relative transition-[flex,width] duration-300 ease-out ${
              trackingInput && isValidTracking ? 'w-full sm:w-[40%] shrink-0' : 'flex-1'
            }`}>
              <input
                type="text"
                placeholder="운송장 번호 입력"
                value={trackingInput}
                onChange={handleTrackingChange}
                maxLength={30}
                className={`w-full h-full px-5 py-3.5 text-lg font-mono bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                  showKoreanWarning
                    ? 'border-orange-400 bg-orange-50 focus:ring-orange-500/20 focus:border-orange-500 animate-pulse'
                    : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-400'
                }`}
              />
              {showKoreanWarning && (
                <div className="absolute left-0 -bottom-6 text-xs text-orange-600 font-medium animate-fade-in">
                  영문/숫자만 입력 가능합니다
                </div>
              )}
              {trackingInput && (
                <button
                  onClick={() => {
                    setTrackingInput('');
                    setDetectedCarrier(null);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* 감지 결과 & 버튼 */}
            {trackingInput && isValidTracking ? (
              detectedCarrier ? (
                <div className="flex items-stretch gap-2 flex-1 animate-fade-in">
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-orange-50 to-white border border-orange-200 rounded-xl flex-1 min-w-0">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-800 truncate">{detectedCarrier.name}</span>
                    <span className="text-xs text-orange-600 font-mono bg-orange-100/80 px-2 py-0.5 rounded-md shrink-0">{detectedCarrier.code}</span>
                  </div>
                  <button
                    onClick={() => handleTrack()}
                    className="px-5 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 shrink-0"
                  >
                    추적
                  </button>
                  <button
                    onClick={() => setShowManualSelect(!showManualSelect)}
                    className="px-3 py-3.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    변경
                  </button>
                </div>
              ) : (
                <div className="flex items-stretch gap-2 flex-1 animate-fade-in">
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl flex-1 min-w-0">
                    <div className="w-2 h-2 bg-slate-400 rounded-full shrink-0"></div>
                    <span className="text-sm font-medium text-slate-600">택배사를 선택해주세요</span>
                  </div>
                  <button
                    onClick={() => setShowManualSelect(true)}
                    className="px-5 py-3.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-800/25 whitespace-nowrap shrink-0"
                  >
                    택배사 선택
                  </button>
                </div>
              )
            ) : (
              <button
                disabled
                className="px-5 py-3.5 bg-slate-100 text-slate-400 text-sm font-medium rounded-xl cursor-not-allowed whitespace-nowrap shrink-0"
              >
                추적
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 수동 선택 모달/섹션 */}
      {showManualSelect && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-700">택배사 선택</h3>
            <button
              onClick={() => setShowManualSelect(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="택배사 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-9 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {sortedCarriers.map((carrier, idx) => (
                <button
                  key={`${carrier.code}-${idx}`}
                  onClick={() => handleManualTrack(carrier)}
                  className="bg-white rounded border border-slate-200 px-3 py-2 hover:bg-orange-50 hover:border-orange-300 transition-all text-left"
                >
                  <span className="text-sm text-slate-700 block truncate">{carrier.name}</span>
                  <span className="text-xs text-slate-400 font-mono">{carrier.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 전체 택배사 목록 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-700">전체 택배사 목록</h3>
              <p className="text-xs text-slate-500">직접 택배사를 선택하여 추적 페이지로 이동</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="택배사, 코드, 지역 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-9 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Ad Slot */}
        {adSlot && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            {adSlot}
          </div>
        )}

        <div className="p-4">
          {/* Results Count & Major Filter */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-700">{sortedCarriers.length}개</span> 택배사
              </p>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showMajorOnly}
                  onChange={(e) => setShowMajorOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                />
                <span className="text-sm text-slate-600 font-medium">주요 택배사만</span>
              </label>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-orange-500 hover:text-orange-700 font-medium"
              >
                검색 초기화
              </button>
            )}
          </div>

          {/* Carrier Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
            {sortedCarriers.map((carrier, idx) => {
              const hasAutoTracking = autoTrackingCodes.has(carrier.code);
              return (
                <button
                  key={`${carrier.code}-${idx}`}
                  onClick={() => handleManualTrack(carrier)}
                  className={`bg-white rounded border px-2 py-1.5 hover:bg-orange-50 hover:border-orange-300 transition-all text-left group flex items-center gap-1.5 ${
                    hasAutoTracking ? 'border-orange-200' : 'border-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-white shrink-0 ${
                    hasAutoTracking ? 'bg-orange-600' : 'bg-orange-500'
                  }`}>
                    <TruckIcon className="w-3 h-3" />
                  </div>
                  <span className={`text-xs truncate flex-1 ${
                    hasAutoTracking ? 'font-bold text-slate-800' : 'text-slate-700'
                  }`}>{carrier.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{carrier.code}</span>
                </button>
              );
            })}
          </div>

          {/* Empty State */}
          {sortedCarriers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <SearchIcon className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">검색 결과 없음</h3>
              <p className="text-sm text-slate-500 mb-3">"{searchTerm}"에 해당하는 택배사를 찾을 수 없습니다.</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors"
              >
                전체 목록 보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackerCourier;
export { courierCarriers };
