
import React, { useEffect, useState } from 'react';
import { Insight } from '../types/insights';
import { db } from '../lib/supabase';
import ContainerDemo from './ContainerDemo';
import FeedbackModal from './FeedbackModal';
import CoffeeDonationModal from './CoffeeDonationModal';

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
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onPrivacy, onTerms, onNavigateToInsights, onNavigateToInsight, onNavigateToContainer, onNavigateToPallet }) => {
  const [times, setTimes] = useState<Record<string, string>>({});
  const [insights, setInsights] = useState<Insight[]>([]);
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

  // Modal states
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);

  // Load insights from Supabase
  useEffect(() => {
    const loadInsights = async () => {
      try {
        const { data, error } = await db.insights.getPublished();
        if (error) {
          console.error('Error loading insights:', error);
          // Fallback to localStorage if Supabase fails
          const savedInsights = localStorage.getItem('insights');
          if (savedInsights) {
            const parsed = JSON.parse(savedInsights);
            setInsights(parsed.filter((i: Insight) => i.published));
          }
          return;
        }

        if (data) {
          // Convert snake_case to camelCase
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
        // Fallback to localStorage
        const savedInsights = localStorage.getItem('insights');
        if (savedInsights) {
          const parsed = JSON.parse(savedInsights);
          setInsights(parsed.filter((i: Insight) => i.published));
        }
      }
    };

    loadInsights();

    // Listen for custom event when admin panel updates
    const handleInsightsUpdate = () => {
      loadInsights();
    };
    window.addEventListener('insightsUpdated', handleInsightsUpdate);

    return () => {
      window.removeEventListener('insightsUpdated', handleInsightsUpdate);
    };
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

  // Fetch exchange rates from UNIPASS first, fallback to Hana Bank
  useEffect(() => {
    const fetchExchangeRates = async () => {
      const today = new Date();

      // Try UNIPASS first (try today and previous days)
      for (let daysBack = 0; daysBack <= 7; daysBack++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - daysBack);
        const dateStr = targetDate.toISOString().split('T')[0];

        // Check cache first
        const cacheKey = `unipass_rates_${dateStr}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const rates = JSON.parse(cached);
          if (Object.keys(rates).length > 0) {
            setExchangeRates(rates);
            setRateSource('관세청 UNIPASS');
            setRateDate(dateStr);
            return;
          }
        }

        // Fetch from UNIPASS
        try {
          const unipassUrl = `https://unipass.customs.go.kr/csp/myc/bsopspptinfo/dclrSpptInfo/WeekFxrtQryCtr/retrieveWeekFxrt.do?pageIndex=1&pageUnit=100&aplyDt=${dateStr}&weekFxrtTpcd=2&_=${Date.now()}`;
          const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(unipassUrl)}`;

          const response = await fetch(proxyUrl);
          if (response.ok) {
            const text = await response.text();
            const jsonData = JSON.parse(text);

            if (jsonData && jsonData.items && jsonData.items.length > 0) {
              const rates: { [key: string]: number } = {};
              jsonData.items.forEach((record: any) => {
                const currCode = record.currCd;
                const baseRate = parseFloat(record.weekFxrt);
                if (currCode && !isNaN(baseRate)) {
                  rates[currCode] = baseRate;
                }
              });

              if (Object.keys(rates).length > 0) {
                localStorage.setItem(cacheKey, JSON.stringify(rates));
                setExchangeRates(rates);
                setRateSource('관세청 UNIPASS');
                setRateDate(dateStr);
                return;
              }
            }
          }
        } catch (error) {
          console.log(`UNIPASS fetch failed for ${dateStr}:`, error);
        }
      }

      // Fallback to Hana Bank
      try {
        const dateStr = today.toISOString().split('T')[0];
        const dateStrCompact = dateStr.replace(/-/g, '');

        const hanaUrl = 'https://www.kebhana.com/cms/rate/wpfxd651_01i_01.do';
        const hanaData = new URLSearchParams({
          ajax: 'true',
          curCd: '',
          tmpInqStrDt: dateStr,
          pbldDvCd: '1',
          pbldSqn: '',
          hid_key_data: '',
          inqStrDt: dateStrCompact,
          inqKindCd: '1',
          hid_enc_data: '',
          requestTarget: 'searchContentDiv'
        });

        const proxyBases = [
          'https://pr.refra2n-511.workers.dev/?url=',
          'https://corsproxy.io/?url='
        ];

        for (const proxyBase of proxyBases) {
          try {
            const proxyUrl = proxyBase + encodeURIComponent(hanaUrl);
            const response = await fetch(proxyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: hanaData.toString()
            });

            if (response.ok) {
              const html = await response.text();
              if (html.includes('<table')) {
                const rates = parseHanaRates(html);
                if (Object.keys(rates).length > 0) {
                  setExchangeRates(rates);
                  setRateSource('하나은행');
                  setRateDate(dateStr);
                  return;
                }
              }
            }
          } catch (e) {
            continue;
          }
        }
      } catch (error) {
        console.error('Hana Bank fetch failed:', error);
      }
    };

    // Parse Hana Bank HTML to extract rates
    const parseHanaRates = (html: string): { [key: string]: number } => {
      const rates: { [key: string]: number } = {};
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('tbody tr');

      const codeMapping: { [key: string]: string } = {
        '미국': 'USD', '일본': 'JPY', '유로': 'EUR', '영국': 'GBP',
        '스위스': 'CHF', '중국': 'CNY', '호주': 'AUD', '캐나다': 'CAD',
        '홍콩': 'HKD', '싱가포르': 'SGD', '뉴질랜드': 'NZD', '태국': 'THB', '베트남': 'VND'
      };

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          const currencyText = cells[0].textContent?.trim() || '';
          let currCode = null;

          const codeMatch = currencyText.match(/\(([A-Z]{3})\)/);
          if (codeMatch) {
            currCode = codeMatch[1];
          } else {
            for (const [keyword, code] of Object.entries(codeMapping)) {
              if (currencyText.includes(keyword)) {
                currCode = code;
                break;
              }
            }
          }

          if (currCode) {
            const cellIndex = cells.length >= 11 ? 5 : 3;
            const valueText = cells[cellIndex]?.textContent?.trim() || '';
            const value = parseFloat(valueText.replace(/,/g, ''));
            if (!isNaN(value) && value > 0) {
              rates[currCode] = value;
            }
          }
        }
      });

      return rates;
    };

    fetchExchangeRates();
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
    <div className="flex-1 flex flex-col bg-white overflow-y-auto w-full relative">
      
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
                SHIPDAGO는 복잡한 물류 프로세스를 데이터와 AI로 혁신합니다.
                정밀한 3D 시뮬레이션으로 적재 효율을 극대화하고 운송 비용을 절감하세요.
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
                   <ContainerDemo />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="pt-24 pb-32 px-10 bg-slate-900 text-white relative">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/world-item.png')]"></div>
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
                        <div key={code} className="bg-slate-50 border border-slate-100 p-5 rounded-[20px] hover:bg-slate-100 hover:border-blue-200 transition-all group">
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
                  <div className="text-xs text-slate-400 mt-4 flex items-center gap-2">
                     <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                     {rateSource ? `${rateSource} (${rateDate})` : '환율 정보 로딩 중...'}
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
                     <p className="text-4xl font-black tracking-tight text-slate-900">주요 거점 세계 시간</p>
                  </div>
                  <div className="grid grid-cols-4 gap-5">
                     {selectedCities.map((city) => {
                        const cityData = WORLD_CITIES[city];
                        const time = times[city] || '--:--';
                        return (
                           <div key={city} className="flex flex-col items-center group">
                              <div className="w-[70px] h-[70px] rounded-full border border-slate-200 flex items-center justify-center mb-2 bg-slate-50 relative group-hover:border-blue-300 transition-colors">
                                 <div className="absolute inset-2 rounded-full border-t-2 border-blue-500 animate-[spin_4s_linear_infinite]"></div>
                                 <span className="text-xl">{cityData?.flag || '🌍'}</span>
                              </div>
                              <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider text-center leading-tight">{city}</div>
                              <div className="text-[10px] text-slate-400">{cityData?.country || ''}</div>
                              <div className="text-base font-black text-blue-600">{time}</div>
                           </div>
                        );
                     })}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                     <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                     실시간 업데이트
                  </div>
               </div>
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
                       onClick={() => onNavigateToInsight && onNavigateToInsight(post.id)}
                     >
                        <div className="aspect-[16/10] bg-slate-100 rounded-[24px] mb-6 overflow-hidden relative">
                           <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
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
                    <button onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      HOME
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onNavigateToContainer?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      컨테이너 시뮬레이터
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onNavigateToPallet?.(); }} className="text-sm text-slate-600 hover:text-blue-600 transition-colors text-left font-medium">
                      팔레트 시뮬레이터
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
                      href="#/admin"
                      className="opacity-0 hover:opacity-100 transition-opacity ml-3 text-slate-600"
                      title="Admin"
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
    </div>
  );
};

export default LandingPage;
