import React, { useState, useEffect } from 'react';

interface CityInfo {
  city: string;
  country: string;
  zone: string;
  flag: string;
  region: string;
  portInfo?: string;
}

const citiesData: CityInfo[] = [
  // 아시아
  { city: 'Seoul', country: '한국', zone: 'Asia/Seoul', flag: '🇰🇷', region: '아시아', portInfo: '인천항, 부산항' },
  { city: 'Tokyo', country: '일본', zone: 'Asia/Tokyo', flag: '🇯🇵', region: '아시아', portInfo: '요코하마항, 고베항' },
  { city: 'Shanghai', country: '중국', zone: 'Asia/Shanghai', flag: '🇨🇳', region: '아시아', portInfo: '상하이항 (세계 1위)' },
  { city: 'Hong Kong', country: '홍콩', zone: 'Asia/Hong_Kong', flag: '🇭🇰', region: '아시아', portInfo: '홍콩항' },
  { city: 'Singapore', country: '싱가포르', zone: 'Asia/Singapore', flag: '🇸🇬', region: '아시아', portInfo: '싱가포르항 (세계 2위)' },
  { city: 'Bangkok', country: '태국', zone: 'Asia/Bangkok', flag: '🇹🇭', region: '아시아', portInfo: '람차방항' },
  { city: 'Ho Chi Minh', country: '베트남', zone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳', region: '아시아', portInfo: '깟라이항' },
  { city: 'Jakarta', country: '인도네시아', zone: 'Asia/Jakarta', flag: '🇮🇩', region: '아시아', portInfo: '탄중프리옥항' },
  { city: 'Mumbai', country: '인도', zone: 'Asia/Kolkata', flag: '🇮🇳', region: '아시아', portInfo: '나바셰바항' },
  { city: 'Dubai', country: 'UAE', zone: 'Asia/Dubai', flag: '🇦🇪', region: '중동', portInfo: '제벨알리항' },
  { city: 'Taipei', country: '대만', zone: 'Asia/Taipei', flag: '🇹🇼', region: '아시아', portInfo: '가오슝항' },
  { city: 'Manila', country: '필리핀', zone: 'Asia/Manila', flag: '🇵🇭', region: '아시아', portInfo: '마닐라항' },

  // 유럽
  { city: 'London', country: '영국', zone: 'Europe/London', flag: '🇬🇧', region: '유럽', portInfo: '펠릭스토항' },
  { city: 'Paris', country: '프랑스', zone: 'Europe/Paris', flag: '🇫🇷', region: '유럽', portInfo: '르아브르항' },
  { city: 'Frankfurt', country: '독일', zone: 'Europe/Berlin', flag: '🇩🇪', region: '유럽', portInfo: '함부르크항' },
  { city: 'Rotterdam', country: '네덜란드', zone: 'Europe/Amsterdam', flag: '🇳🇱', region: '유럽', portInfo: '로테르담항 (유럽 1위)' },
  { city: 'Madrid', country: '스페인', zone: 'Europe/Madrid', flag: '🇪🇸', region: '유럽', portInfo: '발렌시아항' },
  { city: 'Rome', country: '이탈리아', zone: 'Europe/Rome', flag: '🇮🇹', region: '유럽', portInfo: '제노바항' },

  // 미주
  { city: 'New York', country: '미국', zone: 'America/New_York', flag: '🇺🇸', region: '미주', portInfo: '뉴욕/뉴저지항' },
  { city: 'Los Angeles', country: '미국', zone: 'America/Los_Angeles', flag: '🇺🇸', region: '미주', portInfo: 'LA/롱비치항' },
  { city: 'Chicago', country: '미국', zone: 'America/Chicago', flag: '🇺🇸', region: '미주' },
  { city: 'Vancouver', country: '캐나다', zone: 'America/Vancouver', flag: '🇨🇦', region: '미주', portInfo: '밴쿠버항' },
  { city: 'Toronto', country: '캐나다', zone: 'America/Toronto', flag: '🇨🇦', region: '미주' },
  { city: 'Sao Paulo', country: '브라질', zone: 'America/Sao_Paulo', flag: '🇧🇷', region: '미주', portInfo: '산토스항' },
  { city: 'Mexico City', country: '멕시코', zone: 'America/Mexico_City', flag: '🇲🇽', region: '미주', portInfo: '만사니요항' },

  // 오세아니아
  { city: 'Sydney', country: '호주', zone: 'Australia/Sydney', flag: '🇦🇺', region: '오세아니아', portInfo: '시드니항' },
  { city: 'Melbourne', country: '호주', zone: 'Australia/Melbourne', flag: '🇦🇺', region: '오세아니아', portInfo: '멜버른항' },
  { city: 'Auckland', country: '뉴질랜드', zone: 'Pacific/Auckland', flag: '🇳🇿', region: '오세아니아', portInfo: '오클랜드항' },
];

type SortType = 'business' | 'time' | 'name' | 'distance';

// 서울 기준 시차 계산 (대략적인 UTC offset)
const getUtcOffset = (zone: string): number => {
  const offsets: Record<string, number> = {
    'Asia/Seoul': 9, 'Asia/Tokyo': 9, 'Asia/Shanghai': 8, 'Asia/Hong_Kong': 8,
    'Asia/Singapore': 8, 'Asia/Bangkok': 7, 'Asia/Ho_Chi_Minh': 7, 'Asia/Jakarta': 7,
    'Asia/Kolkata': 5.5, 'Asia/Dubai': 4, 'Asia/Taipei': 8, 'Asia/Manila': 8,
    'Europe/London': 0, 'Europe/Paris': 1, 'Europe/Berlin': 1, 'Europe/Amsterdam': 1,
    'Europe/Madrid': 1, 'Europe/Rome': 1,
    'America/New_York': -5, 'America/Los_Angeles': -8, 'America/Chicago': -6,
    'America/Vancouver': -8, 'America/Toronto': -5, 'America/Sao_Paulo': -3, 'America/Mexico_City': -6,
    'Australia/Sydney': 11, 'Australia/Melbourne': 11, 'Pacific/Auckland': 13
  };
  return offsets[zone] ?? 0;
};

const WorldClock: React.FC = () => {
  const [times, setTimes] = useState<Record<string, { time: string; date: string; hour: number }>>({});
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [sortType, setSortType] = useState<SortType>('business');

  const regions = ['전체', '아시아', '유럽', '미주', '오세아니아', '중동'];
  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'business', label: '업무시간순' },
    { value: 'time', label: '시간순' },
    { value: 'name', label: '이름순' },
    { value: 'distance', label: '서울 기준 가까운순' }
  ];

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, { time: string; date: string; hour: number }> = {};
      citiesData.forEach(city => {
        const now = new Date();
        const hour = parseInt(now.toLocaleTimeString('en-US', { timeZone: city.zone, hour: 'numeric', hour12: false }));
        newTimes[city.city] = {
          time: now.toLocaleTimeString('ko-KR', {
            timeZone: city.zone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }),
          date: now.toLocaleDateString('ko-KR', {
            timeZone: city.zone,
            month: 'short',
            day: 'numeric',
            weekday: 'short'
          }),
          hour
        };
      });
      setTimes(newTimes);
    };

    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredCities = citiesData
    .filter(city => {
      const matchesRegion = selectedRegion === '전체' || city.region === selectedRegion;
      const matchesSearch = !searchQuery ||
        city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    })
    .sort((a, b) => {
      const seoulOffset = 9;
      switch (sortType) {
        case 'business': {
          const aHour = times[a.city]?.hour ?? 0;
          const bHour = times[b.city]?.hour ?? 0;
          const aIsBusiness = aHour >= 9 && aHour < 18;
          const bIsBusiness = bHour >= 9 && bHour < 18;
          if (aIsBusiness && !bIsBusiness) return -1;
          if (!aIsBusiness && bIsBusiness) return 1;
          return a.city.localeCompare(b.city);
        }
        case 'time': {
          const aHour = times[a.city]?.hour ?? 0;
          const bHour = times[b.city]?.hour ?? 0;
          return aHour - bHour;
        }
        case 'name':
          return a.city.localeCompare(b.city);
        case 'distance': {
          const aOffset = getUtcOffset(a.zone);
          const bOffset = getUtcOffset(b.zone);
          const aDiff = Math.abs(aOffset - seoulOffset);
          const bDiff = Math.abs(bOffset - seoulOffset);
          return aDiff - bDiff;
        }
        default:
          return 0;
      }
    });

  const getTimeStatus = (zone: string) => {
    const now = new Date();
    const hour = parseInt(now.toLocaleTimeString('en-US', { timeZone: zone, hour: 'numeric', hour12: false }));
    if (hour >= 9 && hour < 18) return 'business';
    if (hour >= 6 && hour < 9) return 'morning';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">세계 시간</h1>
                <p className="text-slate-500 text-sm">World Clock - 주요 물류 거점 현지 시간</p>
              </div>
            </div>
            {/* View Toggle & Sort */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="inline-flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  표
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    viewMode === 'card' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  카드
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Region Filter */}
          <div className="flex flex-wrap gap-2">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedRegion === region
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="도시 또는 국가 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Time Status Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-600">업무시간 (9-18시)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-slate-600">오전/저녁</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
            <span className="text-slate-600">야간</span>
          </div>
        </div>

        {/* Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCities.map(city => {
              const timeData = times[city.city];
              const status = getTimeStatus(city.zone);

              return (
                <div
                  key={city.city}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{city.flag}</span>
                      <div>
                        <h3 className="font-bold text-slate-900">{city.city}</h3>
                        <p className="text-xs text-slate-500">{city.country}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'business' ? 'bg-green-500' :
                      status === 'morning' || status === 'evening' ? 'bg-yellow-500' :
                      'bg-slate-400'
                    }`}></div>
                  </div>

                  <div className="text-center py-3">
                    <div className="text-4xl font-black text-slate-900 tracking-tight">
                      {timeData?.time || '--:--:--'}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {timeData?.date || '---'}
                    </div>
                  </div>

                  {city.portInfo && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{city.portInfo}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-bold text-slate-700">도시</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700">현지시간</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700">날짜</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700">상태</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 hidden md:table-cell">지역</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 hidden lg:table-cell">주요 항만</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCities.map(city => {
                  const timeData = times[city.city];
                  const status = getTimeStatus(city.zone);

                  return (
                    <tr key={city.city} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{city.flag}</span>
                          <div>
                            <div className="font-bold text-slate-900">{city.city}</div>
                            <div className="text-xs text-slate-500">{city.country}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xl font-black text-slate-900">{timeData?.time || '--:--:--'}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-600">
                        {timeData?.date || '---'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          status === 'business' ? 'bg-green-100 text-green-700' :
                          status === 'morning' || status === 'evening' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            status === 'business' ? 'bg-green-500' :
                            status === 'morning' || status === 'evening' ? 'bg-yellow-500' :
                            'bg-slate-400'
                          }`}></span>
                          {status === 'business' ? '업무' : status === 'morning' ? '오전' : status === 'evening' ? '저녁' : '야간'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{city.region}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{city.portInfo || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredCities.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            검색 결과가 없습니다
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-6 bg-slate-100 rounded-xl border border-slate-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-slate-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-slate-600">
              <p className="font-semibold mb-1">시간대 참고사항</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500 text-xs">
                <li>일광절약시간(DST) 적용 국가는 계절에 따라 시간이 1시간 변동될 수 있습니다.</li>
                <li>업무시간 표시는 일반적인 기준이며, 국가/기업별로 다를 수 있습니다.</li>
                <li>공휴일 및 특수 상황에 따라 실제 업무 가능 시간이 다를 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldClock;
