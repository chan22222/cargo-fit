import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTodayString, getLocalDateString } from '../lib/date';
import { db } from '../lib/supabase';

// Types
interface ExchangeRate {
  [currencyCode: string]: number;
}

interface CurrencyNames {
  [currencyCode: string]: string;
}

// Constants
const SELECTED_CURRENCIES_KEY = 'selected_currencies';

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

interface CurrencyCalculatorProps {
  leftSideAdSlot?: React.ReactNode;
  rightSideAdSlot?: React.ReactNode;
  bottomAdSlot?: React.ReactNode;
}

const CurrencyCalculator: React.FC<CurrencyCalculatorProps> = ({
  leftSideAdSlot,
  rightSideAdSlot,
  bottomAdSlot,
}) => {
  // Tab state - localStorage에서 초기값 읽기
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('currency_active_tab') as TabType;
    return saved === 'hana' || saved === 'unipass' ? saved : 'unipass';
  });

  // State
  const [date, setDate] = useState<string>(getTodayString());
  const [currentRates, setCurrentRates] = useState<ExchangeRate | null>(null);
  const [allCurrencies, setAllCurrencies] = useState<CurrencyNames>({});
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['USD', 'EUR', 'CHF']);
  const [fromCurrency, setFromCurrency] = useState<string>('KRW');
  const [amount, setAmount] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<ApiStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState<boolean>(false);
  const [currencySearch, setCurrencySearch] = useState<string>('');

  // Calculator state
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcCurNum, setCalcCurNum] = useState<string>('0');
  const [calcFirstOperand, setCalcFirstOperand] = useState<string | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcExpression, setCalcExpression] = useState<string>('');
  const calcRef = useRef<HTMLDivElement>(null);

  // Status timeout ref
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Draggable calculator state
  const [calcPosition, setCalcPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState<boolean>(false);

  // Tooltip state for calculator shortcut
  const [showCalcTooltip, setShowCalcTooltip] = useState<boolean>(false);

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
    // allCurrencies와 activeTab은 Supabase/useState에서 처리
  }, []);

  // Keyboard event for calculator toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '\\') {
        e.preventDefault();
        setShowCalculator(prev => !prev);
        setShowCalcTooltip(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show tooltip for 3 seconds on mount
  useEffect(() => {
    setShowCalcTooltip(true);
    const timer = setTimeout(() => {
      setShowCalcTooltip(false);
    }, 3000);
    return () => clearTimeout(timer);
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

  // Fetch rates when date or tab changes
  useEffect(() => {
    if (date) {
      fetchRatesOnDateChange();
    }
  }, [date, activeTab]);

  const showStatus = (type: ApiStatus, message: string) => {
    // Clear any existing timeout to prevent it from overwriting new status
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }

    setApiStatus(type);
    setStatusMessage(message);

    if (type === 'success' || type === 'cached') {
      statusTimeoutRef.current = setTimeout(() => {
        setApiStatus('idle');
        setStatusMessage('');
        statusTimeoutRef.current = null;
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
  const processUnipassData = (jsonData: any, dateStr: string, saveToSupabase: boolean = false): boolean => {
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
      // Save to Supabase for future requests
      if (saveToSupabase) {
        db.exchangeRates.save('unipass', dateStr, rates, currencyNames);
      }

      setAllCurrencies(currencyNames);
      setCurrentRates(rates);

      showStatus('success', `환율 데이터를 불러왔습니다 (${Object.keys(rates).length}개 통화)`);

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

    // Sort by keyword length (longest first) to avoid partial matches (e.g., "인도" matching "인도네시아")
    const sortedEntries = Object.entries(mapping).sort((a, b) => b[0].length - a[0].length);
    for (const [keyword, code] of sortedEntries) {
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

  // Currencies that Hana Bank displays in 100-unit basis (e.g., 100 JPY = 957.88 KRW)
  const HANA_100_UNIT_CURRENCIES = ['JPY', 'IDR', 'VND'];

  // Currencies with very low exchange rates that need 4 decimal places
  const LOW_RATE_CURRENCIES = ['IDR', 'VND', 'KHR', 'COP', 'UZS', 'LAK', 'MMK', 'MNT', 'KZT', 'HUF', 'CLP'];

  const processHanaData = (mall1501Html: string, mall1502Html: string, dateStr: string, saveToSupabase: boolean = false): boolean => {
    const sendingResult = extractRatesFromHtml(mall1501Html, 'rate');
    const usdResult = extractRatesFromHtml(mall1502Html, 'usd');

    // 송금환율과 대미환산율 둘 다 필요
    if (!sendingResult.data.USD || !usdResult.data.USD) {
      return false;
    }

    const rates: ExchangeRate = {};
    const combinedCurrencyNames = { ...sendingResult.currencyNames, ...usdResult.currencyNames };

    // 송금환율 추가
    for (const [code, rate] of Object.entries(sendingResult.data)) {
      if (HANA_100_UNIT_CURRENCIES.includes(code)) {
        rates[code] = rate / 100;
      } else {
        rates[code] = rate;
      }
    }

    // 대미환산율 추가
    for (const [code, rate] of Object.entries(usdResult.data)) {
      if (HANA_100_UNIT_CURRENCIES.includes(code)) {
        rates[`${code}_usd`] = rate / 100;
      } else {
        rates[`${code}_usd`] = rate;
      }
    }

    // Save to Supabase for future requests
    if (saveToSupabase) {
      db.exchangeRates.save('hanabank', dateStr, rates, combinedCurrencyNames).catch(() => {});
    }

    setAllCurrencies(combinedCurrencyNames);
    setCurrentRates(rates);

    showStatus('success', '하나은행 환율 데이터를 불러왔습니다');

    return true;
  };

  const fetchRatesOnDateChange = async () => {
    if (!date) return;

    if (activeTab === 'unipass') {
      await fetchUnipassRates(date);
    } else {
      await fetchHanaRates(date);
    }
  };

  const fetchUnipassRates = async (dateStr: string) => {
    showStatus('loading', '환율 데이터를 불러오는 중...');

    // 1. Try Supabase cache first
    try {
      const { data: cached } = await db.exchangeRates.getByDateAndSource(dateStr, 'unipass');
      if (cached && cached.rates && Object.keys(cached.rates).length > 0) {
        setAllCurrencies(cached.currency_names || {});
        setCurrentRates(cached.rates);
        showStatus('success', `캐시된 환율 데이터 (${Object.keys(cached.rates).length}개 통화)`);
        return;
      }
    } catch (e) {
      // Continue to external API
    }

    // 2. Fetch from external API
    const unipassUrl = `https://unipass.customs.go.kr/csp/myc/bsopspptinfo/dclrSpptInfo/WeekFxrtQryCtr/retrieveWeekFxrt.do?pageIndex=1&pageUnit=100&aplyDt=${dateStr}&weekFxrtTpcd=2&_=${Date.now()}`;

    const proxyUrls = [
      `https://pr.refra2n-511.workers.dev/?url=${encodeURIComponent(unipassUrl)}`,
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
          if (processUnipassData(jsonData, dateStr, true)) {
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

    const formatDate = (d: Date) => getLocalDateString(d);

    return {
      start: formatDate(lastMonday),
      end: formatDate(lastFriday)
    };
  };

  const fetchHanaRates = async (dateStr: string) => {
    showStatus('loading', '하나은행에서 환율 데이터를 불러오는 중...');

    // 1. Try Supabase cache first
    let cachedRates: ExchangeRate | null = null;
    let cachedCurrencyNames: CurrencyNames = {};
    let needMall1501 = true;
    let needMall1502 = true;

    try {
      const { data: cached } = await db.exchangeRates.getByDateAndSource(dateStr, 'hanabank');
      if (cached && cached.rates && Object.keys(cached.rates).length > 0) {
        cachedRates = cached.rates;
        cachedCurrencyNames = cached.currency_names || {};

        // 송금환율 있는지 확인
        if (cached.rates.USD) {
          needMall1501 = false;
        }
        // 대미환산율 있는지 확인
        if (cached.rates.USD_usd) {
          needMall1502 = false;
        }

        // 둘 다 있으면 캐시 사용
        if (!needMall1501 && !needMall1502) {
          setAllCurrencies(cachedCurrencyNames);
          setCurrentRates(cachedRates);
          showStatus('success', `캐시된 하나은행 환율 데이터`);
          return;
        }
      }
    } catch (e) {
      // Continue to external API
    }

    // 2. Fetch from external API
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

    const proxyBases = [
      'https://pr.refra2n-511.workers.dev/?url=',
      'https://corsproxy.io/?url=',
      'https://api.allorigins.win/raw?url='
    ];

    // 송금환율 필요하면 호출
    if (needMall1501) {
      for (const proxyBase of proxyBases) {
        try {
          const proxyUrl = proxyBase + encodeURIComponent(mall1501Url);
          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    }

    // 대미환산율 필요하면 호출
    if (needMall1502) {
      for (const proxyBase of proxyBases) {
        try {
          const proxyUrl = proxyBase + encodeURIComponent(mall1502Url);
          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    }

    // 데이터 병합
    const rates: ExchangeRate = cachedRates ? { ...cachedRates } : {};
    let currencyNames: CurrencyNames = { ...cachedCurrencyNames };

    // 새로 가져온 송금환율 처리
    if (mall1501Html) {
      const sendingResult = extractRatesFromHtml(mall1501Html, 'rate');
      for (const [code, rate] of Object.entries(sendingResult.data)) {
        if (HANA_100_UNIT_CURRENCIES.includes(code)) {
          rates[code] = rate / 100;
        } else {
          rates[code] = rate;
        }
      }
      currencyNames = { ...currencyNames, ...sendingResult.currencyNames };
    }

    // 새로 가져온 대미환산율 처리
    if (mall1502Html) {
      const usdResult = extractRatesFromHtml(mall1502Html, 'usd');
      for (const [code, rate] of Object.entries(usdResult.data)) {
        if (HANA_100_UNIT_CURRENCIES.includes(code)) {
          rates[`${code}_usd`] = rate / 100;
        } else {
          rates[`${code}_usd`] = rate;
        }
      }
      currencyNames = { ...currencyNames, ...usdResult.currencyNames };
    }

    // 최소한 송금환율(USD)이 있어야 함
    if (!rates.USD) {
      showStatus('error', '하나은행 환율 데이터를 불러올 수 없습니다. (CORS 제한 또는 데이터 없음)');
      return;
    }

    // Supabase에 저장
    db.exchangeRates.save('hanabank', dateStr, rates, currencyNames);

    setAllCurrencies(currencyNames);
    setCurrentRates(rates);

    // 대미환산율 없으면 경고 메시지
    if (!rates.USD_usd) {
      showStatus('success', '하나은행 송금환율 로드 (대미환산율 미포함)');
    } else {
      showStatus('success', '하나은행 환율 데이터를 불러왔습니다');
    }
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
          // Use 6 decimal places for 100-unit currencies (JPY, IDR, VND)
          const decimals = HANA_100_UNIT_CURRENCIES.includes(fromCurrency) ? 6 : 4;
          rateInfo = `교차환율: 1 ${fromCurrency} = ${fromUsdRate.toFixed(decimals)} USD`;
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

  const handleTabChange = (tab: TabType) => {
    // Ignore if same tab is clicked
    if (tab === activeTab) return;

    // 먼저 로딩 상태로 변경하고 이전 데이터 초기화
    setApiStatus('loading');
    setStatusMessage('환율 데이터를 불러오는 중...');
    setCurrentRates(null);
    setShowResult(false);

    // 탭 변경 (useEffect가 트리거됨)
    setActiveTab(tab);
    localStorage.setItem('currency_active_tab', tab);
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

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">환율 계산기</h1>
                <p className="text-slate-400 text-xs">실시간 환율 정보</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="inline-flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => handleTabChange('unipass')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'unipass'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <img src="/uni-logo.png" alt="UNIPASS" className="w-4 h-4 object-contain" />
                <span className="hidden sm:inline">관세청</span> UNIPASS
              </button>
              <button
                onClick={() => handleTabChange('hana')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'hana'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <img src="/hana-logo.png" alt="하나은행" className="w-4 h-4 object-contain" />
                하나은행
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Side Rails */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Side Rail Ad - Desktop Only */}
          {leftSideAdSlot && (
            <div className="hidden xl:block w-[160px] shrink-0">
              <div className="sticky top-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {leftSideAdSlot}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Calculator Section */}
          <div className="space-y-6">
            {/* Input Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              {/* Source Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeTab === 'unipass' ? 'bg-blue-500' : 'bg-teal-500'}`}></div>
                  <span className="text-xs font-medium text-slate-500">
                    {activeTab === 'unipass' ? '관세청 UNIPASS 기준환율' : '하나은행 송금환율'}
                  </span>
                </div>
                <button
                  onClick={() => setShowCurrencyModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <span>화폐 설정</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Date Input */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">기준 날짜</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* API Status */}
              {apiStatus !== 'idle' && (
                <div className={`px-4 py-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                  apiStatus === 'loading' ? 'bg-amber-50 text-amber-600' :
                  apiStatus === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  apiStatus === 'error' ? 'bg-red-50 text-red-500' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {apiStatus === 'loading' && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {statusMessage}
                </div>
              )}

              {/* Currency and Amount Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">변환할 통화</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
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
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">금액</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      onBlur={handleAmountBlur}
                      placeholder="0.00"
                      className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    {amount && (
                      <button
                        onClick={() => setAmount('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-300 text-white rounded-full text-xs hover:bg-slate-400 transition-colors flex items-center justify-center"
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
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
              >
                계산하기
              </button>
            </div>

            {/* Results */}
            {showResult && currentRates && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-slate-700">환전 결과</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currencies.map(toCurrency => {
                    const conversion = getConversionResult(toCurrency);
                    if (!conversion) return null;

                    return (
                      <div
                        key={toCurrency}
                        className="group bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-default"
                      >
                        <div className="text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                          {getCurrencyName(toCurrency)}
                        </div>
                        <div className="text-lg font-bold text-slate-800 mb-1">
                          <span className="text-slate-400 font-normal mr-0.5">{getCurrencySymbol(toCurrency)}</span>
                          {conversion.result.toLocaleString('ko-KR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {conversion.rateInfo}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Info Message */}
            <div className={`rounded-xl p-4 text-xs leading-relaxed ${activeTab === 'unipass' ? 'bg-slate-50 text-slate-500' : 'bg-slate-50 text-slate-500'}`}>
              {activeTab === 'unipass' ? (
                <p>날짜를 선택하면 자동으로 관세청 UNIPASS에서 기준환율을 불러옵니다. 불러온 환율은 캐시에 저장되어 다음번에는 즉시 로드됩니다.</p>
              ) : (
                <div className="space-y-1">
                  <p><span className="font-medium text-slate-600">송금환율:</span> 현재환율 탭, 고시회차 최초 기준</p>
                  <p><span className="font-medium text-slate-600">대미환산율:</span> 전주 월~금 기간평균으로 조회</p>
                  <p><span className="font-medium text-slate-600">교차환율:</span> USD 기준으로 양측 통화 환산 후 비율 계산</p>
                </div>
              )}
            </div>

            {/* Bottom Multiplex Ad - Below Info Message */}
            {bottomAdSlot && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mt-6">
                {bottomAdSlot}
              </div>
            )}
          </div>

          {/* Rate Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm lg:sticky lg:top-5 overflow-hidden">
            {/* Widget Header */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-700">
                    {activeTab === 'unipass' ? '기준환율' : '송금 환율'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {currentRates ? date : '날짜를 선택하세요'}
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${activeTab === 'unipass' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-teal-500 to-teal-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Rate Items */}
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {currentRates && selectedCurrencies.map(code => (
                <div key={code} className="flex items-center justify-between py-3 px-3 bg-slate-50/80 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {code.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-700">{code}</div>
                      <div className="text-[10px] text-slate-400">{getDetailedCurrencyName(code)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">
                      {currentRates[code]?.toLocaleString('ko-KR', {
                        minimumFractionDigits: LOW_RATE_CURRENCIES.includes(code) ? 4 : 2,
                        maximumFractionDigits: LOW_RATE_CURRENCIES.includes(code) ? 4 : 2
                      }) || '-'}
                    </div>
                    {activeTab === 'hana' && currentRates[`${code}_usd`] && (
                      <div className="text-[10px] text-slate-400">
                        USD: {currentRates[`${code}_usd`]?.toFixed(HANA_100_UNIT_CURRENCIES.includes(code) ? 6 : 4)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!currentRates && (
                <div className="text-center py-10 text-slate-300">
                  <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-slate-400">
                    날짜를 선택하여<br />환율을 불러오세요
                  </p>
                </div>
              )}
            </div>
          </div>
              </div>
            </div>
          </div>

          {/* Right Side Rail Ad - Desktop Only */}
          {rightSideAdSlot && (
            <div className="hidden xl:block w-[160px] shrink-0">
              <div className="sticky top-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {rightSideAdSlot}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setShowCurrencyModal(false); setCurrencySearch(''); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-800">화폐 선택</h2>
                <p className="text-xs text-slate-400 mt-0.5">계산에 사용할 통화를 선택하세요</p>
              </div>
              <button
                onClick={() => { setShowCurrencyModal(false); setCurrencySearch(''); }}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 pt-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  placeholder="통화명 또는 코드 검색 (예: 달러, USD)"
                  className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  autoFocus
                />
                {currencySearch && (
                  <button
                    onClick={() => setCurrencySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-300 text-white rounded-full text-[10px] hover:bg-slate-400 transition-colors flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-130px)] min-h-[300px]">
              {Object.keys(allCurrencies).length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-400 text-sm">
                    날짜를 선택하여<br />환율을 먼저 불러와주세요
                  </p>
                </div>
              ) : (() => {
                const popularCurrencies = ['USD', 'EUR', 'JPY', 'CNY', 'GBP', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD', 'THB', 'VND', 'TWD', 'IDR', 'MYR', 'PHP', 'INR'];
                const filteredCurrencies = Object.keys(allCurrencies)
                  .filter(code => {
                    if (!currencySearch) return true;
                    const search = currencySearch.toLowerCase();
                    const name = getDetailedCurrencyName(code).toLowerCase();
                    return code.toLowerCase().includes(search) || name.includes(search);
                  });

                // Sort: popular currencies first, then alphabetically
                const sortedCurrencies = filteredCurrencies.sort((a, b) => {
                  const aPopular = popularCurrencies.indexOf(a);
                  const bPopular = popularCurrencies.indexOf(b);
                  if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
                  if (aPopular !== -1) return -1;
                  if (bPopular !== -1) return 1;
                  return a.localeCompare(b);
                });

                if (sortedCurrencies.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <svg className="w-10 h-10 mx-auto mb-2 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-slate-400 text-sm">검색 결과가 없습니다</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-1">
                    {sortedCurrencies.map((code, index) => (
                      <React.Fragment key={code}>
                        {/* Divider after popular currencies */}
                        {!currencySearch && index === popularCurrencies.filter(c => allCurrencies[c]).length && (
                          <div className="border-t border-slate-200 my-2 pt-2">
                            <span className="text-[10px] text-slate-400 px-3">기타 통화</span>
                          </div>
                        )}
                        <label
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                            selectedCurrencies.includes(code)
                              ? 'bg-blue-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedCurrencies.includes(code)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-slate-300'
                          }`}>
                            {selectedCurrencies.includes(code) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedCurrencies.includes(code)}
                            onChange={(e) => handleCurrencySelectionChange(code, e.target.checked)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-bold text-slate-500 w-10">{code}</span>
                            <span className={`text-sm ${selectedCurrencies.includes(code) ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                              {getDetailedCurrencyName(code)}
                            </span>
                          </div>
                        </label>
                      </React.Fragment>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Floating Calculator Button - Toggle on/off */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2">
        {/* Tooltip - shows for 3 seconds on mount */}
        <div
          className={`relative bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg transition-all duration-500 ${
            showCalcTooltip && !showCalculator
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <span>₩ 키를 눌러보세요</span>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-800 rotate-45"></div>
        </div>
        <button
          onClick={() => setShowCalculator(prev => !prev)}
          className={`pl-4 pr-3 py-2.5 ${showCalculator ? 'bg-slate-600 hover:bg-slate-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5`}
        >
          <span>{showCalculator ? '닫기' : '계산기'}</span>
          <kbd className="inline-flex items-center justify-center w-7 h-7 bg-white/20 rounded-md text-sm font-bold">₩</kbd>
        </button>
      </div>


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
