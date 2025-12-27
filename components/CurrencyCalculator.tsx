import React, { useState, useEffect, useRef, useCallback } from 'react';

// Types
interface ExchangeRate {
  [currencyCode: string]: number;
}

interface CurrencyNames {
  [currencyCode: string]: string;
}

// Constants
const UNIPASS_CACHE_PREFIX = 'unipass_rates_';
const HANA_CACHE_PREFIX = 'exchangeRate_hana_';
const SELECTED_CURRENCIES_KEY = 'selected_currencies';
const CURRENCY_NAMES_KEY = 'currency_names';

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  'USD': '$', 'EUR': '€', 'CHF': 'Fr', 'KRW': '₩', 'JPY': '¥',
  'GBP': '£', 'CNY': '¥', 'AUD': 'A$', 'CAD': 'C$', 'HKD': 'HK$',
  'SGD': 'S$', 'NZD': 'NZ$', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr',
  'RUB': '₽', 'INR': '₹', 'BRL': 'R$', 'ZAR': 'R', 'THB': '฿',
  'MYR': 'RM', 'IDR': 'Rp', 'PHP': '₱', 'VND': '₫', 'MXN': 'Mex$',
  'TRY': '₺', 'PLN': 'zł', 'AED': 'د.إ', 'SAR': 'SR'
};

const DETAILED_CURRENCY_NAMES: { [key: string]: string } = {
  'USD': '미국 달러', 'EUR': '유로', 'JPY': '일본 엔',
  'GBP': '영국 파운드', 'CHF': '스위스 프랑',
  'CNY': '중국 위안', 'AUD': '호주 달러',
  'CAD': '캐나다 달러', 'HKD': '홍콩 달러',
  'SGD': '싱가포르 달러', 'NZD': '뉴질랜드 달러',
  'SEK': '스웨덴 크로나', 'NOK': '노르웨이 크로네',
  'DKK': '덴마크 크로네', 'RUB': '러시아 루블',
  'INR': '인도 루피', 'BRL': '브라질 헤알',
  'ZAR': '남아프리카공화국 랜드',
  'THB': '태국 바트', 'MYR': '말레이시아 링깃',
  'IDR': '인도네시아 루피아', 'PHP': '필리핀 페소',
  'VND': '베트남 동', 'MXN': '멕시코 페소',
  'TRY': '튀르키예 리라', 'PLN': '폴란드 즐로티',
  'AED': '아랍에미리트 디르함',
  'SAR': '사우디아라비아 리얄',
  'KWD': '쿠웨이트 디나르', 'BHD': '바레인 디나르',
  'JOD': '요르단 디나르', 'QAR': '카타르 리얄',
  'OMR': '오만 리알', 'EGP': '이집트 파운드',
  'ILS': '이스라엘 셰켈', 'CLP': '칠레 페소',
  'COP': '콜롬비아 페소', 'ARS': '아르헨티나 페소',
  'CZK': '체코 코루나', 'HUF': '헝가리 포린트',
  'RON': '루마니아 레우', 'ISK': '아이슬란드 크로나',
  'HRK': '크로아티아 쿠나', 'BGN': '불가리아 레프',
  'KZT': '카자흐스탄 텡게', 'PKR': '파키스탄 루피',
  'BDT': '방글라데시 타카', 'LKR': '스리랑카 루피',
  'TWD': '대만 달러', 'FJD': '피지 달러',
  'PGK': '파푸아뉴기니 키나', 'MNT': '몽골 투그릭',
  'BND': '브루나이 달러', 'KHR': '캄보디아 리엘',
  'LAK': '라오스 킵', 'MMK': '미얀마 차트',
  'NPR': '네팔 루피', 'ETB': '에티오피아 비르'
};

type ApiStatus = 'idle' | 'loading' | 'success' | 'error' | 'cached';
type TabType = 'unipass' | 'hana';

const CurrencyCalculator: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('unipass');

  // State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentRates, setCurrentRates] = useState<ExchangeRate | null>(null);
  const [allCurrencies, setAllCurrencies] = useState<CurrencyNames>({});
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['USD', 'EUR', 'CHF']);
  const [fromCurrency, setFromCurrency] = useState<string>('KRW');
  const [amount, setAmount] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState<boolean>(false);
  const [showSavedDates, setShowSavedDates] = useState<boolean>(false);
  const [savedDates, setSavedDates] = useState<string[]>([]);

  // Calculator state
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcCurNum, setCalcCurNum] = useState<string>('0');
  const [calcFirstOperand, setCalcFirstOperand] = useState<string | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcExpression, setCalcExpression] = useState<string>('');
  const calcRef = useRef<HTMLDivElement>(null);

  // Draggable calculator state
  const [calcPosition, setCalcPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState<boolean>(false);

  // Get cache prefix based on active tab
  const getCachePrefix = useCallback(() => activeTab === 'unipass' ? UNIPASS_CACHE_PREFIX : HANA_CACHE_PREFIX, [activeTab]);

  // Format number with commas
  const formatNumberWithCommas = (num: string): string => {
    if (!num || num === '0') return num;
    const parts = String(num).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (decimalPart !== undefined) {
      return `${formattedInteger}.${decimalPart}`;
    }
    return formattedInteger;
  };

  // Load saved preferences on mount
  useEffect(() => {
    const savedCurrencies = localStorage.getItem(SELECTED_CURRENCIES_KEY);
    if (savedCurrencies) {
      setSelectedCurrencies(JSON.parse(savedCurrencies));
    }

    const savedNames = localStorage.getItem(CURRENCY_NAMES_KEY);
    if (savedNames) {
      setAllCurrencies(JSON.parse(savedNames));
    }

    const savedTab = localStorage.getItem('currency_active_tab') as TabType;
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Keyboard event for calculator toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '\\') {
        e.preventDefault();
        setShowCalculator(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Draggable calculator event handlers (mouse + touch)
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCalcPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setCalcPosition({
          x: touch.clientX - dragOffset.x,
          y: touch.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  const handleCalcMouseDown = (e: React.MouseEvent) => {
    if (calcRef.current) {
      const rect = calcRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      setHasBeenDragged(true);
      setCalcPosition({
        x: rect.left,
        y: rect.top
      });
    }
  };

  const handleCalcTouchStart = (e: React.TouchEvent) => {
    if (calcRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = calcRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      setIsDragging(true);
      setHasBeenDragged(true);
      setCalcPosition({
        x: rect.left,
        y: rect.top
      });
    }
  };

  // Calculator keyboard input
  useEffect(() => {
    if (!showCalculator) return;

    const handleCalcKeyDown = (e: KeyboardEvent) => {
      if (e.key === '\\') return; // Already handled above

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleCalcDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleCalcDecimal();
      } else if (e.key === '+' || e.key === '-') {
        e.preventDefault();
        handleCalcOperator(e.key);
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleCalcOperator('X');
      } else if (e.key === '/') {
        e.preventDefault();
        handleCalcOperator('/');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalcEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleCalcBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCalcClear();
      } else if (e.key === '%') {
        e.preventDefault();
        handleCalcPercent();
      }
    };

    document.addEventListener('keydown', handleCalcKeyDown);
    return () => document.removeEventListener('keydown', handleCalcKeyDown);
  }, [showCalculator, calcCurNum, calcFirstOperand, calcOperator]);

  // Update saved dates list
  const updateSavedDatesList = useCallback(() => {
    const dates: string[] = [];
    const prefix = getCachePrefix();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        dates.push(key.replace(prefix, ''));
      }
    }
    dates.sort().reverse();
    setSavedDates(dates);
  }, [getCachePrefix]);

  // Fetch rates when date or tab changes
  useEffect(() => {
    if (date) {
      fetchRatesOnDateChange();
    }
    updateSavedDatesList();
  }, [date, activeTab]);

  const showStatus = (type: ApiStatus, message: string) => {
    setApiStatus(type);
    setStatusMessage(message);

    if (type === 'success' || type === 'cached') {
      setTimeout(() => {
        setApiStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const getCurrencySymbol = (code: string): string => {
    return CURRENCY_SYMBOLS[code] || '';
  };

  const getDetailedCurrencyName = (code: string): string => {
    if (DETAILED_CURRENCY_NAMES[code]) {
      return DETAILED_CURRENCY_NAMES[code];
    }
    if (allCurrencies[code] && allCurrencies[code] !== code) {
      return allCurrencies[code];
    }
    return code;
  };

  const getCurrencyName = (code: string): string => {
    if (code === 'KRW') {
      return '원 (KRW)';
    }
    return `${getDetailedCurrencyName(code)} (${code})`;
  };

  // UNIPASS data processing
  const processUnipassData = (jsonData: any, dateStr: string): boolean => {
    const rates: ExchangeRate = {};
    const currencyNames: CurrencyNames = {};

    if (jsonData && jsonData.items && jsonData.items.length > 0) {
      jsonData.items.forEach((record: any) => {
        const currCode = record.currCd;
        const currName = record.currNm;
        const baseRate = parseFloat(record.weekFxrt);

        if (currCode && !isNaN(baseRate)) {
          rates[currCode] = baseRate;
          currencyNames[currCode] = currName || currCode;
        }
      });
    }

    if (Object.keys(rates).length > 0) {
      const key = `${UNIPASS_CACHE_PREFIX}${dateStr}`;
      localStorage.setItem(key, JSON.stringify(rates));
      localStorage.setItem(CURRENCY_NAMES_KEY, JSON.stringify(currencyNames));

      setAllCurrencies(currencyNames);
      setCurrentRates(rates);

      showStatus('success', `환율 데이터를 불러왔습니다 (${Object.keys(rates).length}개 통화)`);
      updateSavedDatesList();

      return true;
    }

    return false;
  };

  // Hana Bank HTML parsing helpers
  const extractCurrencyCode = (currencyText: string): string | null => {
    const codeMatch = currencyText.match(/\(([A-Z]{3})\)/);
    if (codeMatch) return codeMatch[1];

    const mapping: { [key: string]: string } = {
      '미국': 'USD', '일본': 'JPY', '유로': 'EUR', '영국': 'GBP', '스위스': 'CHF',
      '중국': 'CNY', '호주': 'AUD', '캐나다': 'CAD', '홍콩': 'HKD', '싱가포르': 'SGD',
      '뉴질랜드': 'NZD', '스웨덴': 'SEK', '노르웨이': 'NOK', '덴마크': 'DKK',
      '러시아': 'RUB', '인도': 'INR', '브라질': 'BRL', '남아공': 'ZAR', '태국': 'THB',
      '말레이시아': 'MYR', '인도네시아': 'IDR', '필리핀': 'PHP', '베트남': 'VND',
      '멕시코': 'MXN', '터키': 'TRY', '폴란드': 'PLN', 'UAE': 'AED', '사우디': 'SAR',
      '쿠웨이트': 'KWD', '바레인': 'BHD', '요르단': 'JOD', '카타르': 'QAR', '오만': 'OMR',
      '이집트': 'EGP', '이스라엘': 'ILS', '칠레': 'CLP', '콜롬비아': 'COP',
      '아르헨티나': 'ARS', '체코': 'CZK', '헝가리': 'HUF', '루마니아': 'RON',
      '대만': 'TWD', '몽골': 'MNT', '파키스탄': 'PKR', '방글라데시': 'BDT'
    };

    for (const [keyword, code] of Object.entries(mapping)) {
      if (currencyText.includes(keyword)) return code;
    }

    return null;
  };

  const extractRatesFromHtml = (html: string, extractType: 'rate' | 'usd'): { data: ExchangeRate; currencyNames: CurrencyNames } => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = doc.querySelectorAll('table');

    const data: ExchangeRate = {};
    const currencyNames: CurrencyNames = {};

    tables.forEach((table) => {
      const rows = table.querySelectorAll('tbody tr');

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');

        let cellIndex: number;
        let minCells: number;

        if (extractType === 'rate') {
          if (cells.length >= 11) {
            cellIndex = 5;
            minCells = 11;
          } else {
            cellIndex = 3;
            minCells = 9;
          }
        } else {
          if (cells.length >= 9) {
            cellIndex = 8;
            minCells = 9;
          } else if (cells.length >= 2) {
            cellIndex = 1;
            minCells = 2;
          } else {
            return;
          }
        }

        if (cells.length >= minCells) {
          const currencyText = cells[0].textContent?.trim() || '';
          const currencyCode = extractCurrencyCode(currencyText);

          if (currencyCode) {
            const valueText = cells[cellIndex].textContent?.trim() || '';
            const value = parseFloat(valueText.replace(/,/g, ''));

            if (!isNaN(value) && value > 0) {
              data[currencyCode] = value;
              currencyNames[currencyCode] = currencyText;
            }
          }
        }
      });
    });

    return { data, currencyNames };
  };

  const processHanaData = (mall1501Html: string, mall1502Html: string, dateStr: string): boolean => {
    const sendingResult = extractRatesFromHtml(mall1501Html, 'rate');
    const usdResult = extractRatesFromHtml(mall1502Html, 'usd');

    if (!sendingResult.data.USD || !usdResult.data.USD) {
      return false;
    }

    const rates: ExchangeRate = {};
    const combinedCurrencyNames = { ...sendingResult.currencyNames, ...usdResult.currencyNames };

    for (const [code, rate] of Object.entries(sendingResult.data)) {
      rates[code] = rate;
    }

    for (const [code, rate] of Object.entries(usdResult.data)) {
      rates[`${code}_usd`] = rate;
    }

    const key = `${HANA_CACHE_PREFIX}${dateStr}`;
    localStorage.setItem(key, JSON.stringify(rates));
    localStorage.setItem(CURRENCY_NAMES_KEY, JSON.stringify(combinedCurrencyNames));

    setAllCurrencies(combinedCurrencyNames);
    setCurrentRates(rates);

    showStatus('success', '하나은행 환율 데이터를 불러왔습니다');
    updateSavedDatesList();

    return true;
  };

  const fetchRatesOnDateChange = async () => {
    if (!date) return;

    const prefix = getCachePrefix();
    const key = `${prefix}${date}`;
    const cachedRates = localStorage.getItem(key);

    if (cachedRates) {
      const rates = JSON.parse(cachedRates);
      setCurrentRates(rates);
      showStatus('cached', `캐시에서 불러왔습니다 (${date})`);
      return;
    }

    if (activeTab === 'unipass') {
      await fetchUnipassRates(date);
    } else {
      await fetchHanaRates(date);
    }
  };

  const fetchUnipassRates = async (dateStr: string) => {
    showStatus('loading', '환율 데이터를 불러오는 중...');

    const pageIndex = 1;
    const pageUnit = 100;
    const weekFxrtTpcd = '2';
    const timestamp = Date.now();

    const unipassUrl = `https://unipass.customs.go.kr/csp/myc/bsopspptinfo/dclrSpptInfo/WeekFxrtQryCtr/retrieveWeekFxrt.do?pageIndex=${pageIndex}&pageUnit=${pageUnit}&aplyDt=${dateStr}&weekFxrtTpcd=${weekFxrtTpcd}&undefined=${dateStr}&_=${timestamp}`;

    const proxyUrls = [
      `https://corsproxy.io/?url=${encodeURIComponent(unipassUrl)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(unipassUrl)}`
    ];

    for (let i = 0; i < proxyUrls.length; i++) {
      try {
        const response = await fetch(proxyUrls[i]);
        if (!response.ok) continue;

        let text = await response.text();

        if (proxyUrls[i].includes('allorigins.win')) {
          try {
            const json = JSON.parse(text);
            text = json.contents;
          } catch (e) {
            continue;
          }
        }

        try {
          const jsonData = JSON.parse(text);
          if (processUnipassData(jsonData, dateStr)) {
            return;
          }
        } catch (e) {
          continue;
        }
      } catch (error) {
        continue;
      }
    }

    showStatus('error', '해당 날짜의 환율 데이터가 없습니다 (주말/공휴일 또는 데이터 미제공 날짜)');
  };

  // Get last week's Monday and Friday
  const getLastWeekDates = (baseDate: string): { start: string; end: string } => {
    const date = new Date(baseDate);
    const dayOfWeek = date.getDay(); // 0 (Sun) ~ 6 (Sat)
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to 1 (Mon) ~ 7 (Sun)

    // Last Monday = today - (current day + 6)
    const lastMonday = new Date(date);
    lastMonday.setDate(date.getDate() - (adjustedDay + 6));

    // Last Friday = last Monday + 4 days
    const lastFriday = new Date(lastMonday);
    lastFriday.setDate(lastMonday.getDate() + 4);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    return {
      start: formatDate(lastMonday),
      end: formatDate(lastFriday)
    };
  };

  const fetchHanaRates = async (dateStr: string) => {
    showStatus('loading', '하나은행에서 환율 데이터를 불러오는 중...');

    const dateStrCompact = dateStr.replace(/-/g, '');
    const weekDates = getLastWeekDates(dateStr);
    const startDateCompact = weekDates.start.replace(/-/g, '');
    const endDateCompact = weekDates.end.replace(/-/g, '');

    // mall1501 - 송금환율
    const mall1501Url = 'https://www.kebhana.com/cms/rate/wpfxd651_01i_01.do';
    const mall1501Data = new URLSearchParams({
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

    // mall1502 - 대미환산율 (기간평균)
    const mall1502Url = 'https://www.kebhana.com/cms/rate/wpfxd651_06i_01.do';
    const mall1502Data = new URLSearchParams({
      ajax: 'true',
      curCd: '',
      inqDvCd: '4',
      tmpInqStrDt_p: weekDates.start,
      tmpInqEndDt_p: weekDates.end,
      tmpPbldDvCd: '1',
      hid_key_data: '',
      inqStrDt: startDateCompact,
      inqEndDt: endDateCompact,
      pbldDvCd: '1',
      hid_enc_data: '',
      requestTarget: 'searchContentDiv'
    });

    let mall1501Html = '';
    let mall1502Html = '';

    // Try fetching via cors-anywhere style proxies that support POST
    const proxyBases = [
      'https://pr.refra2n-511.workers.dev/?url=',
      'https://corsproxy.io/?url=',
      'https://api.allorigins.win/raw?url='
    ];

    // For Hana Bank, we need POST requests. Most CORS proxies don't support POST well.
    // Try using a different approach - fetch via allorigins which does GET on the URL
    // Since Hana uses POST, we'll construct the URL with query params as fallback

    // Try mall1501
    for (const proxyBase of proxyBases) {
      try {
        const proxyUrl = proxyBase + encodeURIComponent(mall1501Url);
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: mall1501Data.toString()
        });

        if (response.ok) {
          mall1501Html = await response.text();
          if (mall1501Html.includes('tbl_type1') || mall1501Html.includes('<table')) {
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // Try mall1502
    for (const proxyBase of proxyBases) {
      try {
        const proxyUrl = proxyBase + encodeURIComponent(mall1502Url);
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: mall1502Data.toString()
        });

        if (response.ok) {
          mall1502Html = await response.text();
          if (mall1502Html.includes('tbl_type1') || mall1502Html.includes('<table')) {
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (mall1501Html && mall1502Html) {
      if (processHanaData(mall1501Html, mall1502Html, dateStr)) {
        return;
      }
    }

    showStatus('error', '하나은행 환율 데이터를 불러올 수 없습니다. (CORS 제한 또는 데이터 없음)');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/,/g, '');

    if (value && !/^[\d.]*$/.test(value)) {
      value = value.replace(/[^\d.]/g, '');
    }

    if (value.includes('.')) {
      const parts = value.split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1] || '';

      if (integerPart) {
        const formatted = parseInt(integerPart).toLocaleString('en-US');
        setAmount(formatted + '.' + decimalPart);
      } else {
        setAmount('.' + decimalPart);
      }
    } else if (value && !isNaN(Number(value))) {
      setAmount(parseInt(value).toLocaleString('en-US'));
    } else {
      setAmount(value);
    }
  };

  const handleAmountBlur = () => {
    let value = amount.replace(/,/g, '');
    if (value && !isNaN(Number(value)) && value !== '.') {
      setAmount(parseFloat(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
    }
  };

  const calculate = () => {
    if (!date) {
      alert('날짜를 선택해주세요.');
      return;
    }

    const amountNum = parseFloat(amount.replace(/,/g, ''));
    if (!amountNum || amountNum <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    if (!currentRates) {
      alert('해당 날짜의 환율 데이터가 없습니다. 날짜를 선택하여 환율을 먼저 불러와주세요.');
      return;
    }

    setShowResult(true);
  };

  const getConversionResult = (toCurrency: string): { result: number; appliedRate: number; rateInfo: string } | null => {
    if (!currentRates || toCurrency === fromCurrency) return null;

    const amountNum = parseFloat(amount.replace(/,/g, ''));
    if (!amountNum || amountNum <= 0) return null;

    let result: number;
    let appliedRate: number;
    let rateInfo: string = '';

    if (activeTab === 'unipass') {
      if (fromCurrency === 'KRW' && toCurrency !== 'KRW') {
        appliedRate = currentRates[toCurrency];
        result = amountNum / appliedRate;
        rateInfo = `환율: ${appliedRate.toFixed(2)} 원`;
      } else if (fromCurrency !== 'KRW' && toCurrency === 'KRW') {
        appliedRate = currentRates[fromCurrency];
        result = amountNum * appliedRate;
        rateInfo = `환율: ${appliedRate.toFixed(2)} 원`;
      } else {
        const fromRate = currentRates[fromCurrency];
        const toRate = currentRates[toCurrency];
        const amountInKRW = amountNum * fromRate;
        result = amountInKRW / toRate;
        appliedRate = toRate;
        rateInfo = `환율: ${appliedRate.toFixed(2)} 원`;
      }
    } else {
      if (fromCurrency === 'KRW' || toCurrency === 'KRW') {
        if (fromCurrency === 'KRW' && toCurrency !== 'KRW') {
          appliedRate = currentRates[toCurrency];
          result = amountNum / appliedRate;
          rateInfo = `송금 환율: ${appliedRate.toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 원`;
        } else {
          appliedRate = currentRates[fromCurrency];
          result = amountNum * appliedRate;
          rateInfo = `송금 환율: ${appliedRate.toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 원`;
        }
      } else {
        if (fromCurrency === 'USD') {
          const toUsdRate = currentRates[`${toCurrency}_usd`];
          result = amountNum / toUsdRate;
          appliedRate = 1 / toUsdRate;
          rateInfo = `교차환율: 1 USD = ${(1/toUsdRate).toFixed(4)} ${toCurrency}`;
        } else if (toCurrency === 'USD') {
          const fromUsdRate = currentRates[`${fromCurrency}_usd`];
          result = amountNum * fromUsdRate;
          appliedRate = fromUsdRate;
          rateInfo = `교차환율: 1 ${fromCurrency} = ${fromUsdRate.toFixed(4)} USD`;
        } else {
          const fromUsdRate = currentRates[`${fromCurrency}_usd`];
          const toUsdRate = currentRates[`${toCurrency}_usd`];
          const crossRate = fromUsdRate / toUsdRate;
          result = amountNum * crossRate;
          appliedRate = crossRate;
          rateInfo = `교차환율: 1 ${fromCurrency} = ${crossRate.toFixed(4)} ${toCurrency}`;
        }
      }
    }

    return { result, appliedRate, rateInfo };
  };

  const handleCurrencySelectionChange = (code: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedCurrencies, code];
    } else {
      newSelected = selectedCurrencies.filter(c => c !== code);
    }
    setSelectedCurrencies(newSelected);
    localStorage.setItem(SELECTED_CURRENCIES_KEY, JSON.stringify(newSelected));
  };

  const loadSavedDate = (dateStr: string) => {
    setDate(dateStr);
  };

  const deleteSavedDate = (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`${dateStr} 환율 데이터를 삭제하시겠습니까?`)) {
      localStorage.removeItem(`${getCachePrefix()}${dateStr}`);
      updateSavedDatesList();
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('currency_active_tab', tab);
    setCurrentRates(null);
    setShowResult(false);
  };

  // Calculator functions (matching original logic)
  const calcCalculate = (num1: string, op: string, num2: string): string => {
    const n1 = Number(num1);
    const n2 = Number(num2);
    let result: number;

    switch (op) {
      case '+':
        result = n1 + n2;
        break;
      case '-':
        result = n1 - n2;
        break;
      case 'X':
        result = n1 * n2;
        break;
      case '/':
        result = n1 / n2;
        break;
      default:
        result = 0;
    }

    return String(parseFloat(result.toFixed(10)));
  };

  const handleCalcDigit = (digit: string) => {
    setCalcCurNum(prev => prev === '0' ? digit : prev + digit);
  };

  const handleCalcDecimal = () => {
    setCalcCurNum(prev => prev.includes('.') ? prev : prev + '.');
  };

  const handleCalcOperator = (op: string) => {
    if (calcOperator && calcCurNum !== '0' && calcFirstOperand !== null) {
      const result = calcCalculate(calcFirstOperand, calcOperator, calcCurNum);
      setCalcFirstOperand(result);
      setCalcCurNum('0');
      setCalcExpression(`${formatNumberWithCommas(result)} ${op}`);
    } else if (calcOperator && calcCurNum === '0') {
      setCalcExpression(`${formatNumberWithCommas(calcFirstOperand || '0')} ${op}`);
    } else {
      setCalcFirstOperand(calcCurNum);
      setCalcCurNum('0');
      setCalcExpression(`${formatNumberWithCommas(calcCurNum)} ${op}`);
    }
    setCalcOperator(op);
  };

  const handleCalcEquals = () => {
    if (calcOperator && calcFirstOperand !== null) {
      const result = calcCalculate(calcFirstOperand, calcOperator, calcCurNum);
      setCalcCurNum(result);
      setCalcFirstOperand(null);
      setCalcOperator(null);
      setCalcExpression('');
    }
  };

  const handleCalcClear = () => {
    setCalcCurNum('0');
    setCalcFirstOperand(null);
    setCalcOperator(null);
    setCalcExpression('');
  };

  const handleCalcBackspace = () => {
    setCalcCurNum(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleCalcPercent = () => {
    if (calcCurNum !== '0') {
      setCalcCurNum(String(Number(calcCurNum) / 100));
    }
  };

  const handleCalcPlusMinus = () => {
    if (calcCurNum !== '0') {
      setCalcCurNum(String(Number(calcCurNum) * -1));
    }
  };

  const handleCalcCopy = async () => {
    try {
      await navigator.clipboard.writeText(calcCurNum);
    } catch (e) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = calcCurNum;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const currencies = ['KRW', ...selectedCurrencies];

  const themeColor = activeTab === 'unipass' ? 'blue' : 'teal';
  const gradientFrom = activeTab === 'unipass' ? 'from-blue-500' : 'from-teal-500';
  const gradientTo = activeTab === 'unipass' ? 'to-blue-700' : 'to-teal-600';

  return (
    <div className={`flex-1 overflow-auto bg-gradient-to-br ${gradientFrom} ${gradientTo} p-4 lg:p-6`}>
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-6 lg:p-10">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6 border-b-2 border-slate-200">
          <button
            onClick={() => handleTabChange('unipass')}
            className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'unipass'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            <img src="/uni-logo.png" alt="UNIPASS" className="w-5 h-5 object-contain" />
            관세청 (UNIPASS)
          </button>
          <button
            onClick={() => handleTabChange('hana')}
            className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'hana'
                ? 'text-teal-600 border-teal-600'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            <img src="/hana-logo.png" alt="하나은행" className="w-5 h-5 object-contain" />
            하나은행
          </button>
        </div>

        <h1 className="text-xl lg:text-2xl font-bold text-center text-slate-800 mb-6 lg:mb-8">
          {activeTab === 'unipass' ? '수입 환율 계산기 (관세청 - UNIPASS)' : '수출 환율 계산기 (하나은행)'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          {/* Calculator Section */}
          <div className="space-y-5">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* API Status */}
            {apiStatus !== 'idle' && (
              <div className={`p-3 rounded-lg text-sm text-center ${
                apiStatus === 'loading' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                apiStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                apiStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {statusMessage}
              </div>
            )}

            {/* Currency and Amount Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                  통화 선택
                  <button
                    onClick={() => setShowCurrencyModal(true)}
                    className="px-3 py-1 text-white text-xs rounded-md hover:opacity-90 transition-colors font-normal"
                    style={{ backgroundColor: activeTab === 'unipass' ? '#3b82f6' : '#14b8a6' }}
                  >
                    화폐 선택
                  </button>
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="KRW">원 (KRW)</option>
                  {selectedCurrencies.map(code => (
                    <option key={code} value={code}>
                      {getDetailedCurrencyName(code)} ({code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">금액</label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    onBlur={handleAmountBlur}
                    placeholder="금액을 입력하세요"
                    className="w-full px-4 py-3 pr-10 border-2 border-slate-200 rounded-lg text-base focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {amount && (
                    <button
                      onClick={() => setAmount('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-400 text-white rounded-full text-sm font-bold hover:bg-slate-500 transition-colors flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculate}
              className={`w-full py-4 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white font-semibold text-lg rounded-lg hover:-translate-y-0.5 active:translate-y-0 transition-transform shadow-lg`}
            >
              계산하기
            </button>

            {/* Results */}
            {showResult && currentRates && (
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm font-semibold mb-3" style={{ color: activeTab === 'unipass' ? '#3b82f6' : '#14b8a6' }}>환전 결과</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currencies.map(toCurrency => {
                    const conversion = getConversionResult(toCurrency);
                    if (!conversion) return null;

                    return (
                      <div
                        key={toCurrency}
                        className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all"
                      >
                        <div className="text-xs font-semibold mb-2" style={{ color: activeTab === 'unipass' ? '#3b82f6' : '#14b8a6' }}>
                          {getCurrencyName(toCurrency)}
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-2">
                          {getCurrencySymbol(toCurrency)}
                          {conversion.result.toLocaleString('ko-KR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {conversion.rateInfo}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info Message */}
            {activeTab === 'unipass' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-xs text-slate-600 leading-relaxed">
                날짜를 선택하면 자동으로 API에서 기준환율을 불러옵니다.<br />
                불러온 환율은 캐시에 저장되어 다음번에는 즉시 로드됩니다.
              </div>
            )}

            {/* Hana Bank Parsing Logic Info */}
            {activeTab === 'hana' && (
              <div className="bg-teal-50 border-l-4 border-teal-500 p-3 rounded text-xs text-slate-600 leading-relaxed">
                <div className="space-y-1.5">
                  <div>
                    <strong>1. 송금환율:</strong><br />
                    <span className="text-slate-500 ml-2">• 현재환율 탭, 고시회차 최초 기준</span>
                  </div>
                  <div>
                    <strong>2. 대미환산율:</strong><br />
                    <span className="text-slate-500 ml-2">• 전주 월~금 기간평균으로 조회</span>
                  </div>
                  <div>
                    <strong>3. 교차환율:</strong><br />
                    <span className="text-slate-500 ml-2">• EUR → JPY = (EUR/USD) ÷ (JPY/USD)</span><br />
                    <span className="text-slate-500 ml-2">• USD를 기준으로 양측 통화 환산 후 비율 계산</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rate Widget */}
          <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl p-6 text-white lg:sticky lg:top-5`}>
            <div className="text-lg font-bold mb-2 flex items-center gap-2">
              {activeTab === 'unipass' ? '기준환율' : '송금 환율 (하나은행)'}
            </div>
            <div className="text-sm opacity-90 mb-5">
              {currentRates ? date : '날짜를 선택하세요'}
            </div>

            {/* Rate Items */}
            {currentRates && selectedCurrencies.map(code => (
              <div key={code} className="bg-white/15 backdrop-blur-sm p-4 rounded-xl mb-3 last:mb-0">
                <div className="text-sm opacity-90 mb-1">
                  {getCurrencySymbol(code)} {getDetailedCurrencyName(code)} ({code})
                </div>
                <div className="text-2xl font-bold">
                  {currentRates[code]?.toFixed(2) || '-'}
                </div>
                <div className="text-xs opacity-80 mt-1">
                  {activeTab === 'unipass' ? '원' : '원 (송금 보낼 때)'}
                </div>
                {activeTab === 'hana' && currentRates[`${code}_usd`] && (
                  <div className="text-xs opacity-70 mt-1">
                    대미환산율: {currentRates[`${code}_usd`]?.toFixed(4)}
                  </div>
                )}
              </div>
            ))}

            {/* Saved Dates */}
            <div className="mt-4">
              <button
                onClick={() => setShowSavedDates(!showSavedDates)}
                className="w-full py-2 bg-white/20 text-white border border-white/30 rounded-lg text-xs hover:bg-white/30 transition-colors"
              >
                저장된 환율 날짜 보기 ({savedDates.length})
              </button>

              {showSavedDates && savedDates.length > 0 && (
                <div className="mt-2 p-3 bg-white/15 rounded-lg max-h-48 overflow-y-auto">
                  <div className="font-semibold text-xs mb-2">저장된 환율 날짜</div>
                  {savedDates.map(dateStr => (
                    <div
                      key={dateStr}
                      onClick={() => loadSavedDate(dateStr)}
                      className="flex justify-between items-center p-2 mb-1 bg-white/20 rounded cursor-pointer hover:bg-white/30 hover:translate-x-1 transition-all text-xs"
                    >
                      <span>{dateStr}</span>
                      <button
                        onClick={(e) => deleteSavedDate(dateStr, e)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-[10px] hover:bg-red-600 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCurrencyModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">자주 쓰는 화폐 선택</h2>
              <button
                onClick={() => setShowCurrencyModal(false)}
                className="text-slate-400 hover:text-slate-800 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {Object.keys(allCurrencies).length === 0 ? (
              <p className="text-center text-slate-500 py-5">
                날짜를 선택하여 환율을 먼저 불러와주세요
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.keys(allCurrencies).sort().map(code => (
                  <label
                    key={code}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCurrencies.includes(code)}
                      onChange={(e) => handleCurrencySelectionChange(code, e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700">
                      {getDetailedCurrencyName(code)} ({code})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Calculator Button - Toggle on/off */}
      <button
        onClick={() => setShowCalculator(prev => !prev)}
        className={`fixed bottom-6 right-6 px-5 py-3 bg-gradient-to-r ${showCalculator ? 'from-gray-500 to-gray-600' : 'from-orange-500 to-orange-600'} text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all z-[60] flex items-center gap-2`}
      >
        <span>🔢</span> 계산기 (₩)
      </button>


      {/* Calculator Widget - Original Design (Draggable) */}
      {showCalculator && (
        <div
          ref={calcRef}
          className="fixed z-50"
          style={{
            width: '267px',
            ...(() => {
              if (hasBeenDragged) {
                // Check if calculator is outside viewport and reposition if needed
                const calcWidth = 267;
                const calcHeight = 380;
                const margin = 24;
                let x = calcPosition.x;
                let y = calcPosition.y;

                // If outside right edge
                if (x + calcWidth > window.innerWidth) {
                  x = window.innerWidth - calcWidth - margin;
                }
                // If outside left edge
                if (x < 0) {
                  x = margin;
                }
                // If outside bottom edge
                if (y + calcHeight > window.innerHeight) {
                  y = window.innerHeight - calcHeight - margin;
                }
                // If outside top edge
                if (y < 0) {
                  y = margin;
                }

                return { left: `${x}px`, top: `${y}px` };
              } else {
                // Initial position: right side, vertically centered
                return {
                  right: '24px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                };
              }
            })(),
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          <div
            className="flex flex-col p-3 rounded-xl text-white"
            style={{
              background: 'rgba(20, 20, 20, 0.75)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header - Draggable Area */}
            <div
              className="flex gap-2 items-center select-none mb-1 cursor-grab active:cursor-grabbing touch-none"
              onMouseDown={handleCalcMouseDown}
              onTouchStart={handleCalcTouchStart}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 cursor-pointer hover:brightness-110" onClick={(e) => { e.stopPropagation(); setShowCalculator(false); }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs opacity-50 ml-auto">Calculator (드래그하여 이동)</span>
            </div>

            {/* Display */}
            <div className="my-4 px-2.5 py-1.5 bg-white/10 rounded flex flex-col items-end min-h-14">
              <p className="text-sm opacity-70 h-4 w-full text-right overflow-hidden whitespace-nowrap text-ellipsis">{calcExpression}</p>
              <p className="text-2xl font-medium w-full text-right overflow-hidden whitespace-nowrap text-ellipsis">{formatNumberWithCommas(calcCurNum)}</p>
            </div>

            {/* Utility Buttons */}
            <div className="flex justify-end gap-1.5 mb-3">
              <button onClick={handleCalcCopy} className="px-2 py-1 text-xs bg-gray-500 rounded hover:bg-gray-400 transition-colors">📋 Copy</button>
              <button onClick={handleCalcBackspace} className="px-2 py-1 text-xs bg-gray-500 rounded hover:bg-gray-400 transition-colors">←</button>
            </div>

            {/* Calculator Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              <button onClick={handleCalcClear} className="h-10 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-300 active:translate-y-0.5 transition-all">C</button>
              <button onClick={handleCalcPlusMinus} className="h-10 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-300 active:translate-y-0.5 transition-all">+/-</button>
              <button onClick={handleCalcPercent} className="h-10 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-300 active:translate-y-0.5 transition-all">%</button>
              <button onClick={() => handleCalcOperator('/')} className="h-10 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-400 active:translate-y-0.5 transition-all">/</button>

              <button onClick={() => handleCalcDigit('7')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all">7</button>
              <button onClick={() => handleCalcDigit('8')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all">8</button>
              <button onClick={() => handleCalcDigit('9')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all">9</button>
              <button onClick={() => handleCalcOperator('X')} className="h-10 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-400 active:translate-y-0.5 transition-all">X</button>

              <button onClick={() => handleCalcDigit('4')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all">4</button>
              <button onClick={() => handleCalcDigit('5')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all">5</button>
              <button onClick={() => handleCalcDigit('6')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all">6</button>
              <button onClick={() => handleCalcOperator('-')} className="h-10 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-400 active:translate-y-0.5 transition-all">-</button>

              <button onClick={() => handleCalcDigit('1')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all">1</button>
              <button onClick={() => handleCalcDigit('2')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all">2</button>
              <button onClick={() => handleCalcDigit('3')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all">3</button>
              <button onClick={() => handleCalcOperator('+')} className="h-10 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-400 active:translate-y-0.5 transition-all">+</button>

              <button onClick={() => handleCalcDigit('0')} className="h-10 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-100 active:translate-y-0.5 transition-all col-span-2">0</button>
              <button onClick={handleCalcDecimal} className="h-10 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-300 active:translate-y-0.5 transition-all">.</button>
              <button onClick={handleCalcEquals} className="h-10 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-300 active:translate-y-0.5 transition-all">=</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyCalculator;
