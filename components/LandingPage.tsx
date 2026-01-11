
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Insight } from '../types/insights';
import { FSSCRecord, AIRLINE_CODES } from '../types/fssc';
import { db } from '../lib/supabase';
import { getTodayString, getLocalDateString } from '../lib/date';
import { getThumbnailUrl, getFeaturedImageUrl } from '../lib/image';
import FeedbackModal from './FeedbackModal';
import CoffeeDonationModal from './CoffeeDonationModal';

// Lazy load ContainerDemo for better LCP
const ContainerDemo = lazy(() => import('./ContainerDemo'));

// Placeholder for ContainerDemo while loading
const ContainerDemoPlaceholder = () => (
  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center rounded-[32px]">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-white/60 text-sm font-medium">3D 시뮬레이터 로딩 중...</p>
    </div>
  </div>
);

// 통화 관련 상수
const CURRENCY_SYMBOLS: { [key: string]: string } = {
  'USD': '$', 'EUR': '€', 'CHF': 'Fr', 'KRW': '₩', 'JPY': '¥',
  'GBP': '£', 'CNY': '¥', 'AUD': 'A$', 'CAD': 'C$', 'HKD': 'HK$',
  'SGD': 'S$', 'NZD': 'NZ$', 'THB': '฿', 'VND': '₫'
};

const CURRENCY_NAMES: { [key: string]: string } = {
  'USD': '미국 달러', 'EUR': '유로', 'JPY': '일본 엔',
  'GBP': '영국 파운드', 'CHF': '스위스 프랑',
  'CNY': '중국 위안', 'AUD': '호주 달러',
  'CAD': '캐나다 달러', 'HKD': '홍콩 달러',
  'SGD': '싱가포르 달러', 'NZD': '뉴질랜드 달러',
  'THB': '태국 바트', 'VND': '베트남 동'
};

const DEFAULT_CURRENCIES = ['USD', 'EUR', 'CNY', 'JPY', 'HKD', 'SGD'];
const AVAILABLE_CURRENCIES = ['USD', 'EUR', 'CNY', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'HKD', 'SGD', 'NZD', 'THB', 'VND'];

// 세계 시간 관련 상수
const WORLD_CITIES: { [key: string]: { zone: string; country: string; flag: string } } = {
  'Seoul': { zone: 'Asia/Seoul', country: '한국', flag: '🇰🇷' },
  'Tokyo': { zone: 'Asia/Tokyo', country: '일본', flag: '🇯🇵' },
  'Shanghai': { zone: 'Asia/Shanghai', country: '중국', flag: '🇨🇳' },
  'Hong Kong': { zone: 'Asia/Hong_Kong', country: '홍콩', flag: '🇭🇰' },
  'Singapore': { zone: 'Asia/Singapore', country: '싱가포르', flag: '🇸🇬' },
  'Bangkok': { zone: 'Asia/Bangkok', country: '태국', flag: '🇹🇭' },
  'Ho Chi Minh': { zone: 'Asia/Ho_Chi_Minh', country: '베트남', flag: '🇻🇳' },
  'Dubai': { zone: 'Asia/Dubai', country: 'UAE', flag: '🇦🇪' },
  'London': { zone: 'Europe/London', country: '영국', flag: '🇬🇧' },
  'Paris': { zone: 'Europe/Paris', country: '프랑스', flag: '🇫🇷' },
  'Frankfurt': { zone: 'Europe/Berlin', country: '독일', flag: '🇩🇪' },
  'Rotterdam': { zone: 'Europe/Amsterdam', country: '네덜란드', flag: '🇳🇱' },
  'New York': { zone: 'America/New_York', country: '미국', flag: '🇺🇸' },
  'Los Angeles': { zone: 'America/Los_Angeles', country: '미국', flag: '🇺🇸' },
  'Sydney': { zone: 'Australia/Sydney', country: '호주', flag: '🇦🇺' },
};

const DEFAULT_CITIES = ['Seoul', 'Shanghai', 'New York', 'Ho Chi Minh', 'Hong Kong', 'Tokyo', 'Singapore', 'Dubai'];
const AVAILABLE_CITIES = Object.keys(WORLD_CITIES);

interface LandingPageProps {
  onStart: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
  onNavigateToInsights?: () => void;
  onNavigateToInsight?: (id: string) => void;
  onNavigateToContainer?: () => void;
  onNavigateToPallet?: () => void;
  onNavigateToIncoterms?: () => void;
  onNavigateToHolidays?: () => void;
  onNavigateToCbm?: () => void;
  onNavigateToCurrency?: () => void;
  onNavigateToRegulations?: () => void;
  onNavigateToTracker?: () => void;
  onNavigateToFssc?: () => void;
  onNavigateToWorldClock?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onPrivacy, onTerms, onNavigateToInsights, onNavigateToInsight, onNavigateToContainer, onNavigateToPallet, onNavigateToIncoterms, onNavigateToHolidays, onNavigateToCbm, onNavigateToCurrency, onNavigateToRegulations, onNavigateToTracker, onNavigateToFssc, onNavigateToWorldClock }) => {
  const [times, setTimes] = useState<Record<string, string>>({});
  const [insights, setInsights] = useState<Insight[]>([]);
  const [fsscRecords, setFsscRecords] = useState<FSSCRecord[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [rateSource, setRateSource] = useState<string>('');
  const [rateDate, setRateDate] = useState<string>('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(() => {
    const saved = localStorage.getItem('home_selected_currencies');
    return saved ? JSON.parse(saved) : DEFAULT_CURRENCIES;
  });
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>(() => {
    const saved = localStorage.getItem('home_selected_cities');
    return saved ? JSON.parse(saved) : DEFAULT_CITIES;
  });
  const [showCityModal, setShowCityModal] = useState(false);
  const [expandIncoterms, setExpandIncoterms] = useState(false);
  const [expandHolidays, setExpandHolidays] = useState(false);

  // Modal states
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);

  // Increment view count when insight modal opens
  useEffect(() => {
    if (isInsightModalOpen && selectedInsight) {
      const incrementViewCount = async () => {
        const viewCountKey = `viewed_${selectedInsight.id}`;
        const alreadyViewed = sessionStorage.getItem(viewCountKey);
        if (!alreadyViewed) {
          await db.insights.incrementViewCount(selectedInsight.id);
          sessionStorage.setItem(viewCountKey, 'true');
        }
      };
      incrementViewCount();
    }
  }, [isInsightModalOpen, selectedInsight]);

  // Load insights from Supabase (deferred for better LCP)
  useEffect(() => {
    const loadInsights = async () => {
      try {
        const { data, error } = await db.insights.getPublished();
        if (error) {
          console.error('Error loading insights:', error);
          const savedInsights = localStorage.getItem('insights');
          if (savedInsights) {
            const parsed = JSON.parse(savedInsights);
            setInsights(parsed.filter((i: Insight) => i.published));
          }
          return;
        }

        if (data) {
          const formattedInsights = data.map((item: any) => ({
            id: item.id,
            tag: item.tag,
            title: item.title,
            date: item.date,
            imageUrl: item.image_url,
            content: item.content,
            author: item.author,
            published: item.published
          }));
          setInsights(formattedInsights);
        }
      } catch (error) {
        console.error('Error loading insights:', error);
        const savedInsights = localStorage.getItem('insights');
        if (savedInsights) {
          const parsed = JSON.parse(savedInsights);
          setInsights(parsed.filter((i: Insight) => i.published));
        }
      }
    };

    // Defer API call to improve LCP
    const timeoutId = setTimeout(loadInsights, 100);

    const handleInsightsUpdate = () => {
      loadInsights();
    };
    window.addEventListener('insightsUpdated', handleInsightsUpdate);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('insightsUpdated', handleInsightsUpdate);
    };
  }, []);

  // Load FSSC data (deferred for better LCP)
  useEffect(() => {
    const loadFsscData = async () => {
      try {
        const today = getTodayString();
        const { data, error } = await db.fssc.getFiltered({ date: today });
        if (!error && data) {
          setFsscRecords(data);
        }
      } catch (error) {
        console.error('Error loading FSSC data:', error);
      }
    };
    const timeoutId = setTimeout(loadFsscData, 150);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const newTimes: Record<string, string> = {};
      selectedCities.forEach(city => {
        const cityData = WORLD_CITIES[city];
        if (cityData) {
          newTimes[city] = now.toLocaleTimeString('ko-KR', {
            timeZone: cityData.zone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        }
      });
      setTimes(newTimes);
    };

    updateTimes();
    const timer = setInterval(updateTimes, 60000);
    return () => clearInterval(timer);
  }, [selectedCities]);

  // Fetch exchange rates - Supabase only (deferred for better LCP)
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const { data: cachedRates } = await db.exchangeRates.getLatest();
        if (cachedRates && cachedRates.length > 0 && cachedRates[0].rates) {
          const cached = cachedRates[0];
          const rates = cached.rates as { [key: string]: number };

          if (Object.keys(rates).length > 0) {
            setExchangeRates(rates);
            setRateSource(cached.source === 'unipass' ? '관세청 UNIPASS' : '하나은행');
            setRateDate(cached.date);
            return;
          }
        }
      } catch (e) {
        // Supabase error
      }

      setExchangeRates({});
    };

    const timeoutId = setTimeout(fetchExchangeRates, 200);
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle currency selection
  const handleCurrencyChange = (code: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      if (selectedCurrencies.length >= 6) return; // Max 6 currencies
      newSelected = [...selectedCurrencies, code];
    } else {
      if (selectedCurrencies.length <= 1) return; // Min 1 currency
      newSelected = selectedCurrencies.filter(c => c !== code);
    }
    setSelectedCurrencies(newSelected);
    localStorage.setItem('home_selected_currencies', JSON.stringify(newSelected));
  };

  // Handle city selection
  const handleCityChange = (city: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      if (selectedCities.length >= 8) return; // Max 8 cities
      newSelected = [...selectedCities, city];
    } else {
      if (selectedCities.length <= 1) return; // Min 1 city
      newSelected = selectedCities.filter(c => c !== city);
    }
    setSelectedCities(newSelected);
    localStorage.setItem('home_selected_cities', JSON.stringify(newSelected));
  };



  return (
    <main className="flex-1 flex flex-col bg-white overflow-y-auto w-full relative">
      
      {/* Advertisement Banner - Looking for Advertisers */}
      <div
        className="w-full bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200 py-4 cursor-pointer hover:from-blue-100 hover:to-slate-100 transition-colors"
        onClick={() => setIsFeedbackModalOpen(true)}
      >
         <div className="max-w-7xl mx-auto px-10">
            <div className="flex items-center justify-center gap-3">
               <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
               </svg>
               <span className="text-sm font-medium text-slate-700">
                  광고주를 찾습니다 | 물류 업계 타겟 광고 문의
               </span>
               <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
            </div>
         </div>
      </div>

      {/* Dynamic Background */}
      <div className="absolute top-0 inset-x-0 h-screen pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[140px] opacity-40 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-20"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 md:pt-24 pb-12 md:pb-20 px-4 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 md:gap-20">
          <div className="flex-1 space-y-6 md:space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
              <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-600 animate-ping"></div>
              <span className="text-blue-700 text-[8px] md:text-[10px] font-black tracking-[0.15em] md:tracking-[0.2em] uppercase">Digital Logistics Pioneer</span>
            </div>

            <div className="space-y-4 md:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight">
                Ship Smart.<br/>
                <span className="text-blue-600">Ship Faster.</span>
              </h1>
              <p className="text-base md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium px-4 md:px-0">
                쉽다고는 복잡한 물류 프로세스를 데이터와 AI로 혁신합니다.
                컨테이너 3D 시뮬레이션을 가입 없이 무료로 이용해보세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-5 pt-2 md:pt-4">
              <button
                onClick={onStart}
                className="group relative w-full sm:w-auto px-8 md:px-12 py-3 md:py-5 bg-blue-600 text-white font-black rounded-xl md:rounded-2xl transition-all shadow-xl md:shadow-2xl shadow-blue-500/30 md:shadow-blue-500/40 hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 md:gap-3 relative z-10">
                  <span className="text-base md:text-lg">시뮬레이션 시작</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="w-full sm:w-auto px-8 md:px-12 py-3 md:py-5 bg-white text-slate-900 font-bold rounded-xl md:rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-lg md:shadow-xl shadow-slate-200/10 md:shadow-slate-200/20">
                서비스 안내서
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full lg:w-auto">
             <div className="relative aspect-[4/5] sm:aspect-square max-w-[600px] mx-auto">
                <div className="absolute inset-0 rounded-[32px] shadow-[0_64px_128px_-32px_rgba(37,99,235,0.4)] overflow-hidden">
                   <Suspense fallback={<ContainerDemoPlaceholder />}>
                     <ContainerDemo />
                   </Suspense>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="pt-24 pb-32 px-10 bg-slate-900 text-white relative">
         <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[size:40px_40px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-4 mb-20">
             <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.3em]">How it works</h2>
             <p className="text-4xl font-black text-white tracking-tight">SHIPDAGO를 통한 스마트한 적재 프로세스</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "규격 입력",
                desc: "컨테이너 타입(20ft, 40HQ 등)을 선택하고 적재할 화물의 치수와 수량을 입력하세요."
              },
              {
                step: "02",
                title: "3D 시뮬레이션",
                desc: "알고리즘이 최적의 위치를 계산합니다. 드래그 앤 드롭으로 직접 위치를 조정할 수도 있습니다."
              },
              {
                step: "03",
                title: "결과 공유 및 최적화",
                desc: "최적화된 적재 계획을 확인하고, 효율적인 적재 리스트를 현장에 공유하세요."
              }
            ].map((item, idx) => (
              <div key={idx} className="relative p-10 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-5xl font-black text-blue-500/20 absolute top-8 right-10">{item.step}</div>
                <h3 className="text-2xl font-black text-white mb-4">{item.title}</h3>
                <p className="text-slate-300 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Market Insight Dashboard */}
      <section className="py-32 px-10 bg-white border-y border-slate-50">
         <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
               {/* Left: Exchange Rates */}
               <div className="space-y-10">
                  <div className="space-y-2 text-center">
                     <div className="flex items-center justify-center gap-3">
                        <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">Market Rates</h2>
                        <button
                           onClick={() => setShowCurrencyModal(true)}
                           className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full hover:bg-blue-700 transition-colors"
                        >
                           화폐 선택
                        </button>
                     </div>
                     <p className="text-4xl font-black tracking-tight text-slate-900">실시간 환율 정보</p>
                  </div>
                  <div className={`grid gap-4 ${selectedCurrencies.length <= 3 ? 'sm:grid-cols-3' : selectedCurrencies.length <= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                     {selectedCurrencies.map((code) => (
                        <div
                           key={code}
                           className="bg-slate-50 border border-slate-100 p-5 rounded-[20px] hover:bg-slate-100 hover:border-blue-200 transition-all group cursor-pointer"
                           onClick={onNavigateToCurrency}
                        >
                           <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{CURRENCY_SYMBOLS[code] || ''}</span>
                              <span className="text-[10px] text-slate-500 font-bold">{code} / KRW</span>
                           </div>
                           <div className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">
                              {exchangeRates[code]
                                 ? exchangeRates[code].toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                 : '-'}
                           </div>
                           <div className="text-[9px] text-slate-400 mt-1">{CURRENCY_NAMES[code] || code}</div>
                        </div>
                     ))}
                  </div>
                  <div className="text-xs text-slate-400 mt-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${rateSource ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        {rateSource ? `${rateSource} (${rateDate})` : '환율 계산기에서 조회 후 자동 갱신됩니다'}
                     </div>
                     <button
                        onClick={onNavigateToCurrency}
                        className="text-blue-600 hover:text-blue-700 font-bold"
                     >
                        환율 계산기로 이동 →
                     </button>
                  </div>
               </div>

               {/* Right: World Clock */}
               <div className="space-y-10">
                  <div className="space-y-2 text-center">
                     <div className="flex items-center justify-center gap-3">
                        <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">World Clock</h2>
                        <button
                           onClick={() => setShowCityModal(true)}
                           className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full hover:bg-blue-700 transition-colors"
                        >
                           도시 선택
                        </button>
                     </div>
                     <p className="text-4xl font-black tracking-tight text-slate-900">주요거점 세계시간</p>
                  </div>
                  <div className="grid grid-cols-4 gap-5">
                     {selectedCities.map((city) => {
                        const cityData = WORLD_CITIES[city];
                        const time = times[city] || '--:--';
                        return (
                           <div
                              key={city}
                              className="flex flex-col items-center group cursor-pointer"
                              onClick={onNavigateToWorldClock}
                           >
                              <div className="w-[70px] h-[70px] rounded-full border border-slate-200 flex items-center justify-center mb-2 bg-slate-50 relative group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors">
                                 <div className="absolute inset-2 rounded-full border-t-2 border-blue-500 animate-[spin_4s_linear_infinite]"></div>
                                 <span className="text-xl">{cityData?.flag || '🌍'}</span>
                              </div>
                              <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider text-center leading-tight group-hover:text-blue-600 transition-colors">{city}</div>
                              <div className="text-[10px] text-slate-400">{cityData?.country || ''}</div>
                              <div className="text-base font-black text-blue-600">{time}</div>
                           </div>
                        );
                     })}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        실시간 업데이트
                     </div>
                     <button
                        onClick={onNavigateToWorldClock}
                        className="text-blue-600 hover:text-blue-700 font-bold"
                     >
                        더 많은 정보 보기 →
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Incoterms & World Holidays Preview */}
      <section className="py-32 px-10 bg-slate-50">
         <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-start">
               {/* Left: Incoterms Preview */}
               <div className="space-y-10">
                  <div className="space-y-2 text-center">
                     <div className="flex items-center justify-center gap-3">
                        <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">Incoterms 2020</h2>
                        <button
                           onClick={onNavigateToIncoterms}
                           className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full hover:bg-blue-700 transition-colors"
                        >
                           자세히 보기
                        </button>
                     </div>
                     <p className="text-4xl font-black tracking-tight text-slate-900">인코텀즈 가이드</p>
                  </div>
                  {(() => {
                     const allTerms = [
                        { code: 'EXW', name: 'Ex Works', nameKr: '공장인도', desc: '매도인 의무 최소, 공장에서 인도' },
                        { code: 'FCA', name: 'Free Carrier', nameKr: '운송인인도', desc: '지정장소에서 운송인에게 인도' },
                        { code: 'FAS', name: 'Free Alongside Ship', nameKr: '선측인도', desc: '선박 옆에서 인도 (해상전용)' },
                        { code: 'FOB', name: 'Free On Board', nameKr: '본선인도', desc: '본선 적재 완료 시 인도 (해상전용)' },
                        { code: 'CFR', name: 'Cost and Freight', nameKr: '운임포함인도', desc: '운임 포함, 위험은 선적 시 이전' },
                        { code: 'CIF', name: 'Cost, Insurance & Freight', nameKr: '운임보험료포함', desc: '운임+보험료 포함 (해상전용)' },
                        { code: 'CPT', name: 'Carriage Paid To', nameKr: '운송비지급인도', desc: '목적지까지 운송비 지급' },
                        { code: 'CIP', name: 'Carriage & Insurance Paid', nameKr: '운송비보험료지급', desc: '운송비+보험료 지급' },
                        { code: 'DAP', name: 'Delivered At Place', nameKr: '도착장소인도', desc: '목적지 도착, 양하 전 인도' },
                        { code: 'DPU', name: 'Delivered at Place Unloaded', nameKr: '도착지양하인도', desc: '목적지 양하 후 인도' },
                        { code: 'DDP', name: 'Delivered Duty Paid', nameKr: '관세지급인도', desc: '매도인 의무 최대, 관세까지 부담' },
                     ];
                     const displayTerms = expandIncoterms ? allTerms : allTerms.slice(0, 4);
                     return (
                        <>
                           <div className="space-y-2">
                              {displayTerms.map((term) => (
                                 <div
                                    key={term.code}
                                    className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group shadow-sm"
                                    onClick={onNavigateToIncoterms}
                                 >
                                    <div className="w-14 text-center">
                                       <div className="text-lg font-black text-blue-600 group-hover:text-blue-700">{term.code}</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{term.nameKr}</div>
                                       <div className="text-[11px] text-slate-600 truncate">{term.desc}</div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <button
                              onClick={() => setExpandIncoterms(!expandIncoterms)}
                              className="w-full py-3 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                           >
                              {expandIncoterms ? (
                                 <>접기 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
                              ) : (
                                 <>+{allTerms.length - 4}개 더보기 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                              )}
                           </button>
                        </>
                     );
                  })()}
               </div>

               {/* Right: World Holidays Preview */}
               <div className="space-y-10">
                  <div className="space-y-2 text-center">
                     <div className="flex items-center justify-center gap-3">
                        <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">World Holidays</h2>
                        <button
                           onClick={onNavigateToHolidays}
                           className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full hover:bg-blue-700 transition-colors"
                        >
                           자세히 보기
                        </button>
                     </div>
                     <p className="text-4xl font-black tracking-tight text-slate-900">세계 공휴일 달력</p>
                  </div>
                  {(() => {
                     const today = new Date();
                     const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                     const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

                     // 2026년 공휴일 데이터
                     const allHolidays = [
                        { date: '2026-01-12', name: '成人の日', flag: '🇯🇵', country: '일본' },
                        { date: '2026-01-19', name: 'MLK Day', flag: '🇺🇸', country: '미국' },
                        { date: '2026-01-26', name: 'Australia Day', flag: '🇦🇺', country: '호주' },
                        { date: '2026-02-11', name: '建国記念の日', flag: '🇯🇵', country: '일본' },
                        { date: '2026-02-16', name: 'Presidents Day', flag: '🇺🇸', country: '미국' },
                        { date: '2026-02-17', name: '春节', flag: '🇨🇳', country: '중국' },
                        { date: '2026-02-17', name: '설날', flag: '🇰🇷', country: '한국' },
                        { date: '2026-02-17', name: 'Tết', flag: '🇻🇳', country: '베트남' },
                        { date: '2026-03-01', name: '삼일절', flag: '🇰🇷', country: '한국' },
                        { date: '2026-04-03', name: 'Good Friday', flag: '🇬🇧', country: '영국' },
                        { date: '2026-04-05', name: '清明节', flag: '🇨🇳', country: '중국' },
                        { date: '2026-04-06', name: 'Easter Monday', flag: '🇬🇧', country: '영국' },
                        { date: '2026-05-01', name: '勞動節', flag: '🇨🇳', country: '중국' },
                        { date: '2026-05-05', name: '어린이날', flag: '🇰🇷', country: '한국' },
                        { date: '2026-05-25', name: 'Memorial Day', flag: '🇺🇸', country: '미국' },
                     ].filter(h => h.date >= todayStr);

                     const displayHolidays = expandHolidays ? allHolidays.slice(0, 11) : allHolidays.slice(0, 4);

                     return (
                        <>
                           <div className="space-y-2">
                              {displayHolidays.map((h, idx) => {
                                 const [year, month, day] = h.date.split('-');
                                 const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                 const dayOfWeek = WEEKDAYS[dateObj.getDay()];
                                 const isNextYear = parseInt(year) > today.getFullYear();
                                 return (
                                    <div
                                       key={idx}
                                       className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group shadow-sm"
                                       onClick={onNavigateToHolidays}
                                    >
                                       <span className="text-2xl">{h.flag}</span>
                                       <div className="flex-1 min-w-0">
                                          <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{h.name}</div>
                                          <div className="text-[11px] text-slate-600">{h.country}</div>
                                       </div>
                                       <div className="text-right">
                                          <div className="text-sm font-black text-slate-900">
                                             {isNextYear && <span className="text-[10px] text-blue-500 mr-1">{year}.</span>}
                                             {parseInt(month)}/{parseInt(day)}
                                          </div>
                                          <div className="text-[11px] text-slate-600">{dayOfWeek}요일</div>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                           {allHolidays.length > 4 && (
                              <button
                                 onClick={() => setExpandHolidays(!expandHolidays)}
                                 className="w-full py-3 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                              >
                                 {expandHolidays ? (
                                    <>접기 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
                                 ) : (
                                    <>+{Math.min(allHolidays.length, 11) - 4}개 더보기 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                                 )}
                              </button>
                           )}
                        </>
                     );
                  })()}
               </div>
            </div>
         </div>
      </section>

      {/* FSSC Preview Section */}
      {fsscRecords.length > 0 && (
        <section className="py-32 px-10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">FSC/SCC Rates</h2>
              <p className="text-4xl font-black text-slate-900 tracking-tight mt-2">항공 유류할증료</p>
            </div>

            <div
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={onNavigateToFssc}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-center font-bold text-slate-700">유형</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-700">항공사</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-700">통화</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-700">요금/kg</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-700 hidden md:table-cell">적용구간</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-700">적용기간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fsscRecords
                      .filter(r => r.over_charge && r.over_charge > 0)
                      .sort((a, b) => {
                        const priority = ['KE', 'KJ'];
                        const aIdx = priority.indexOf(a.carrier_code);
                        const bIdx = priority.indexOf(b.carrier_code);
                        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                        if (aIdx !== -1) return -1;
                        if (bIdx !== -1) return 1;
                        return a.carrier_code.localeCompare(b.carrier_code);
                      })
                      .slice(0, 6)
                      .map((record) => (
                      <tr key={record.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            record.type === 'FS' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {record.type === 'FS' ? 'FSC' : 'SCC'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-slate-900">{record.carrier_code}</span>
                          <span className="text-slate-400 text-xs block">{AIRLINE_CODES[record.carrier_code] || ''}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">{record.currency}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-900">
                          {record.over_charge?.toLocaleString() || '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 hidden md:table-cell truncate max-w-[200px]" title={record.route}>
                          {record.route}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 text-xs">
                          {record.start_date.slice(2).replace(/-/g, '.')} ~ {parseInt(record.end_date.split('-')[0]) >= 2050 ? '기한없음' : record.end_date.slice(2).replace(/-/g, '.')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-center">
                <span className="text-sm text-blue-600 font-bold">전세계 데이터 보기 →</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Import Regulations Preview Section */}
      <section className="py-32 px-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">Import Regulations</h2>
              <button
                onClick={onNavigateToRegulations}
                className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full hover:bg-blue-700 transition-colors"
              >
                자세히 보기
              </button>
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tight mt-2">국가별 수입규제</p>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 cursor-pointer"
            onClick={onNavigateToRegulations}
          >
            {[
              { country: '미국', flag: '🇺🇸', code: 'US', info: '한-미 FTA 적용' },
              { country: '중국', flag: '🇨🇳', code: 'CN', info: 'CCC 인증 필수' },
              { country: '일본', flag: '🇯🇵', code: 'JP', info: '한-일 RCEP 적용' },
              { country: '유럽연합', flag: '🇪🇺', code: 'EU', info: 'CE 마크 필수' },
              { country: '베트남', flag: '🇻🇳', code: 'VN', info: '한-베 FTA 적용' },
              { country: '호주', flag: '🇦🇺', code: 'AU', info: '한-호 FTA 적용' },
            ].map((item) => (
              <div
                key={item.code}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all group text-center"
              >
                <span className="text-4xl block mb-3">{item.flag}</span>
                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.country}</div>
                <div className="text-xs text-slate-500 mt-1">{item.info}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics News / Blog Section */}
      <section className="py-32 px-10 bg-white">
         <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16 px-2">
               <div className="space-y-2">
                  <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.3em]">Insights</h2>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">글로벌 물류 트렌드</p>
               </div>
               <button
                 onClick={onNavigateToInsights}
                 className="text-xs font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest border-b border-slate-200 pb-1"
               >
                 View All News
               </button>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
               {insights.length > 0 ? (
                  insights.slice(0, 3).map((post) => (
                     <div
                       key={post.id}
                       className="group cursor-pointer"
                       onClick={() => {
                         setSelectedInsight(post);
                         setIsInsightModalOpen(true);
                       }}
                     >
                        <div className="aspect-[16/10] bg-slate-100 rounded-[24px] mb-6 overflow-hidden relative">
                           <img
                              src={getThumbnailUrl(post.imageUrl)}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                              loading="lazy"
                              onError={(e) => {
                                 (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=400';
                              }}
                           />
                           <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest rounded-full">
                              {post.tag}
                           </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-3">
                           {post.title}
                        </h3>
                        <div className="flex items-center justify-between">
                           <p className="text-xs text-slate-400 font-bold">{post.date}</p>
                           {post.author && (
                              <p className="text-xs text-slate-500">by {post.author}</p>
                           )}
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="col-span-3 text-center py-12">
                     <p className="text-slate-400">아직 게시된 콘텐츠가 없습니다.</p>
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* Advertisement Banner - Looking for Advertisers (Inline) */}
      <div className="w-full py-12">
         <div className="max-w-4xl mx-auto px-10">
            <div
              className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setIsFeedbackModalOpen(true)}
            >
               <div className="flex items-center justify-center gap-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                     <h3 className="text-lg font-bold text-slate-800">광고주를 찾습니다</h3>
                     <p className="text-sm text-slate-600">물류 업계 타겟 마케팅 · 클릭하여 문의하기</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
               </div>
            </div>
         </div>
      </div>

      {/* Bottom CTA */}
      <section className="py-32 px-10 bg-white">
         <div className="max-w-5xl mx-auto bg-slate-900 rounded-[32px] p-16 md:p-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent)]"></div>
            <div className="relative z-10 space-y-10">
               <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight">
                  물류의 디지털 전환,<br/>SHIPDAGO와 시작하세요.
               </h2>
               <button
                 onClick={onStart}
                 className="px-6 sm:px-10 md:px-14 py-4 sm:py-5 md:py-6 bg-white text-slate-900 font-black rounded-2xl text-base sm:text-lg hover:scale-105 transition-all shadow-2xl"
               >
                 무료 시뮬레이션 시작
               </button>
            </div>
         </div>
      </section>

      {/* Balanced Footer */}
      <footer className="bg-gradient-to-b from-white to-slate-50 border-t border-slate-200 pt-16 pb-10 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1fr_1.2fr] gap-12 md:gap-6 mb-12">
              {/* Logo & Description */}
              <div className="space-y-4 flex flex-col items-center md:items-start">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" stroke="white" strokeWidth="2" fill="white" opacity="0.9"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">SHIPDAGO</h3>
                    </div>
                 </div>
                 <p className="text-xs text-slate-600 leading-relaxed text-center md:text-left">
                    물류의 디지털 혁신을 선도하는<br/>
                    스마트 포워딩 솔루션
                 </p>
                 <div className="flex gap-3">
                    <div className="w-9 h-9 bg-slate-100 hover:bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors group">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </div>
                    <div className="w-9 h-9 bg-slate-100 hover:bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors group">
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                 </div>
              </div>

              {/* Quick Links - Expandable */}
              <div className="space-y-5 text-center md:text-left">
                 <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Quick Links</h4>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-w-xs mx-auto md:max-w-none md:mx-0">
                    <button onClick={(e) => { e.preventDefault(); onNavigateToTracker?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      화물 추적
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onStart(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      3D 시뮬레이터
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onNavigateToCbm?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      CBM 계산기
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onNavigateToCurrency?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      환율 계산기
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onNavigateToIncoterms?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      인코텀즈 가이드
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onNavigateToHolidays?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      세계 공휴일
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onNavigateToFssc?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      FSC/SCC 조회
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onNavigateToRegulations?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      수입규제 정보
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onNavigateToInsights?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      물류 인사이트
                    </button>
                 </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 text-center md:text-left md:pl-20">
                 <p className="text-sm text-slate-600 leading-relaxed">
                   SHIPDAGO 서비스에 대한 문의사항이나<br/>
                   제안사항이 있으시면 언제든 연락주세요.
                 </p>
                 <div className="space-y-3 flex flex-col items-center md:items-start">
                   <button
                     onClick={() => setIsFeedbackModalOpen(true)}
                     className="flex items-center gap-3 group"
                   >
                     <div className="w-8 h-8 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                       <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                       </svg>
                     </div>
                     <div className="text-left">
                       <p className="text-xs text-slate-500">피드백 & 제안</p>
                       <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">메시지 남기기</p>
                     </div>
                   </button>
                   <button
                     onClick={() => setIsCoffeeModalOpen(true)}
                     className="flex items-center gap-3 group"
                   >
                     <div className="w-8 h-8 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                       <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
                       </svg>
                     </div>
                     <div className="text-left">
                       <p className="text-xs text-slate-500">개발자 후원</p>
                       <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">커피 한 잔 사기</p>
                     </div>
                   </button>
                 </div>
              </div>
           </div>

           {/* Bottom Bar */}
           <div className="pt-8 border-t border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="text-xs text-slate-500">
                    © 2025 SHIPDAGO. All Rights Reserved.
                    <a
                      href="/admin"
                      className="opacity-0 hover:opacity-100 transition-opacity ml-3 text-slate-600"
                      title="Admin"
                      aria-label="관리자 페이지"
                    >
                      ⚙
                    </a>
                 </div>
                 <div className="flex gap-6 text-xs">
                    <button onClick={onPrivacy} className="text-slate-500 hover:text-slate-700 transition-colors">
                      개인정보처리방침
                    </button>
                    <button onClick={onTerms} className="text-slate-500 hover:text-slate-700 transition-colors">
                      이용약관
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      {/* Coffee Donation Modal */}
      <CoffeeDonationModal
        isOpen={isCoffeeModalOpen}
        onClose={() => setIsCoffeeModalOpen(false)}
      />

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCurrencyModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">화폐 선택</h2>
                <p className="text-xs text-slate-500 mt-1">최대 6개까지 선택 가능</p>
              </div>
              <button
                onClick={() => setShowCurrencyModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {AVAILABLE_CURRENCIES.map(code => (
                <label
                  key={code}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedCurrencies.includes(code)
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCurrencies.includes(code)}
                    onChange={(e) => handleCurrencyChange(code, e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CURRENCY_SYMBOLS[code] || ''}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{code}</div>
                      <div className="text-[10px] text-slate-500">{CURRENCY_NAMES[code] || code}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowCurrencyModal(false)}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* City Selection Modal */}
      {showCityModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCityModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">도시 선택</h2>
                <p className="text-xs text-slate-500 mt-1">최대 8개까지 선택 가능</p>
              </div>
              <button
                onClick={() => setShowCityModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {AVAILABLE_CITIES.map(city => {
                const cityData = WORLD_CITIES[city];
                return (
                  <label
                    key={city}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedCities.includes(city)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city)}
                      onChange={(e) => handleCityChange(city, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cityData?.flag || '🌍'}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{city}</div>
                        <div className="text-[10px] text-slate-500">{cityData?.country || ''}</div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowCityModal(false)}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insight Modal */}
      {isInsightModalOpen && selectedInsight && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsInsightModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Content Container */}
            <div className="overflow-y-auto flex-1">
              {/* Modal Header with Image */}
              {selectedInsight.imageUrl && (
                <div className="relative aspect-[21/9] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  <img
                    src={getFeaturedImageUrl(selectedInsight.imageUrl)}
                    alt={selectedInsight.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  {/* Close Button */}
                  <button
                    onClick={() => setIsInsightModalOpen(false)}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors text-slate-600 hover:text-slate-900 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Modal Content */}
              <div className="p-8 md:p-12">
                {/* Close button if no image */}
                {!selectedInsight.imageUrl && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setIsInsightModalOpen(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium">
                    {selectedInsight.tag}
                  </span>
                  <span className="text-sm text-slate-500">{selectedInsight.date}</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-tight">
                  {selectedInsight.title}
                </h2>

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: selectedInsight.content || '' }}
                />

                {/* Author & Share Section */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Author Info */}
                    {selectedInsight.author && (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {selectedInsight.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900">{selectedInsight.author}</div>
                          <div className="text-sm text-slate-500">SHIPDAGO Insights Editor</div>
                        </div>
                      </div>
                    )}

                    {/* Share Buttons */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 mr-2">공유하기:</span>
                      <button
                        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/insight/' + selectedInsight.id)}`, '_blank', 'width=600,height=400')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] hover:opacity-80 transition-opacity"
                        title="Facebook에 공유"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/insight/' + selectedInsight.id)}&text=${encodeURIComponent(selectedInsight.title)}`, '_blank', 'width=600,height=400')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-black hover:opacity-80 transition-opacity"
                        title="X(Twitter)에 공유"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/insight/' + selectedInsight.id)}`, '_blank', 'width=600,height=400')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A66C2] hover:opacity-80 transition-opacity"
                        title="LinkedIn에 공유"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => window.open(`kakaotalk://sendurl?url=${encodeURIComponent(window.location.origin + '/insight/' + selectedInsight.id)}&text=${encodeURIComponent(selectedInsight.title)}`, '_blank')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FEE500] hover:opacity-80 transition-opacity"
                        title="카카오톡에 공유"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#000000" d="M12 3C6.48 3 2 6.59 2 10.86c0 2.77 1.87 5.2 4.69 6.56l-.78 2.84c-.06.22.16.4.37.3l3.16-1.9c.52.08 1.04.12 1.56.12 5.52 0 10-3.59 10-7.86S17.52 3 12 3zm-4.5 8.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => window.open(`mailto:?subject=${encodeURIComponent(selectedInsight.title)}&body=${encodeURIComponent(selectedInsight.title + '\n\n' + window.location.origin + '/insight/' + selectedInsight.id)}`, '_blank')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-600 hover:opacity-80 transition-opacity"
                        title="이메일로 공유"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { navigator.clipboard.writeText(window.location.origin + '/insight/' + selectedInsight.id); alert('링크가 복사되었습니다!'); }}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-600 hover:opacity-80 transition-opacity"
                        title="링크 복사"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Related Insights */}
                {insights.filter(i => i.id !== selectedInsight.id && i.tag === selectedInsight.tag).length > 0 && (
                  <div className="mt-10 pt-8 border-t border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">관련 콘텐츠</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {insights
                        .filter(i => i.id !== selectedInsight.id && i.tag === selectedInsight.tag)
                        .slice(0, 2)
                        .map(related => (
                          <div
                            key={related.id}
                            className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group"
                            onClick={() => setSelectedInsight(related)}
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                              <img
                                src={getThumbnailUrl(related.imageUrl)}
                                alt={related.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{related.title}</p>
                              <p className="text-xs text-slate-500 mt-2">{related.date}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => setIsInsightModalOpen(false)}
                    className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    닫기
                  </button>
                  <button
                    onClick={() => {
                      setIsInsightModalOpen(false);
                      onNavigateToInsights && onNavigateToInsights();
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    더 많은 인사이트 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default LandingPage;
