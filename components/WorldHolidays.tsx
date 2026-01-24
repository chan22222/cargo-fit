import React, { useState, useMemo, useEffect } from 'react';
import { getTodayString } from '../lib/date';

interface WorldHolidaysProps {
  leftSideAdSlot?: React.ReactNode;
  rightSideAdSlot?: React.ReactNode;
}

interface Holiday {
  date: string; // YYYY-MM-DD
  name: string; // 모국어
  nameKr: string; // 한국어
  nameEn: string; // 영어
  country: string;
  countryCode: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
  region: 'asia' | 'europe' | 'america' | 'oceania' | 'middle-east' | 'africa';
}

const REGIONS: { id: Country['region']; name: string }[] = [
  { id: 'asia', name: '아시아' },
  { id: 'europe', name: '유럽' },
  { id: 'america', name: '아메리카' },
  { id: 'oceania', name: '오세아니아' },
  { id: 'middle-east', name: '중동' },
  { id: 'africa', name: '아프리카' },
];

// 공휴일 규칙 타입
type HolidayRule =
  | { type: 'fixed'; month: number; day: number } // 고정 날짜
  | { type: 'nthWeekday'; month: number; nth: number; weekday: number } // n번째 요일 (weekday: 0=일, 1=월...)
  | { type: 'lastWeekday'; month: number; weekday: number } // 마지막 요일
  | { type: 'lunar'; month: number; day: number; offset?: number } // 음력
  | { type: 'easter'; offset: number } // 부활절 기준
  | { type: 'islamic'; month: number; day: number }; // 이슬람력 (대략적)

interface HolidayDef {
  rule: HolidayRule;
  name: string;
  nameKr: string;
  nameEn: string;
  country: string;
  countryCode: string;
}

const COUNTRIES: Country[] = [
  // 아시아
  { code: 'KR', name: '한국', flag: '🇰🇷', region: 'asia' },
  { code: 'CN', name: '중국', flag: '🇨🇳', region: 'asia' },
  { code: 'JP', name: '일본', flag: '🇯🇵', region: 'asia' },
  { code: 'TW', name: '대만', flag: '🇹🇼', region: 'asia' },
  { code: 'HK', name: '홍콩', flag: '🇭🇰', region: 'asia' },
  { code: 'VN', name: '베트남', flag: '🇻🇳', region: 'asia' },
  { code: 'TH', name: '태국', flag: '🇹🇭', region: 'asia' },
  { code: 'SG', name: '싱가포르', flag: '🇸🇬', region: 'asia' },
  { code: 'MY', name: '말레이시아', flag: '🇲🇾', region: 'asia' },
  { code: 'ID', name: '인도네시아', flag: '🇮🇩', region: 'asia' },
  { code: 'PH', name: '필리핀', flag: '🇵🇭', region: 'asia' },
  { code: 'IN', name: '인도', flag: '🇮🇳', region: 'asia' },
  { code: 'BD', name: '방글라데시', flag: '🇧🇩', region: 'asia' },
  { code: 'PK', name: '파키스탄', flag: '🇵🇰', region: 'asia' },
  { code: 'LK', name: '스리랑카', flag: '🇱🇰', region: 'asia' },
  { code: 'MM', name: '미얀마', flag: '🇲🇲', region: 'asia' },
  { code: 'KH', name: '캄보디아', flag: '🇰🇭', region: 'asia' },
  { code: 'LA', name: '라오스', flag: '🇱🇦', region: 'asia' },
  // 유럽
  { code: 'DE', name: '독일', flag: '🇩🇪', region: 'europe' },
  { code: 'GB', name: '영국', flag: '🇬🇧', region: 'europe' },
  { code: 'FR', name: '프랑스', flag: '🇫🇷', region: 'europe' },
  { code: 'IT', name: '이탈리아', flag: '🇮🇹', region: 'europe' },
  { code: 'ES', name: '스페인', flag: '🇪🇸', region: 'europe' },
  { code: 'NL', name: '네덜란드', flag: '🇳🇱', region: 'europe' },
  { code: 'PL', name: '폴란드', flag: '🇵🇱', region: 'europe' },
  { code: 'TR', name: '튀르키예', flag: '🇹🇷', region: 'europe' },
  { code: 'RU', name: '러시아', flag: '🇷🇺', region: 'europe' },
  { code: 'CH', name: '스위스', flag: '🇨🇭', region: 'europe' },
  { code: 'BE', name: '벨기에', flag: '🇧🇪', region: 'europe' },
  { code: 'AT', name: '오스트리아', flag: '🇦🇹', region: 'europe' },
  { code: 'SE', name: '스웨덴', flag: '🇸🇪', region: 'europe' },
  { code: 'NO', name: '노르웨이', flag: '🇳🇴', region: 'europe' },
  { code: 'DK', name: '덴마크', flag: '🇩🇰', region: 'europe' },
  { code: 'FI', name: '핀란드', flag: '🇫🇮', region: 'europe' },
  { code: 'PT', name: '포르투갈', flag: '🇵🇹', region: 'europe' },
  { code: 'GR', name: '그리스', flag: '🇬🇷', region: 'europe' },
  { code: 'CZ', name: '체코', flag: '🇨🇿', region: 'europe' },
  { code: 'HU', name: '헝가리', flag: '🇭🇺', region: 'europe' },
  { code: 'IE', name: '아일랜드', flag: '🇮🇪', region: 'europe' },
  // 아메리카
  { code: 'US', name: '미국', flag: '🇺🇸', region: 'america' },
  { code: 'CA', name: '캐나다', flag: '🇨🇦', region: 'america' },
  { code: 'MX', name: '멕시코', flag: '🇲🇽', region: 'america' },
  { code: 'BR', name: '브라질', flag: '🇧🇷', region: 'america' },
  { code: 'AR', name: '아르헨티나', flag: '🇦🇷', region: 'america' },
  { code: 'CL', name: '칠레', flag: '🇨🇱', region: 'america' },
  { code: 'CO', name: '콜롬비아', flag: '🇨🇴', region: 'america' },
  { code: 'PE', name: '페루', flag: '🇵🇪', region: 'america' },
  // 오세아니아
  { code: 'AU', name: '호주', flag: '🇦🇺', region: 'oceania' },
  { code: 'NZ', name: '뉴질랜드', flag: '🇳🇿', region: 'oceania' },
  // 중동
  { code: 'AE', name: 'UAE', flag: '🇦🇪', region: 'middle-east' },
  { code: 'SA', name: '사우디', flag: '🇸🇦', region: 'middle-east' },
  { code: 'IL', name: '이스라엘', flag: '🇮🇱', region: 'middle-east' },
  { code: 'QA', name: '카타르', flag: '🇶🇦', region: 'middle-east' },
  { code: 'KW', name: '쿠웨이트', flag: '🇰🇼', region: 'middle-east' },
  // 아프리카
  { code: 'ZA', name: '남아공', flag: '🇿🇦', region: 'africa' },
  { code: 'EG', name: '이집트', flag: '🇪🇬', region: 'africa' },
  { code: 'NG', name: '나이지리아', flag: '🇳🇬', region: 'africa' },
  { code: 'KE', name: '케냐', flag: '🇰🇪', region: 'africa' },
];

// ========== 음력 변환 함수 ==========
// 음력 데이터 (1900-2100년)
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
];

// 해당 년도의 총 일수
function getLunarYearDays(year: number): number {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[year - 1900] & i) ? 1 : 0;
  }
  return sum + getLeapDays(year);
}

// 윤달의 일수
function getLeapDays(year: number): number {
  if (getLeapMonth(year)) {
    return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

// 윤달이 몇 월인지 (0이면 윤달 없음)
function getLeapMonth(year: number): number {
  return LUNAR_INFO[year - 1900] & 0xf;
}

// 해당 년월의 일수
function getLunarMonthDays(year: number, month: number): number {
  return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

// 음력 → 양력 변환
function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number): Date {
  let offset = 0;

  // 1900년 1월 31일이 음력 1900년 1월 1일
  for (let y = 1900; y < lunarYear; y++) {
    offset += getLunarYearDays(y);
  }

  const leapMonth = getLeapMonth(lunarYear);
  let isLeapMonth = false;

  for (let m = 1; m < lunarMonth; m++) {
    if (leapMonth > 0 && m === leapMonth + 1 && !isLeapMonth) {
      --m;
      isLeapMonth = true;
      offset += getLeapDays(lunarYear);
    } else {
      offset += getLunarMonthDays(lunarYear, m);
    }
    if (isLeapMonth && m === leapMonth + 1) isLeapMonth = false;
  }

  offset += lunarDay - 1;

  // 1900년 1월 31일 기준
  const baseDate = new Date(1900, 0, 31);
  return new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
}

// ========== 부활절 계산 (Anonymous Gregorian algorithm) ==========
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

// ========== N번째 요일 계산 ==========
function getNthWeekdayOfMonth(year: number, month: number, nth: number, weekday: number): Date {
  const firstDay = new Date(year, month - 1, 1);
  const firstWeekday = firstDay.getDay();
  let day = 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
  return new Date(year, month - 1, day);
}

// 마지막 요일 계산
function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month, 0);
  const lastWeekday = lastDay.getDay();
  const diff = (lastWeekday - weekday + 7) % 7;
  return new Date(year, month - 1, lastDay.getDate() - diff);
}

// ========== 이슬람력 → 양력 변환 (근사치) ==========
function islamicToGregorian(year: number, islamicMonth: number, islamicDay: number): Date {
  // 이슬람력은 매년 약 11일씩 앞당겨짐
  // 이것은 근사 계산이며, 실제로는 달 관측에 따라 1-2일 차이가 있을 수 있음
  const islamicEpoch = 1948439.5; // Julian day of Islamic epoch
  const jd = Math.floor((11 * year + 3) / 30) + 354 * year + 30 * islamicMonth
           - Math.floor((islamicMonth - 1) / 2) + islamicDay + islamicEpoch - 385;

  // Julian day to Gregorian
  const z = Math.floor(jd + 0.5);
  const a = Math.floor((z - 1867216.25) / 36524.25);
  const aa = z + 1 + a - Math.floor(a / 4);
  const b = aa + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const gregorianYear = month > 2 ? c - 4716 : c - 4715;

  return new Date(gregorianYear, month - 1, day);
}

// 특정 연도의 이슬람력 연도 계산 (근사)
function getIslamicYear(gregorianYear: number): number {
  return Math.floor((gregorianYear - 622) * 33 / 32) + 1;
}

// ========== 공휴일 규칙 정의 ==========
const HOLIDAY_RULES: HolidayDef[] = [
  // ===== 한국 🇰🇷 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: '신정', nameKr: '신정', nameEn: "New Year's Day", country: '한국', countryCode: 'KR' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: -1 }, name: '설날 연휴', nameKr: '설날 연휴', nameEn: 'Lunar New Year', country: '한국', countryCode: 'KR' },
  { rule: { type: 'lunar', month: 1, day: 1 }, name: '설날', nameKr: '설날', nameEn: 'Lunar New Year', country: '한국', countryCode: 'KR' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 1 }, name: '설날 연휴', nameKr: '설날 연휴', nameEn: 'Lunar New Year', country: '한국', countryCode: 'KR' },
  { rule: { type: 'fixed', month: 3, day: 1 }, name: '삼일절', nameKr: '삼일절', nameEn: 'Independence Movement Day', country: '한국', countryCode: 'KR' },
  { rule: { type: 'lunar', month: 4, day: 8 }, name: '부처님오신날', nameKr: '부처님오신날', nameEn: "Buddha's Birthday", country: '한국', countryCode: 'KR' },
  { rule: { type: 'fixed', month: 5, day: 5 }, name: '어린이날', nameKr: '어린이날', nameEn: "Children's Day", country: '한국', countryCode: 'KR' },
  { rule: { type: 'fixed', month: 6, day: 6 }, name: '현충일', nameKr: '현충일', nameEn: 'Memorial Day', country: '한국', countryCode: 'KR' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: '광복절', nameKr: '광복절', nameEn: 'Liberation Day', country: '한국', countryCode: 'KR' },
  { rule: { type: 'fixed', month: 10, day: 3 }, name: '개천절', nameKr: '개천절', nameEn: 'National Foundation Day', country: '한국', countryCode: 'KR' },
  { rule: { type: 'lunar', month: 8, day: 15, offset: -1 }, name: '추석 연휴', nameKr: '추석 연휴', nameEn: 'Chuseok', country: '한국', countryCode: 'KR' },
  { rule: { type: 'lunar', month: 8, day: 15 }, name: '추석', nameKr: '추석', nameEn: 'Chuseok', country: '한국', countryCode: 'KR' },
  { rule: { type: 'lunar', month: 8, day: 15, offset: 1 }, name: '추석 연휴', nameKr: '추석 연휴', nameEn: 'Chuseok', country: '한국', countryCode: 'KR' },
  { rule: { type: 'fixed', month: 10, day: 9 }, name: '한글날', nameKr: '한글날', nameEn: 'Hangul Day', country: '한국', countryCode: 'KR' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: '크리스마스', nameKr: '크리스마스', nameEn: 'Christmas', country: '한국', countryCode: 'KR' },

  // ===== 중국 🇨🇳 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: '元旦', nameKr: '신정', nameEn: "New Year's Day", country: '중국', countryCode: 'CN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: -1 }, name: '春节', nameKr: '춘절', nameEn: 'Chinese New Year', country: '중국', countryCode: 'CN' },
  { rule: { type: 'lunar', month: 1, day: 1 }, name: '春节', nameKr: '춘절', nameEn: 'Chinese New Year', country: '중국', countryCode: 'CN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 1 }, name: '春节', nameKr: '춘절', nameEn: 'Chinese New Year', country: '중국', countryCode: 'CN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 2 }, name: '春节', nameKr: '춘절', nameEn: 'Chinese New Year', country: '중국', countryCode: 'CN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 3 }, name: '春节', nameKr: '춘절', nameEn: 'Chinese New Year', country: '중국', countryCode: 'CN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 4 }, name: '春节', nameKr: '춘절', nameEn: 'Chinese New Year', country: '중국', countryCode: 'CN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 5 }, name: '春节', nameKr: '춘절', nameEn: 'Chinese New Year', country: '중국', countryCode: 'CN' },
  { rule: { type: 'fixed', month: 4, day: 5 }, name: '清明节', nameKr: '청명절', nameEn: 'Qingming Festival', country: '중국', countryCode: 'CN' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: '劳动节', nameKr: '노동절', nameEn: 'Labour Day', country: '중국', countryCode: 'CN' },
  { rule: { type: 'lunar', month: 5, day: 5 }, name: '端午节', nameKr: '단오절', nameEn: 'Dragon Boat Festival', country: '중국', countryCode: 'CN' },
  { rule: { type: 'lunar', month: 8, day: 15 }, name: '中秋节', nameKr: '중추절', nameEn: 'Mid-Autumn Festival', country: '중국', countryCode: 'CN' },
  { rule: { type: 'fixed', month: 10, day: 1 }, name: '国庆节', nameKr: '국경절', nameEn: 'National Day', country: '중국', countryCode: 'CN' },
  { rule: { type: 'fixed', month: 10, day: 2 }, name: '国庆节', nameKr: '국경절', nameEn: 'National Day', country: '중국', countryCode: 'CN' },
  { rule: { type: 'fixed', month: 10, day: 3 }, name: '国庆节', nameKr: '국경절', nameEn: 'National Day', country: '중국', countryCode: 'CN' },

  // ===== 일본 🇯🇵 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: '元日', nameKr: '신정', nameEn: "New Year's Day", country: '일본', countryCode: 'JP' },
  { rule: { type: 'nthWeekday', month: 1, nth: 2, weekday: 1 }, name: '成人の日', nameKr: '성인의 날', nameEn: 'Coming of Age Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 2, day: 11 }, name: '建国記念の日', nameKr: '건국기념일', nameEn: 'National Foundation Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 2, day: 23 }, name: '天皇誕生日', nameKr: '천황 생일', nameEn: "Emperor's Birthday", country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 3, day: 20 }, name: '春分の日', nameKr: '춘분의 날', nameEn: 'Vernal Equinox Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 4, day: 29 }, name: '昭和の日', nameKr: '쇼와의 날', nameEn: 'Showa Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 5, day: 3 }, name: '憲法記念日', nameKr: '헌법기념일', nameEn: 'Constitution Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 5, day: 4 }, name: 'みどりの日', nameKr: '녹색의 날', nameEn: 'Greenery Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 5, day: 5 }, name: 'こどもの日', nameKr: '어린이날', nameEn: "Children's Day", country: '일본', countryCode: 'JP' },
  { rule: { type: 'nthWeekday', month: 7, nth: 3, weekday: 1 }, name: '海の日', nameKr: '바다의 날', nameEn: 'Marine Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 8, day: 11 }, name: '山の日', nameKr: '산의 날', nameEn: 'Mountain Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'nthWeekday', month: 9, nth: 3, weekday: 1 }, name: '敬老の日', nameKr: '경로의 날', nameEn: 'Respect for the Aged Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 9, day: 23 }, name: '秋分の日', nameKr: '추분의 날', nameEn: 'Autumnal Equinox Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'nthWeekday', month: 10, nth: 2, weekday: 1 }, name: 'スポーツの日', nameKr: '스포츠의 날', nameEn: 'Sports Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 11, day: 3 }, name: '文化の日', nameKr: '문화의 날', nameEn: 'Culture Day', country: '일본', countryCode: 'JP' },
  { rule: { type: 'fixed', month: 11, day: 23 }, name: '勤労感謝の日', nameKr: '근로감사의 날', nameEn: 'Labour Thanksgiving Day', country: '일본', countryCode: 'JP' },

  // ===== 미국 🇺🇸 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '미국', countryCode: 'US' },
  { rule: { type: 'nthWeekday', month: 1, nth: 3, weekday: 1 }, name: 'MLK Day', nameKr: '마틴 루터 킹의 날', nameEn: 'Martin Luther King Jr. Day', country: '미국', countryCode: 'US' },
  { rule: { type: 'nthWeekday', month: 2, nth: 3, weekday: 1 }, name: "Presidents' Day", nameKr: '대통령의 날', nameEn: "Presidents' Day", country: '미국', countryCode: 'US' },
  { rule: { type: 'lastWeekday', month: 5, weekday: 1 }, name: 'Memorial Day', nameKr: '현충일', nameEn: 'Memorial Day', country: '미국', countryCode: 'US' },
  { rule: { type: 'fixed', month: 6, day: 19 }, name: 'Juneteenth', nameKr: '준틴스', nameEn: 'Juneteenth', country: '미국', countryCode: 'US' },
  { rule: { type: 'fixed', month: 7, day: 4 }, name: 'Independence Day', nameKr: '독립기념일', nameEn: 'Independence Day', country: '미국', countryCode: 'US' },
  { rule: { type: 'nthWeekday', month: 9, nth: 1, weekday: 1 }, name: 'Labor Day', nameKr: '노동절', nameEn: 'Labor Day', country: '미국', countryCode: 'US' },
  { rule: { type: 'nthWeekday', month: 10, nth: 2, weekday: 1 }, name: 'Columbus Day', nameKr: '콜럼버스의 날', nameEn: 'Columbus Day', country: '미국', countryCode: 'US' },
  { rule: { type: 'fixed', month: 11, day: 11 }, name: 'Veterans Day', nameKr: '재향군인의 날', nameEn: 'Veterans Day', country: '미국', countryCode: 'US' },
  { rule: { type: 'nthWeekday', month: 11, nth: 4, weekday: 4 }, name: 'Thanksgiving', nameKr: '추수감사절', nameEn: 'Thanksgiving Day', country: '미국', countryCode: 'US' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '미국', countryCode: 'US' },

  // ===== 대만 🇹🇼 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: '元旦', nameKr: '신정', nameEn: "New Year's Day", country: '대만', countryCode: 'TW' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: -1 }, name: '春節', nameKr: '춘절', nameEn: 'Chinese New Year', country: '대만', countryCode: 'TW' },
  { rule: { type: 'lunar', month: 1, day: 1 }, name: '春節', nameKr: '춘절', nameEn: 'Chinese New Year', country: '대만', countryCode: 'TW' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 1 }, name: '春節', nameKr: '춘절', nameEn: 'Chinese New Year', country: '대만', countryCode: 'TW' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 2 }, name: '春節', nameKr: '춘절', nameEn: 'Chinese New Year', country: '대만', countryCode: 'TW' },
  { rule: { type: 'fixed', month: 2, day: 28 }, name: '和平紀念日', nameKr: '평화기념일', nameEn: 'Peace Memorial Day', country: '대만', countryCode: 'TW' },
  { rule: { type: 'fixed', month: 4, day: 4 }, name: '兒童節', nameKr: '어린이날', nameEn: "Children's Day", country: '대만', countryCode: 'TW' },
  { rule: { type: 'fixed', month: 4, day: 5 }, name: '清明節', nameKr: '청명절', nameEn: 'Tomb Sweeping Day', country: '대만', countryCode: 'TW' },
  { rule: { type: 'lunar', month: 5, day: 5 }, name: '端午節', nameKr: '단오절', nameEn: 'Dragon Boat Festival', country: '대만', countryCode: 'TW' },
  { rule: { type: 'lunar', month: 8, day: 15 }, name: '中秋節', nameKr: '중추절', nameEn: 'Mid-Autumn Festival', country: '대만', countryCode: 'TW' },
  { rule: { type: 'fixed', month: 10, day: 10 }, name: '國慶日', nameKr: '국경일', nameEn: 'National Day', country: '대만', countryCode: 'TW' },

  // ===== 홍콩 🇭🇰 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: '元旦', nameKr: '신정', nameEn: "New Year's Day", country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'lunar', month: 1, day: 1 }, name: '農曆新年', nameKr: '춘절', nameEn: 'Chinese New Year', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 1 }, name: '農曆新年', nameKr: '춘절', nameEn: 'Chinese New Year', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 2 }, name: '農曆新年', nameKr: '춘절', nameEn: 'Chinese New Year', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'easter', offset: 1 }, name: 'Easter Monday', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'fixed', month: 4, day: 4 }, name: '清明節', nameKr: '청명절', nameEn: 'Ching Ming Festival', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'lunar', month: 4, day: 8 }, name: '佛誕', nameKr: '부처님오신날', nameEn: "Buddha's Birthday", country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: '勞動節', nameKr: '노동절', nameEn: 'Labour Day', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'lunar', month: 5, day: 5 }, name: '端午節', nameKr: '단오절', nameEn: 'Dragon Boat Festival', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'fixed', month: 7, day: 1 }, name: '香港特別行政區成立紀念日', nameKr: '홍콩반환기념일', nameEn: 'HKSAR Establishment Day', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'lunar', month: 8, day: 15, offset: 1 }, name: '中秋節翌日', nameKr: '추석 다음날', nameEn: 'Day after Mid-Autumn', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'fixed', month: 10, day: 1 }, name: '國慶日', nameKr: '국경절', nameEn: 'National Day', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'lunar', month: 9, day: 9 }, name: '重陽節', nameKr: '중양절', nameEn: 'Chung Yeung Festival', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '홍콩', countryCode: 'HK' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Boxing Day', nameKr: '박싱데이', nameEn: 'Boxing Day', country: '홍콩', countryCode: 'HK' },

  // ===== 베트남 🇻🇳 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Tết Dương lịch', nameKr: '신정', nameEn: "New Year's Day", country: '베트남', countryCode: 'VN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: -1 }, name: 'Tết Nguyên Đán', nameKr: '뗏(구정)', nameEn: 'Vietnamese New Year', country: '베트남', countryCode: 'VN' },
  { rule: { type: 'lunar', month: 1, day: 1 }, name: 'Tết Nguyên Đán', nameKr: '뗏(구정)', nameEn: 'Vietnamese New Year', country: '베트남', countryCode: 'VN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 1 }, name: 'Tết Nguyên Đán', nameKr: '뗏(구정)', nameEn: 'Vietnamese New Year', country: '베트남', countryCode: 'VN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 2 }, name: 'Tết Nguyên Đán', nameKr: '뗏(구정)', nameEn: 'Vietnamese New Year', country: '베트남', countryCode: 'VN' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 3 }, name: 'Tết Nguyên Đán', nameKr: '뗏(구정)', nameEn: 'Vietnamese New Year', country: '베트남', countryCode: 'VN' },
  { rule: { type: 'lunar', month: 3, day: 10 }, name: 'Giỗ Tổ Hùng Vương', nameKr: '훙왕 제삿날', nameEn: 'Hung Kings Festival', country: '베트남', countryCode: 'VN' },
  { rule: { type: 'fixed', month: 4, day: 30 }, name: 'Ngày Thống nhất', nameKr: '통일의 날', nameEn: 'Reunification Day', country: '베트남', countryCode: 'VN' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Ngày Quốc tế Lao động', nameKr: '노동절', nameEn: 'International Workers Day', country: '베트남', countryCode: 'VN' },
  { rule: { type: 'fixed', month: 9, day: 2 }, name: 'Ngày Quốc khánh', nameKr: '국경절', nameEn: 'Independence Day', country: '베트남', countryCode: 'VN' },

  // ===== 태국 🇹🇭 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'วันขึ้นปีใหม่', nameKr: '신정', nameEn: "New Year's Day", country: '태국', countryCode: 'TH' },
  { rule: { type: 'lunar', month: 3, day: 15 }, name: 'วันมาฆบูชา', nameKr: '마카부차', nameEn: 'Makha Bucha', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 4, day: 6 }, name: 'วันจักรี', nameKr: '짜끄리의 날', nameEn: 'Chakri Day', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 4, day: 13 }, name: 'วันสงกรานต์', nameKr: '송끄란', nameEn: 'Songkran', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 4, day: 14 }, name: 'วันสงกรานต์', nameKr: '송끄란', nameEn: 'Songkran', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 4, day: 15 }, name: 'วันสงกรานต์', nameKr: '송끄란', nameEn: 'Songkran', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'วันแรงงานแห่งชาติ', nameKr: '노동절', nameEn: 'Labour Day', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 5, day: 4 }, name: 'วันฉัตรมงคล', nameKr: '대관식 기념일', nameEn: 'Coronation Day', country: '태국', countryCode: 'TH' },
  { rule: { type: 'lunar', month: 4, day: 15 }, name: 'วันวิสาขบูชา', nameKr: '비사카부차', nameEn: 'Visakha Bucha', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 6, day: 3 }, name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระราชินี', nameKr: '왕비 생일', nameEn: "Queen's Birthday", country: '태국', countryCode: 'TH' },
  { rule: { type: 'lunar', month: 8, day: 15 }, name: 'วันอาสาฬหบูชา', nameKr: '아살라부차', nameEn: 'Asalha Bucha', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 7, day: 28 }, name: 'วันเฉลิมพระชนมพรรษา ร.10', nameKr: '국왕 생일', nameEn: "King's Birthday", country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 8, day: 12 }, name: 'วันแม่แห่งชาติ', nameKr: '어머니날', nameEn: "Mother's Day", country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 10, day: 13 }, name: 'วันคล้ายวันสวรรคต ร.9', nameKr: '라마9세 서거일', nameEn: 'King Bhumibol Memorial Day', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 10, day: 23 }, name: 'วันปิยมหาราช', nameKr: '출랄롱꼰 대왕일', nameEn: 'Chulalongkorn Day', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 12, day: 5 }, name: 'วันพ่อแห่งชาติ', nameKr: '아버지날', nameEn: "Father's Day", country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 12, day: 10 }, name: 'วันรัฐธรรมนูญ', nameKr: '헌법의 날', nameEn: 'Constitution Day', country: '태국', countryCode: 'TH' },
  { rule: { type: 'fixed', month: 12, day: 31 }, name: 'วันสิ้นปี', nameKr: '연말', nameEn: "New Year's Eve", country: '태국', countryCode: 'TH' },

  // ===== 싱가포르 🇸🇬 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '싱가포르', countryCode: 'SG' },
  { rule: { type: 'lunar', month: 1, day: 1 }, name: 'Chinese New Year', nameKr: '춘절', nameEn: 'Chinese New Year', country: '싱가포르', countryCode: 'SG' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 1 }, name: 'Chinese New Year', nameKr: '춘절', nameEn: 'Chinese New Year', country: '싱가포르', countryCode: 'SG' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '싱가포르', countryCode: 'SG' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Labour Day', nameKr: '노동절', nameEn: 'Labour Day', country: '싱가포르', countryCode: 'SG' },
  { rule: { type: 'lunar', month: 4, day: 15 }, name: 'Vesak Day', nameKr: '베삭데이', nameEn: 'Vesak Day', country: '싱가포르', countryCode: 'SG' },
  { rule: { type: 'fixed', month: 8, day: 9 }, name: 'National Day', nameKr: '국경일', nameEn: 'National Day', country: '싱가포르', countryCode: 'SG' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '싱가포르', countryCode: 'SG' },

  // ===== 말레이시아 🇲🇾 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Tahun Baru', nameKr: '신정', nameEn: "New Year's Day", country: '말레이시아', countryCode: 'MY' },
  { rule: { type: 'lunar', month: 1, day: 1 }, name: 'Tahun Baru Cina', nameKr: '춘절', nameEn: 'Chinese New Year', country: '말레이시아', countryCode: 'MY' },
  { rule: { type: 'lunar', month: 1, day: 1, offset: 1 }, name: 'Tahun Baru Cina', nameKr: '춘절', nameEn: 'Chinese New Year', country: '말레이시아', countryCode: 'MY' },
  { rule: { type: 'fixed', month: 2, day: 1 }, name: 'Hari Wilayah', nameKr: '연방 영토의 날', nameEn: 'Federal Territory Day', country: '말레이시아', countryCode: 'MY' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Hari Pekerja', nameKr: '노동절', nameEn: 'Labour Day', country: '말레이시아', countryCode: 'MY' },
  { rule: { type: 'lunar', month: 4, day: 15 }, name: 'Hari Wesak', nameKr: '베삭데이', nameEn: 'Wesak Day', country: '말레이시아', countryCode: 'MY' },
  { rule: { type: 'fixed', month: 6, day: 3 }, name: 'Hari Keputeraan YDP Agong', nameKr: '국왕 생일', nameEn: "King's Birthday", country: '말레이시아', countryCode: 'MY' },
  { rule: { type: 'fixed', month: 8, day: 31 }, name: 'Hari Merdeka', nameKr: '독립기념일', nameEn: 'Independence Day', country: '말레이시아', countryCode: 'MY' },
  { rule: { type: 'fixed', month: 9, day: 16 }, name: 'Hari Malaysia', nameKr: '말레이시아의 날', nameEn: 'Malaysia Day', country: '말레이시아', countryCode: 'MY' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Hari Krismas', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '말레이시아', countryCode: 'MY' },

  // ===== 인도네시아 🇮🇩 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Tahun Baru', nameKr: '신정', nameEn: "New Year's Day", country: '인도네시아', countryCode: 'ID' },
  { rule: { type: 'lunar', month: 1, day: 1 }, name: 'Tahun Baru Imlek', nameKr: '춘절', nameEn: 'Chinese New Year', country: '인도네시아', countryCode: 'ID' },
  { rule: { type: 'fixed', month: 3, day: 12 }, name: 'Hari Raya Nyepi', nameKr: '니에피', nameEn: 'Day of Silence', country: '인도네시아', countryCode: 'ID' },
  { rule: { type: 'easter', offset: -2 }, name: 'Jumat Agung', nameKr: '성금요일', nameEn: 'Good Friday', country: '인도네시아', countryCode: 'ID' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Hari Buruh', nameKr: '노동절', nameEn: 'Labour Day', country: '인도네시아', countryCode: 'ID' },
  { rule: { type: 'easter', offset: 39 }, name: 'Kenaikan Yesus Kristus', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '인도네시아', countryCode: 'ID' },
  { rule: { type: 'fixed', month: 6, day: 1 }, name: 'Hari Lahir Pancasila', nameKr: '판차실라의 날', nameEn: 'Pancasila Day', country: '인도네시아', countryCode: 'ID' },
  { rule: { type: 'fixed', month: 8, day: 17 }, name: 'Hari Kemerdekaan', nameKr: '독립기념일', nameEn: 'Independence Day', country: '인도네시아', countryCode: 'ID' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Hari Natal', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '인도네시아', countryCode: 'ID' },

  // ===== 필리핀 🇵🇭 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'lunar', month: 1, day: 1 }, name: 'Chinese New Year', nameKr: '춘절', nameEn: 'Chinese New Year', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'fixed', month: 2, day: 25 }, name: 'EDSA Revolution', nameKr: 'EDSA 혁명기념일', nameEn: 'EDSA Revolution Anniversary', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'fixed', month: 4, day: 9 }, name: 'Araw ng Kagitingan', nameKr: '용맹의 날', nameEn: 'Day of Valor', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'easter', offset: -3 }, name: 'Maundy Thursday', nameKr: '성목요일', nameEn: 'Maundy Thursday', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'easter', offset: -1 }, name: 'Black Saturday', nameKr: '검은 토요일', nameEn: 'Black Saturday', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Labor Day', nameKr: '노동절', nameEn: 'Labor Day', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'fixed', month: 6, day: 12 }, name: 'Independence Day', nameKr: '독립기념일', nameEn: 'Independence Day', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'lastWeekday', month: 8, weekday: 1 }, name: 'National Heroes Day', nameKr: '국가영웅의 날', nameEn: 'National Heroes Day', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: "All Saints' Day", nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'fixed', month: 11, day: 30 }, name: 'Bonifacio Day', nameKr: '보니파시오의 날', nameEn: 'Bonifacio Day', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '필리핀', countryCode: 'PH' },
  { rule: { type: 'fixed', month: 12, day: 30 }, name: 'Rizal Day', nameKr: '리잘의 날', nameEn: 'Rizal Day', country: '필리핀', countryCode: 'PH' },

  // ===== 인도 🇮🇳 =====
  { rule: { type: 'fixed', month: 1, day: 26 }, name: 'गणतंत्र दिवस', nameKr: '공화국의 날', nameEn: 'Republic Day', country: '인도', countryCode: 'IN' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'स्वतंत्रता दिवस', nameKr: '독립기념일', nameEn: 'Independence Day', country: '인도', countryCode: 'IN' },
  { rule: { type: 'fixed', month: 10, day: 2 }, name: 'गांधी जयंती', nameKr: '간디 탄신일', nameEn: 'Gandhi Jayanti', country: '인도', countryCode: 'IN' },

  // ===== 독일 🇩🇪 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Neujahr', nameKr: '신정', nameEn: "New Year's Day", country: '독일', countryCode: 'DE' },
  { rule: { type: 'easter', offset: -2 }, name: 'Karfreitag', nameKr: '성금요일', nameEn: 'Good Friday', country: '독일', countryCode: 'DE' },
  { rule: { type: 'easter', offset: 0 }, name: 'Ostersonntag', nameKr: '부활절', nameEn: 'Easter Sunday', country: '독일', countryCode: 'DE' },
  { rule: { type: 'easter', offset: 1 }, name: 'Ostermontag', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '독일', countryCode: 'DE' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Tag der Arbeit', nameKr: '노동절', nameEn: 'Labour Day', country: '독일', countryCode: 'DE' },
  { rule: { type: 'easter', offset: 39 }, name: 'Christi Himmelfahrt', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '독일', countryCode: 'DE' },
  { rule: { type: 'easter', offset: 49 }, name: 'Pfingstsonntag', nameKr: '성령강림절', nameEn: 'Whit Sunday', country: '독일', countryCode: 'DE' },
  { rule: { type: 'easter', offset: 50 }, name: 'Pfingstmontag', nameKr: '성령강림 월요일', nameEn: 'Whit Monday', country: '독일', countryCode: 'DE' },
  { rule: { type: 'fixed', month: 10, day: 3 }, name: 'Tag der Deutschen Einheit', nameKr: '독일 통일의 날', nameEn: 'German Unity Day', country: '독일', countryCode: 'DE' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Weihnachtstag', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '독일', countryCode: 'DE' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Zweiter Weihnachtsfeiertag', nameKr: '크리스마스 다음날', nameEn: 'St. Stephen\'s Day', country: '독일', countryCode: 'DE' },

  // ===== 영국 🇬🇧 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '영국', countryCode: 'GB' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '영국', countryCode: 'GB' },
  { rule: { type: 'easter', offset: 1 }, name: 'Easter Monday', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '영국', countryCode: 'GB' },
  { rule: { type: 'nthWeekday', month: 5, nth: 1, weekday: 1 }, name: 'Early May Bank Holiday', nameKr: '5월 초 공휴일', nameEn: 'Early May Bank Holiday', country: '영국', countryCode: 'GB' },
  { rule: { type: 'lastWeekday', month: 5, weekday: 1 }, name: 'Spring Bank Holiday', nameKr: '봄 공휴일', nameEn: 'Spring Bank Holiday', country: '영국', countryCode: 'GB' },
  { rule: { type: 'lastWeekday', month: 8, weekday: 1 }, name: 'Summer Bank Holiday', nameKr: '여름 공휴일', nameEn: 'Summer Bank Holiday', country: '영국', countryCode: 'GB' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas Day', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '영국', countryCode: 'GB' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Boxing Day', nameKr: '박싱데이', nameEn: 'Boxing Day', country: '영국', countryCode: 'GB' },

  // ===== 프랑스 🇫🇷 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Jour de l\'An', nameKr: '신정', nameEn: "New Year's Day", country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'easter', offset: 1 }, name: 'Lundi de Pâques', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Fête du Travail', nameKr: '노동절', nameEn: 'Labour Day', country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'fixed', month: 5, day: 8 }, name: 'Victoire 1945', nameKr: '2차대전 승전기념일', nameEn: 'Victory in Europe Day', country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'easter', offset: 39 }, name: 'Ascension', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'easter', offset: 50 }, name: 'Lundi de Pentecôte', nameKr: '성령강림 월요일', nameEn: 'Whit Monday', country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'fixed', month: 7, day: 14 }, name: 'Fête Nationale', nameKr: '바스티유의 날', nameEn: 'Bastille Day', country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'Assomption', nameKr: '성모승천일', nameEn: 'Assumption of Mary', country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Toussaint', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'fixed', month: 11, day: 11 }, name: 'Armistice', nameKr: '휴전기념일', nameEn: 'Armistice Day', country: '프랑스', countryCode: 'FR' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Noël', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '프랑스', countryCode: 'FR' },

  // ===== 이탈리아 🇮🇹 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Capodanno', nameKr: '신정', nameEn: "New Year's Day", country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'fixed', month: 1, day: 6 }, name: 'Epifania', nameKr: '주현절', nameEn: 'Epiphany', country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'easter', offset: 0 }, name: 'Pasqua', nameKr: '부활절', nameEn: 'Easter Sunday', country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'easter', offset: 1 }, name: 'Lunedì dell\'Angelo', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'fixed', month: 4, day: 25 }, name: 'Festa della Liberazione', nameKr: '해방기념일', nameEn: 'Liberation Day', country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Festa del Lavoro', nameKr: '노동절', nameEn: 'Labour Day', country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'fixed', month: 6, day: 2 }, name: 'Festa della Repubblica', nameKr: '공화국의 날', nameEn: 'Republic Day', country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'Ferragosto', nameKr: '성모승천일', nameEn: 'Assumption of Mary', country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Tutti i Santi', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'fixed', month: 12, day: 8 }, name: 'Immacolata Concezione', nameKr: '원죄없는 잉태', nameEn: 'Immaculate Conception', country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Natale', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '이탈리아', countryCode: 'IT' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Santo Stefano', nameKr: '성 스테파노의 날', nameEn: 'St. Stephen\'s Day', country: '이탈리아', countryCode: 'IT' },

  // ===== 스페인 🇪🇸 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Año Nuevo', nameKr: '신정', nameEn: "New Year's Day", country: '스페인', countryCode: 'ES' },
  { rule: { type: 'fixed', month: 1, day: 6 }, name: 'Epifanía', nameKr: '주현절', nameEn: 'Epiphany', country: '스페인', countryCode: 'ES' },
  { rule: { type: 'easter', offset: -2 }, name: 'Viernes Santo', nameKr: '성금요일', nameEn: 'Good Friday', country: '스페인', countryCode: 'ES' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Día del Trabajo', nameKr: '노동절', nameEn: 'Labour Day', country: '스페인', countryCode: 'ES' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'Asunción de la Virgen', nameKr: '성모승천일', nameEn: 'Assumption of Mary', country: '스페인', countryCode: 'ES' },
  { rule: { type: 'fixed', month: 10, day: 12 }, name: 'Fiesta Nacional', nameKr: '국경일', nameEn: 'National Day', country: '스페인', countryCode: 'ES' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Todos los Santos', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '스페인', countryCode: 'ES' },
  { rule: { type: 'fixed', month: 12, day: 6 }, name: 'Día de la Constitución', nameKr: '헌법의 날', nameEn: 'Constitution Day', country: '스페인', countryCode: 'ES' },
  { rule: { type: 'fixed', month: 12, day: 8 }, name: 'Inmaculada Concepción', nameKr: '원죄없는 잉태', nameEn: 'Immaculate Conception', country: '스페인', countryCode: 'ES' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Navidad', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '스페인', countryCode: 'ES' },

  // ===== 네덜란드 🇳🇱 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Nieuwjaarsdag', nameKr: '신정', nameEn: "New Year's Day", country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'easter', offset: -2 }, name: 'Goede Vrijdag', nameKr: '성금요일', nameEn: 'Good Friday', country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'easter', offset: 0 }, name: 'Eerste Paasdag', nameKr: '부활절', nameEn: 'Easter Sunday', country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'easter', offset: 1 }, name: 'Tweede Paasdag', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'fixed', month: 4, day: 27 }, name: 'Koningsdag', nameKr: '국왕의 날', nameEn: "King's Day", country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'fixed', month: 5, day: 5 }, name: 'Bevrijdingsdag', nameKr: '해방의 날', nameEn: 'Liberation Day', country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'easter', offset: 39 }, name: 'Hemelvaartsdag', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'easter', offset: 49 }, name: 'Eerste Pinksterdag', nameKr: '성령강림절', nameEn: 'Whit Sunday', country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'easter', offset: 50 }, name: 'Tweede Pinksterdag', nameKr: '성령강림 월요일', nameEn: 'Whit Monday', country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Eerste Kerstdag', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '네덜란드', countryCode: 'NL' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Tweede Kerstdag', nameKr: '크리스마스 다음날', nameEn: 'Second Christmas Day', country: '네덜란드', countryCode: 'NL' },

  // ===== 폴란드 🇵🇱 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Nowy Rok', nameKr: '신정', nameEn: "New Year's Day", country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'fixed', month: 1, day: 6 }, name: 'Trzech Króli', nameKr: '주현절', nameEn: 'Epiphany', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'easter', offset: 0 }, name: 'Wielkanoc', nameKr: '부활절', nameEn: 'Easter Sunday', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'easter', offset: 1 }, name: 'Poniedziałek Wielkanocny', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Święto Pracy', nameKr: '노동절', nameEn: 'Labour Day', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'fixed', month: 5, day: 3 }, name: 'Święto Konstytucji', nameKr: '헌법의 날', nameEn: 'Constitution Day', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'easter', offset: 49 }, name: 'Zesłanie Ducha Świętego', nameKr: '성령강림절', nameEn: 'Whit Sunday', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'easter', offset: 60 }, name: 'Boże Ciało', nameKr: '성체축일', nameEn: 'Corpus Christi', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'Wniebowzięcie NMP', nameKr: '성모승천일', nameEn: 'Assumption of Mary', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Wszystkich Świętych', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'fixed', month: 11, day: 11 }, name: 'Święto Niepodległości', nameKr: '독립기념일', nameEn: 'Independence Day', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Boże Narodzenie', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '폴란드', countryCode: 'PL' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Drugi Dzień Świąt', nameKr: '크리스마스 다음날', nameEn: 'Second Christmas Day', country: '폴란드', countryCode: 'PL' },

  // ===== 튀르키예 🇹🇷 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Yılbaşı', nameKr: '신정', nameEn: "New Year's Day", country: '튀르키예', countryCode: 'TR' },
  { rule: { type: 'fixed', month: 4, day: 23 }, name: 'Ulusal Egemenlik ve Çocuk Bayramı', nameKr: '주권과 어린이의 날', nameEn: 'National Sovereignty Day', country: '튀르키예', countryCode: 'TR' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Emek ve Dayanışma Günü', nameKr: '노동절', nameEn: 'Labour Day', country: '튀르키예', countryCode: 'TR' },
  { rule: { type: 'fixed', month: 5, day: 19 }, name: 'Atatürk\'ü Anma Gençlik ve Spor Bayramı', nameKr: '청소년과 스포츠의 날', nameEn: 'Youth and Sports Day', country: '튀르키예', countryCode: 'TR' },
  { rule: { type: 'fixed', month: 7, day: 15 }, name: 'Demokrasi ve Millî Birlik Günü', nameKr: '민주주의와 국가통합의 날', nameEn: 'Democracy Day', country: '튀르키예', countryCode: 'TR' },
  { rule: { type: 'fixed', month: 8, day: 30 }, name: 'Zafer Bayramı', nameKr: '승전기념일', nameEn: 'Victory Day', country: '튀르키예', countryCode: 'TR' },
  { rule: { type: 'fixed', month: 10, day: 29 }, name: 'Cumhuriyet Bayramı', nameKr: '공화국의 날', nameEn: 'Republic Day', country: '튀르키예', countryCode: 'TR' },

  // ===== 캐나다 🇨🇦 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'nthWeekday', month: 5, nth: 4, weekday: 1 }, name: 'Victoria Day', nameKr: '빅토리아의 날', nameEn: 'Victoria Day', country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'fixed', month: 7, day: 1 }, name: 'Canada Day', nameKr: '캐나다의 날', nameEn: 'Canada Day', country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'nthWeekday', month: 8, nth: 1, weekday: 1 }, name: 'Civic Holiday', nameKr: '시민의 날', nameEn: 'Civic Holiday', country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'nthWeekday', month: 9, nth: 1, weekday: 1 }, name: 'Labour Day', nameKr: '노동절', nameEn: 'Labour Day', country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'fixed', month: 9, day: 30 }, name: 'National Day for Truth and Reconciliation', nameKr: '진실과 화해의 날', nameEn: 'Truth and Reconciliation Day', country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'nthWeekday', month: 10, nth: 2, weekday: 1 }, name: 'Thanksgiving', nameKr: '추수감사절', nameEn: 'Thanksgiving Day', country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'fixed', month: 11, day: 11 }, name: 'Remembrance Day', nameKr: '현충일', nameEn: 'Remembrance Day', country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '캐나다', countryCode: 'CA' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Boxing Day', nameKr: '박싱데이', nameEn: 'Boxing Day', country: '캐나다', countryCode: 'CA' },

  // ===== 멕시코 🇲🇽 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Año Nuevo', nameKr: '신정', nameEn: "New Year's Day", country: '멕시코', countryCode: 'MX' },
  { rule: { type: 'nthWeekday', month: 2, nth: 1, weekday: 1 }, name: 'Día de la Constitución', nameKr: '헌법의 날', nameEn: 'Constitution Day', country: '멕시코', countryCode: 'MX' },
  { rule: { type: 'nthWeekday', month: 3, nth: 3, weekday: 1 }, name: 'Natalicio de Benito Juárez', nameKr: '베니토 후아레스 탄신일', nameEn: 'Benito Juárez Birthday', country: '멕시코', countryCode: 'MX' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Día del Trabajo', nameKr: '노동절', nameEn: 'Labour Day', country: '멕시코', countryCode: 'MX' },
  { rule: { type: 'fixed', month: 9, day: 16 }, name: 'Día de la Independencia', nameKr: '독립기념일', nameEn: 'Independence Day', country: '멕시코', countryCode: 'MX' },
  { rule: { type: 'nthWeekday', month: 11, nth: 3, weekday: 1 }, name: 'Día de la Revolución', nameKr: '혁명기념일', nameEn: 'Revolution Day', country: '멕시코', countryCode: 'MX' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Navidad', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '멕시코', countryCode: 'MX' },

  // ===== 브라질 🇧🇷 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Ano Novo', nameKr: '신정', nameEn: "New Year's Day", country: '브라질', countryCode: 'BR' },
  { rule: { type: 'easter', offset: -47 }, name: 'Carnaval', nameKr: '카니발', nameEn: 'Carnival', country: '브라질', countryCode: 'BR' },
  { rule: { type: 'easter', offset: -2 }, name: 'Sexta-feira Santa', nameKr: '성금요일', nameEn: 'Good Friday', country: '브라질', countryCode: 'BR' },
  { rule: { type: 'fixed', month: 4, day: 21 }, name: 'Tiradentes', nameKr: '티라덴테스의 날', nameEn: 'Tiradentes Day', country: '브라질', countryCode: 'BR' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Dia do Trabalho', nameKr: '노동절', nameEn: 'Labour Day', country: '브라질', countryCode: 'BR' },
  { rule: { type: 'easter', offset: 60 }, name: 'Corpus Christi', nameKr: '성체축일', nameEn: 'Corpus Christi', country: '브라질', countryCode: 'BR' },
  { rule: { type: 'fixed', month: 9, day: 7 }, name: 'Independência do Brasil', nameKr: '독립기념일', nameEn: 'Independence Day', country: '브라질', countryCode: 'BR' },
  { rule: { type: 'fixed', month: 10, day: 12 }, name: 'Nossa Senhora Aparecida', nameKr: '성모 아파레시다의 날', nameEn: 'Our Lady Aparecida', country: '브라질', countryCode: 'BR' },
  { rule: { type: 'fixed', month: 11, day: 2 }, name: 'Finados', nameKr: '위령의 날', nameEn: 'All Souls Day', country: '브라질', countryCode: 'BR' },
  { rule: { type: 'fixed', month: 11, day: 15 }, name: 'Proclamação da República', nameKr: '공화국 선포일', nameEn: 'Republic Day', country: '브라질', countryCode: 'BR' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Natal', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '브라질', countryCode: 'BR' },

  // ===== 호주 🇦🇺 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '호주', countryCode: 'AU' },
  { rule: { type: 'fixed', month: 1, day: 26 }, name: 'Australia Day', nameKr: '호주의 날', nameEn: 'Australia Day', country: '호주', countryCode: 'AU' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '호주', countryCode: 'AU' },
  { rule: { type: 'easter', offset: -1 }, name: 'Easter Saturday', nameKr: '부활절 토요일', nameEn: 'Easter Saturday', country: '호주', countryCode: 'AU' },
  { rule: { type: 'easter', offset: 1 }, name: 'Easter Monday', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '호주', countryCode: 'AU' },
  { rule: { type: 'fixed', month: 4, day: 25 }, name: 'Anzac Day', nameKr: '안작의 날', nameEn: 'Anzac Day', country: '호주', countryCode: 'AU' },
  { rule: { type: 'nthWeekday', month: 6, nth: 2, weekday: 1 }, name: "Queen's Birthday", nameKr: '여왕 생일', nameEn: "Queen's Birthday", country: '호주', countryCode: 'AU' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '호주', countryCode: 'AU' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Boxing Day', nameKr: '박싱데이', nameEn: 'Boxing Day', country: '호주', countryCode: 'AU' },

  // ===== 뉴질랜드 🇳🇿 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'fixed', month: 1, day: 2 }, name: "Day after New Year's Day", nameKr: '신정 다음날', nameEn: "Day after New Year's Day", country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'fixed', month: 2, day: 6 }, name: 'Waitangi Day', nameKr: '와이탕이의 날', nameEn: 'Waitangi Day', country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'easter', offset: 1 }, name: 'Easter Monday', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'fixed', month: 4, day: 25 }, name: 'Anzac Day', nameKr: '안작의 날', nameEn: 'Anzac Day', country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'nthWeekday', month: 6, nth: 1, weekday: 1 }, name: "King's Birthday", nameKr: '국왕 생일', nameEn: "King's Birthday", country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'fixed', month: 6, day: 28 }, name: 'Matariki', nameKr: '마타리키', nameEn: 'Matariki', country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'nthWeekday', month: 10, nth: 4, weekday: 1 }, name: 'Labour Day', nameKr: '노동절', nameEn: 'Labour Day', country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '뉴질랜드', countryCode: 'NZ' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Boxing Day', nameKr: '박싱데이', nameEn: 'Boxing Day', country: '뉴질랜드', countryCode: 'NZ' },

  // ===== UAE 🇦🇪 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: 'UAE', countryCode: 'AE' },
  { rule: { type: 'fixed', month: 12, day: 2 }, name: 'اليوم الوطني', nameKr: '국경일', nameEn: 'National Day', country: 'UAE', countryCode: 'AE' },
  { rule: { type: 'fixed', month: 12, day: 3 }, name: 'اليوم الوطني', nameKr: '국경일', nameEn: 'National Day', country: 'UAE', countryCode: 'AE' },

  // ===== 사우디 🇸🇦 =====
  { rule: { type: 'fixed', month: 2, day: 22 }, name: 'يوم التأسيس', nameKr: '건국기념일', nameEn: 'Founding Day', country: '사우디', countryCode: 'SA' },
  { rule: { type: 'fixed', month: 9, day: 23 }, name: 'اليوم الوطني', nameKr: '국경일', nameEn: 'National Day', country: '사우디', countryCode: 'SA' },

  // ===== 러시아 🇷🇺 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Новый год', nameKr: '신정', nameEn: "New Year's Day", country: '러시아', countryCode: 'RU' },
  { rule: { type: 'fixed', month: 1, day: 7 }, name: 'Рождество', nameKr: '정교회 성탄절', nameEn: 'Orthodox Christmas', country: '러시아', countryCode: 'RU' },
  { rule: { type: 'fixed', month: 2, day: 23 }, name: 'День защитника Отечества', nameKr: '조국수호자의 날', nameEn: "Defender's Day", country: '러시아', countryCode: 'RU' },
  { rule: { type: 'fixed', month: 3, day: 8 }, name: 'Международный женский день', nameKr: '국제 여성의 날', nameEn: "Women's Day", country: '러시아', countryCode: 'RU' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Праздник Весны и Труда', nameKr: '노동절', nameEn: 'Labour Day', country: '러시아', countryCode: 'RU' },
  { rule: { type: 'fixed', month: 5, day: 9 }, name: 'День Победы', nameKr: '전승기념일', nameEn: 'Victory Day', country: '러시아', countryCode: 'RU' },
  { rule: { type: 'fixed', month: 6, day: 12 }, name: 'День России', nameKr: '러시아의 날', nameEn: 'Russia Day', country: '러시아', countryCode: 'RU' },
  { rule: { type: 'fixed', month: 11, day: 4 }, name: 'День народного единства', nameKr: '민족통합의 날', nameEn: 'Unity Day', country: '러시아', countryCode: 'RU' },

  // ===== 스위스 🇨🇭 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Neujahr', nameKr: '신정', nameEn: "New Year's Day", country: '스위스', countryCode: 'CH' },
  { rule: { type: 'easter', offset: -2 }, name: 'Karfreitag', nameKr: '성금요일', nameEn: 'Good Friday', country: '스위스', countryCode: 'CH' },
  { rule: { type: 'easter', offset: 1 }, name: 'Ostermontag', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '스위스', countryCode: 'CH' },
  { rule: { type: 'easter', offset: 39 }, name: 'Auffahrt', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '스위스', countryCode: 'CH' },
  { rule: { type: 'easter', offset: 50 }, name: 'Pfingstmontag', nameKr: '성령강림 월요일', nameEn: 'Whit Monday', country: '스위스', countryCode: 'CH' },
  { rule: { type: 'fixed', month: 8, day: 1 }, name: 'Nationalfeiertag', nameKr: '건국기념일', nameEn: 'Swiss National Day', country: '스위스', countryCode: 'CH' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Weihnachten', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '스위스', countryCode: 'CH' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Stephanstag', nameKr: '성 스테파노의 날', nameEn: "St. Stephen's Day", country: '스위스', countryCode: 'CH' },

  // ===== 벨기에 🇧🇪 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Nieuwjaar', nameKr: '신정', nameEn: "New Year's Day", country: '벨기에', countryCode: 'BE' },
  { rule: { type: 'easter', offset: 1 }, name: 'Paasmaandag', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '벨기에', countryCode: 'BE' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Dag van de Arbeid', nameKr: '노동절', nameEn: 'Labour Day', country: '벨기에', countryCode: 'BE' },
  { rule: { type: 'easter', offset: 39 }, name: 'Hemelvaart', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '벨기에', countryCode: 'BE' },
  { rule: { type: 'easter', offset: 50 }, name: 'Pinkstermaandag', nameKr: '성령강림 월요일', nameEn: 'Whit Monday', country: '벨기에', countryCode: 'BE' },
  { rule: { type: 'fixed', month: 7, day: 21 }, name: 'Nationale Feestdag', nameKr: '건국기념일', nameEn: 'Belgian National Day', country: '벨기에', countryCode: 'BE' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'Onze-Lieve-Vrouw-Hemelvaart', nameKr: '성모승천일', nameEn: 'Assumption of Mary', country: '벨기에', countryCode: 'BE' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Allerheiligen', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '벨기에', countryCode: 'BE' },
  { rule: { type: 'fixed', month: 11, day: 11 }, name: 'Wapenstilstand', nameKr: '휴전기념일', nameEn: 'Armistice Day', country: '벨기에', countryCode: 'BE' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Kerstdag', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '벨기에', countryCode: 'BE' },

  // ===== 오스트리아 🇦🇹 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Neujahr', nameKr: '신정', nameEn: "New Year's Day", country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'fixed', month: 1, day: 6 }, name: 'Heilige Drei Könige', nameKr: '주현절', nameEn: 'Epiphany', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'easter', offset: 1 }, name: 'Ostermontag', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Staatsfeiertag', nameKr: '노동절', nameEn: 'Labour Day', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'easter', offset: 39 }, name: 'Christi Himmelfahrt', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'easter', offset: 50 }, name: 'Pfingstmontag', nameKr: '성령강림 월요일', nameEn: 'Whit Monday', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'easter', offset: 60 }, name: 'Fronleichnam', nameKr: '성체축일', nameEn: 'Corpus Christi', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'Mariä Himmelfahrt', nameKr: '성모승천일', nameEn: 'Assumption of Mary', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'fixed', month: 10, day: 26 }, name: 'Nationalfeiertag', nameKr: '건국기념일', nameEn: 'Austrian National Day', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Allerheiligen', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'fixed', month: 12, day: 8 }, name: 'Mariä Empfängnis', nameKr: '원죄없는 잉태', nameEn: 'Immaculate Conception', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Weihnachten', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '오스트리아', countryCode: 'AT' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Stefanitag', nameKr: '성 스테파노의 날', nameEn: "St. Stephen's Day", country: '오스트리아', countryCode: 'AT' },

  // ===== 스웨덴 🇸🇪 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Nyårsdagen', nameKr: '신정', nameEn: "New Year's Day", country: '스웨덴', countryCode: 'SE' },
  { rule: { type: 'fixed', month: 1, day: 6 }, name: 'Trettondedag jul', nameKr: '주현절', nameEn: 'Epiphany', country: '스웨덴', countryCode: 'SE' },
  { rule: { type: 'easter', offset: -2 }, name: 'Långfredagen', nameKr: '성금요일', nameEn: 'Good Friday', country: '스웨덴', countryCode: 'SE' },
  { rule: { type: 'easter', offset: 1 }, name: 'Annandag påsk', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '스웨덴', countryCode: 'SE' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Första maj', nameKr: '노동절', nameEn: 'Labour Day', country: '스웨덴', countryCode: 'SE' },
  { rule: { type: 'easter', offset: 39 }, name: 'Kristi himmelsfärdsdag', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '스웨덴', countryCode: 'SE' },
  { rule: { type: 'fixed', month: 6, day: 6 }, name: 'Sveriges nationaldag', nameKr: '스웨덴 국경일', nameEn: 'National Day', country: '스웨덴', countryCode: 'SE' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Juldagen', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '스웨덴', countryCode: 'SE' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Annandag jul', nameKr: '크리스마스 다음날', nameEn: 'Second Christmas Day', country: '스웨덴', countryCode: 'SE' },

  // ===== 노르웨이 🇳🇴 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Første nyttårsdag', nameKr: '신정', nameEn: "New Year's Day", country: '노르웨이', countryCode: 'NO' },
  { rule: { type: 'easter', offset: -3 }, name: 'Skjærtorsdag', nameKr: '성목요일', nameEn: 'Maundy Thursday', country: '노르웨이', countryCode: 'NO' },
  { rule: { type: 'easter', offset: -2 }, name: 'Langfredag', nameKr: '성금요일', nameEn: 'Good Friday', country: '노르웨이', countryCode: 'NO' },
  { rule: { type: 'easter', offset: 1 }, name: 'Annen påskedag', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '노르웨이', countryCode: 'NO' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Arbeidernes dag', nameKr: '노동절', nameEn: 'Labour Day', country: '노르웨이', countryCode: 'NO' },
  { rule: { type: 'fixed', month: 5, day: 17 }, name: 'Grunnlovsdagen', nameKr: '헌법기념일', nameEn: 'Constitution Day', country: '노르웨이', countryCode: 'NO' },
  { rule: { type: 'easter', offset: 39 }, name: 'Kristi himmelfartsdag', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '노르웨이', countryCode: 'NO' },
  { rule: { type: 'easter', offset: 50 }, name: 'Annen pinsedag', nameKr: '성령강림 월요일', nameEn: 'Whit Monday', country: '노르웨이', countryCode: 'NO' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Første juledag', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '노르웨이', countryCode: 'NO' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Annen juledag', nameKr: '크리스마스 다음날', nameEn: 'Second Christmas Day', country: '노르웨이', countryCode: 'NO' },

  // ===== 덴마크 🇩🇰 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Nytårsdag', nameKr: '신정', nameEn: "New Year's Day", country: '덴마크', countryCode: 'DK' },
  { rule: { type: 'easter', offset: -3 }, name: 'Skærtorsdag', nameKr: '성목요일', nameEn: 'Maundy Thursday', country: '덴마크', countryCode: 'DK' },
  { rule: { type: 'easter', offset: -2 }, name: 'Langfredag', nameKr: '성금요일', nameEn: 'Good Friday', country: '덴마크', countryCode: 'DK' },
  { rule: { type: 'easter', offset: 1 }, name: '2. påskedag', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '덴마크', countryCode: 'DK' },
  { rule: { type: 'easter', offset: 39 }, name: 'Kristi himmelfartsdag', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '덴마크', countryCode: 'DK' },
  { rule: { type: 'easter', offset: 50 }, name: '2. pinsedag', nameKr: '성령강림 월요일', nameEn: 'Whit Monday', country: '덴마크', countryCode: 'DK' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Juledag', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '덴마크', countryCode: 'DK' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: '2. juledag', nameKr: '크리스마스 다음날', nameEn: 'Second Christmas Day', country: '덴마크', countryCode: 'DK' },

  // ===== 핀란드 🇫🇮 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Uudenvuodenpäivä', nameKr: '신정', nameEn: "New Year's Day", country: '핀란드', countryCode: 'FI' },
  { rule: { type: 'fixed', month: 1, day: 6 }, name: 'Loppiainen', nameKr: '주현절', nameEn: 'Epiphany', country: '핀란드', countryCode: 'FI' },
  { rule: { type: 'easter', offset: -2 }, name: 'Pitkäperjantai', nameKr: '성금요일', nameEn: 'Good Friday', country: '핀란드', countryCode: 'FI' },
  { rule: { type: 'easter', offset: 1 }, name: '2. pääsiäispäivä', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '핀란드', countryCode: 'FI' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Vappu', nameKr: '노동절', nameEn: 'Labour Day', country: '핀란드', countryCode: 'FI' },
  { rule: { type: 'easter', offset: 39 }, name: 'Helatorstai', nameKr: '예수 승천일', nameEn: 'Ascension Day', country: '핀란드', countryCode: 'FI' },
  { rule: { type: 'fixed', month: 12, day: 6 }, name: 'Itsenäisyyspäivä', nameKr: '독립기념일', nameEn: 'Independence Day', country: '핀란드', countryCode: 'FI' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Joulupäivä', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '핀란드', countryCode: 'FI' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Tapaninpäivä', nameKr: '성 스테파노의 날', nameEn: "St. Stephen's Day", country: '핀란드', countryCode: 'FI' },

  // ===== 포르투갈 🇵🇹 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Ano Novo', nameKr: '신정', nameEn: "New Year's Day", country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'easter', offset: -2 }, name: 'Sexta-feira Santa', nameKr: '성금요일', nameEn: 'Good Friday', country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'fixed', month: 4, day: 25 }, name: 'Dia da Liberdade', nameKr: '자유의 날', nameEn: 'Freedom Day', country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Dia do Trabalhador', nameKr: '노동절', nameEn: 'Labour Day', country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'fixed', month: 6, day: 10 }, name: 'Dia de Portugal', nameKr: '포르투갈의 날', nameEn: 'Portugal Day', country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'easter', offset: 60 }, name: 'Corpo de Deus', nameKr: '성체축일', nameEn: 'Corpus Christi', country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'Assunção de Nossa Senhora', nameKr: '성모승천일', nameEn: 'Assumption of Mary', country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'fixed', month: 10, day: 5 }, name: 'Implantação da República', nameKr: '공화국 선언일', nameEn: 'Republic Day', country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Dia de Todos os Santos', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'fixed', month: 12, day: 1 }, name: 'Restauração da Independência', nameKr: '독립회복기념일', nameEn: 'Restoration of Independence', country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'fixed', month: 12, day: 8 }, name: 'Imaculada Conceição', nameKr: '원죄없는 잉태', nameEn: 'Immaculate Conception', country: '포르투갈', countryCode: 'PT' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Natal', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '포르투갈', countryCode: 'PT' },

  // ===== 그리스 🇬🇷 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Πρωτοχρονιά', nameKr: '신정', nameEn: "New Year's Day", country: '그리스', countryCode: 'GR' },
  { rule: { type: 'fixed', month: 1, day: 6 }, name: 'Θεοφάνεια', nameKr: '주현절', nameEn: 'Epiphany', country: '그리스', countryCode: 'GR' },
  { rule: { type: 'fixed', month: 3, day: 25 }, name: 'Ευαγγελισμός', nameKr: '독립기념일', nameEn: 'Independence Day', country: '그리스', countryCode: 'GR' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Εργατική Πρωτομαγιά', nameKr: '노동절', nameEn: 'Labour Day', country: '그리스', countryCode: 'GR' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'Κοίμηση της Θεοτόκου', nameKr: '성모승천일', nameEn: 'Assumption of Mary', country: '그리스', countryCode: 'GR' },
  { rule: { type: 'fixed', month: 10, day: 28 }, name: 'Επέτειος του Όχι', nameKr: '오히의 날', nameEn: 'Ochi Day', country: '그리스', countryCode: 'GR' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Χριστούγεννα', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '그리스', countryCode: 'GR' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Σύναξη Θεοτόκου', nameKr: '성모 시납시스', nameEn: 'Synaxis of Theotokos', country: '그리스', countryCode: 'GR' },

  // ===== 체코 🇨🇿 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Nový rok', nameKr: '신정', nameEn: "New Year's Day", country: '체코', countryCode: 'CZ' },
  { rule: { type: 'easter', offset: -2 }, name: 'Velký pátek', nameKr: '성금요일', nameEn: 'Good Friday', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'easter', offset: 1 }, name: 'Velikonoční pondělí', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Svátek práce', nameKr: '노동절', nameEn: 'Labour Day', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 5, day: 8 }, name: 'Den vítězství', nameKr: '해방기념일', nameEn: 'Liberation Day', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 7, day: 5 }, name: 'Den slovanských věrozvěstů', nameKr: '슬라브 사도의 날', nameEn: 'Saints Cyril and Methodius Day', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 7, day: 6 }, name: 'Den upálení Jana Husa', nameKr: '얀 후스의 날', nameEn: 'Jan Hus Day', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 9, day: 28 }, name: 'Den české státnosti', nameKr: '체코 국가의 날', nameEn: 'Czech Statehood Day', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 10, day: 28 }, name: 'Den vzniku samostatného čs. státu', nameKr: '독립기념일', nameEn: 'Independent Czechoslovak State Day', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 11, day: 17 }, name: 'Den boje za svobodu', nameKr: '자유투쟁의 날', nameEn: 'Struggle for Freedom Day', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 12, day: 24 }, name: 'Štědrý den', nameKr: '크리스마스 이브', nameEn: 'Christmas Eve', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: '1. svátek vánoční', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '체코', countryCode: 'CZ' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: '2. svátek vánoční', nameKr: '성 스테파노의 날', nameEn: "St. Stephen's Day", country: '체코', countryCode: 'CZ' },

  // ===== 헝가리 🇭🇺 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Újév', nameKr: '신정', nameEn: "New Year's Day", country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'fixed', month: 3, day: 15 }, name: 'Nemzeti ünnep', nameKr: '국경일', nameEn: 'National Day', country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'easter', offset: -2 }, name: 'Nagypéntek', nameKr: '성금요일', nameEn: 'Good Friday', country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'easter', offset: 1 }, name: 'Húsvéthétfő', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'A munka ünnepe', nameKr: '노동절', nameEn: 'Labour Day', country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'easter', offset: 50 }, name: 'Pünkösdhétfő', nameKr: '성령강림 월요일', nameEn: 'Whit Monday', country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'fixed', month: 8, day: 20 }, name: 'Szent István napja', nameKr: '성 이슈트반의 날', nameEn: "St. Stephen's Day", country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'fixed', month: 10, day: 23 }, name: '1956-os forradalom évfordulója', nameKr: '1956 혁명기념일', nameEn: '1956 Revolution Day', country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Mindenszentek', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Karácsony', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '헝가리', countryCode: 'HU' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Karácsony másnapja', nameKr: '크리스마스 다음날', nameEn: 'Second Christmas Day', country: '헝가리', countryCode: 'HU' },

  // ===== 아일랜드 🇮🇪 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '아일랜드', countryCode: 'IE' },
  { rule: { type: 'fixed', month: 2, day: 1 }, name: "St. Brigid's Day", nameKr: '성 브리짓의 날', nameEn: "St. Brigid's Day", country: '아일랜드', countryCode: 'IE' },
  { rule: { type: 'fixed', month: 3, day: 17 }, name: "St. Patrick's Day", nameKr: '성 패트릭의 날', nameEn: "St. Patrick's Day", country: '아일랜드', countryCode: 'IE' },
  { rule: { type: 'easter', offset: 1 }, name: 'Easter Monday', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '아일랜드', countryCode: 'IE' },
  { rule: { type: 'nthWeekday', month: 5, nth: 1, weekday: 1 }, name: 'May Day', nameKr: '5월 공휴일', nameEn: 'May Day', country: '아일랜드', countryCode: 'IE' },
  { rule: { type: 'nthWeekday', month: 6, nth: 1, weekday: 1 }, name: 'June Bank Holiday', nameKr: '6월 공휴일', nameEn: 'June Bank Holiday', country: '아일랜드', countryCode: 'IE' },
  { rule: { type: 'nthWeekday', month: 8, nth: 1, weekday: 1 }, name: 'August Bank Holiday', nameKr: '8월 공휴일', nameEn: 'August Bank Holiday', country: '아일랜드', countryCode: 'IE' },
  { rule: { type: 'lastWeekday', month: 10, weekday: 1 }, name: 'October Bank Holiday', nameKr: '10월 공휴일', nameEn: 'October Bank Holiday', country: '아일랜드', countryCode: 'IE' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas Day', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '아일랜드', countryCode: 'IE' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: "St. Stephen's Day", nameKr: '성 스테파노의 날', nameEn: "St. Stephen's Day", country: '아일랜드', countryCode: 'IE' },

  // ===== 아르헨티나 🇦🇷 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Año Nuevo', nameKr: '신정', nameEn: "New Year's Day", country: '아르헨티나', countryCode: 'AR' },
  { rule: { type: 'easter', offset: -2 }, name: 'Viernes Santo', nameKr: '성금요일', nameEn: 'Good Friday', country: '아르헨티나', countryCode: 'AR' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Día del Trabajador', nameKr: '노동절', nameEn: 'Labour Day', country: '아르헨티나', countryCode: 'AR' },
  { rule: { type: 'fixed', month: 5, day: 25 }, name: 'Día de la Revolución de Mayo', nameKr: '5월 혁명기념일', nameEn: 'May Revolution Day', country: '아르헨티나', countryCode: 'AR' },
  { rule: { type: 'fixed', month: 6, day: 20 }, name: 'Día de la Bandera', nameKr: '국기의 날', nameEn: 'Flag Day', country: '아르헨티나', countryCode: 'AR' },
  { rule: { type: 'fixed', month: 7, day: 9 }, name: 'Día de la Independencia', nameKr: '독립기념일', nameEn: 'Independence Day', country: '아르헨티나', countryCode: 'AR' },
  { rule: { type: 'fixed', month: 12, day: 8 }, name: 'Inmaculada Concepción', nameKr: '원죄없는 잉태', nameEn: 'Immaculate Conception', country: '아르헨티나', countryCode: 'AR' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Navidad', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '아르헨티나', countryCode: 'AR' },

  // ===== 칠레 🇨🇱 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Año Nuevo', nameKr: '신정', nameEn: "New Year's Day", country: '칠레', countryCode: 'CL' },
  { rule: { type: 'easter', offset: -2 }, name: 'Viernes Santo', nameKr: '성금요일', nameEn: 'Good Friday', country: '칠레', countryCode: 'CL' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Día del Trabajo', nameKr: '노동절', nameEn: 'Labour Day', country: '칠레', countryCode: 'CL' },
  { rule: { type: 'fixed', month: 5, day: 21 }, name: 'Día de las Glorias Navales', nameKr: '해군의 날', nameEn: 'Navy Day', country: '칠레', countryCode: 'CL' },
  { rule: { type: 'fixed', month: 8, day: 15 }, name: 'Asunción de la Virgen', nameKr: '성모승천일', nameEn: 'Assumption of Mary', country: '칠레', countryCode: 'CL' },
  { rule: { type: 'fixed', month: 9, day: 18 }, name: 'Fiestas Patrias', nameKr: '독립기념일', nameEn: 'Independence Day', country: '칠레', countryCode: 'CL' },
  { rule: { type: 'fixed', month: 9, day: 19 }, name: 'Día de las Glorias del Ejército', nameKr: '육군의 날', nameEn: 'Army Day', country: '칠레', countryCode: 'CL' },
  { rule: { type: 'fixed', month: 10, day: 12 }, name: 'Día del Encuentro de Dos Mundos', nameKr: '두 세계의 만남', nameEn: 'Columbus Day', country: '칠레', countryCode: 'CL' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Día de Todos los Santos', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '칠레', countryCode: 'CL' },
  { rule: { type: 'fixed', month: 12, day: 8 }, name: 'Inmaculada Concepción', nameKr: '원죄없는 잉태', nameEn: 'Immaculate Conception', country: '칠레', countryCode: 'CL' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Navidad', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '칠레', countryCode: 'CL' },

  // ===== 콜롬비아 🇨🇴 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Año Nuevo', nameKr: '신정', nameEn: "New Year's Day", country: '콜롬비아', countryCode: 'CO' },
  { rule: { type: 'fixed', month: 1, day: 6 }, name: 'Día de los Reyes Magos', nameKr: '주현절', nameEn: 'Epiphany', country: '콜롬비아', countryCode: 'CO' },
  { rule: { type: 'easter', offset: -3 }, name: 'Jueves Santo', nameKr: '성목요일', nameEn: 'Maundy Thursday', country: '콜롬비아', countryCode: 'CO' },
  { rule: { type: 'easter', offset: -2 }, name: 'Viernes Santo', nameKr: '성금요일', nameEn: 'Good Friday', country: '콜롬비아', countryCode: 'CO' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Día del Trabajo', nameKr: '노동절', nameEn: 'Labour Day', country: '콜롬비아', countryCode: 'CO' },
  { rule: { type: 'fixed', month: 7, day: 20 }, name: 'Día de la Independencia', nameKr: '독립기념일', nameEn: 'Independence Day', country: '콜롬비아', countryCode: 'CO' },
  { rule: { type: 'fixed', month: 8, day: 7 }, name: 'Batalla de Boyacá', nameKr: '보야카 전투 기념일', nameEn: 'Battle of Boyacá', country: '콜롬비아', countryCode: 'CO' },
  { rule: { type: 'fixed', month: 12, day: 8 }, name: 'Inmaculada Concepción', nameKr: '원죄없는 잉태', nameEn: 'Immaculate Conception', country: '콜롬비아', countryCode: 'CO' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Navidad', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '콜롬비아', countryCode: 'CO' },

  // ===== 페루 🇵🇪 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'Año Nuevo', nameKr: '신정', nameEn: "New Year's Day", country: '페루', countryCode: 'PE' },
  { rule: { type: 'easter', offset: -3 }, name: 'Jueves Santo', nameKr: '성목요일', nameEn: 'Maundy Thursday', country: '페루', countryCode: 'PE' },
  { rule: { type: 'easter', offset: -2 }, name: 'Viernes Santo', nameKr: '성금요일', nameEn: 'Good Friday', country: '페루', countryCode: 'PE' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Día del Trabajo', nameKr: '노동절', nameEn: 'Labour Day', country: '페루', countryCode: 'PE' },
  { rule: { type: 'fixed', month: 6, day: 29 }, name: 'San Pedro y San Pablo', nameKr: '성 베드로와 성 바울의 날', nameEn: 'Saints Peter and Paul Day', country: '페루', countryCode: 'PE' },
  { rule: { type: 'fixed', month: 7, day: 28 }, name: 'Día de la Independencia', nameKr: '독립기념일', nameEn: 'Independence Day', country: '페루', countryCode: 'PE' },
  { rule: { type: 'fixed', month: 7, day: 29 }, name: 'Día de la Independencia', nameKr: '독립기념일', nameEn: 'Independence Day', country: '페루', countryCode: 'PE' },
  { rule: { type: 'fixed', month: 8, day: 30 }, name: 'Santa Rosa de Lima', nameKr: '성녀 로사의 날', nameEn: 'Santa Rosa de Lima', country: '페루', countryCode: 'PE' },
  { rule: { type: 'fixed', month: 10, day: 8 }, name: 'Combate de Angamos', nameKr: '앙가모스 전투 기념일', nameEn: 'Battle of Angamos', country: '페루', countryCode: 'PE' },
  { rule: { type: 'fixed', month: 11, day: 1 }, name: 'Día de Todos los Santos', nameKr: '모든 성인의 날', nameEn: "All Saints' Day", country: '페루', countryCode: 'PE' },
  { rule: { type: 'fixed', month: 12, day: 8 }, name: 'Inmaculada Concepción', nameKr: '원죄없는 잉태', nameEn: 'Immaculate Conception', country: '페루', countryCode: 'PE' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Navidad', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '페루', countryCode: 'PE' },

  // ===== 이스라엘 🇮🇱 =====
  { rule: { type: 'fixed', month: 4, day: 15 }, name: 'פסח', nameKr: '유월절', nameEn: 'Passover', country: '이스라엘', countryCode: 'IL' },
  { rule: { type: 'fixed', month: 5, day: 14 }, name: 'יום העצמאות', nameKr: '독립기념일', nameEn: 'Independence Day', country: '이스라엘', countryCode: 'IL' },
  { rule: { type: 'fixed', month: 6, day: 5 }, name: 'שבועות', nameKr: '샤부오트', nameEn: 'Shavuot', country: '이스라엘', countryCode: 'IL' },
  { rule: { type: 'fixed', month: 10, day: 3 }, name: 'ראש השנה', nameKr: '로쉬 하샤나', nameEn: 'Rosh Hashanah', country: '이스라엘', countryCode: 'IL' },
  { rule: { type: 'fixed', month: 10, day: 12 }, name: 'יום כיפור', nameKr: '욤 키푸르', nameEn: 'Yom Kippur', country: '이스라엘', countryCode: 'IL' },
  { rule: { type: 'fixed', month: 10, day: 17 }, name: 'סוכות', nameKr: '초막절', nameEn: 'Sukkot', country: '이스라엘', countryCode: 'IL' },

  // ===== 카타르 🇶🇦 =====
  { rule: { type: 'fixed', month: 12, day: 18 }, name: 'اليوم الوطني', nameKr: '국경일', nameEn: 'National Day', country: '카타르', countryCode: 'QA' },

  // ===== 쿠웨이트 🇰🇼 =====
  { rule: { type: 'fixed', month: 2, day: 25 }, name: 'العيد الوطني', nameKr: '국경일', nameEn: 'National Day', country: '쿠웨이트', countryCode: 'KW' },
  { rule: { type: 'fixed', month: 2, day: 26 }, name: 'عيد التحرير', nameKr: '해방의 날', nameEn: 'Liberation Day', country: '쿠웨이트', countryCode: 'KW' },

  // ===== 남아공 🇿🇦 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'fixed', month: 3, day: 21 }, name: 'Human Rights Day', nameKr: '인권의 날', nameEn: 'Human Rights Day', country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'easter', offset: 1 }, name: 'Family Day', nameKr: '가족의 날', nameEn: 'Family Day', country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'fixed', month: 4, day: 27 }, name: 'Freedom Day', nameKr: '자유의 날', nameEn: 'Freedom Day', country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: "Workers' Day", nameKr: '노동절', nameEn: "Workers' Day", country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'fixed', month: 6, day: 16 }, name: 'Youth Day', nameKr: '청소년의 날', nameEn: 'Youth Day', country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'fixed', month: 8, day: 9 }, name: "Women's Day", nameKr: '여성의 날', nameEn: "Women's Day", country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'fixed', month: 9, day: 24 }, name: 'Heritage Day', nameKr: '유산의 날', nameEn: 'Heritage Day', country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'fixed', month: 12, day: 16 }, name: 'Day of Reconciliation', nameKr: '화해의 날', nameEn: 'Day of Reconciliation', country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas Day', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '남아공', countryCode: 'ZA' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Day of Goodwill', nameKr: '친선의 날', nameEn: 'Day of Goodwill', country: '남아공', countryCode: 'ZA' },

  // ===== 이집트 🇪🇬 =====
  { rule: { type: 'fixed', month: 1, day: 7 }, name: 'عيد الميلاد المجيد', nameKr: '콥트 성탄절', nameEn: 'Coptic Christmas', country: '이집트', countryCode: 'EG' },
  { rule: { type: 'fixed', month: 1, day: 25 }, name: 'عيد الثورة', nameKr: '혁명기념일', nameEn: 'Revolution Day', country: '이집트', countryCode: 'EG' },
  { rule: { type: 'fixed', month: 4, day: 25 }, name: 'عيد تحرير سيناء', nameKr: '시나이 해방의 날', nameEn: 'Sinai Liberation Day', country: '이집트', countryCode: 'EG' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'عيد العمال', nameKr: '노동절', nameEn: 'Labour Day', country: '이집트', countryCode: 'EG' },
  { rule: { type: 'fixed', month: 7, day: 23 }, name: 'عيد الثورة', nameKr: '7월 혁명기념일', nameEn: 'Revolution Day', country: '이집트', countryCode: 'EG' },
  { rule: { type: 'fixed', month: 10, day: 6 }, name: 'عيد القوات المسلحة', nameKr: '군인의 날', nameEn: 'Armed Forces Day', country: '이집트', countryCode: 'EG' },

  // ===== 나이지리아 🇳🇬 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '나이지리아', countryCode: 'NG' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '나이지리아', countryCode: 'NG' },
  { rule: { type: 'easter', offset: 1 }, name: 'Easter Monday', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '나이지리아', countryCode: 'NG' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: "Workers' Day", nameKr: '노동절', nameEn: "Workers' Day", country: '나이지리아', countryCode: 'NG' },
  { rule: { type: 'fixed', month: 5, day: 27 }, name: "Children's Day", nameKr: '어린이날', nameEn: "Children's Day", country: '나이지리아', countryCode: 'NG' },
  { rule: { type: 'fixed', month: 6, day: 12 }, name: 'Democracy Day', nameKr: '민주주의의 날', nameEn: 'Democracy Day', country: '나이지리아', countryCode: 'NG' },
  { rule: { type: 'fixed', month: 10, day: 1 }, name: 'Independence Day', nameKr: '독립기념일', nameEn: 'Independence Day', country: '나이지리아', countryCode: 'NG' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas Day', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '나이지리아', countryCode: 'NG' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Boxing Day', nameKr: '박싱데이', nameEn: 'Boxing Day', country: '나이지리아', countryCode: 'NG' },

  // ===== 케냐 🇰🇪 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: "New Year's Day", nameKr: '신정', nameEn: "New Year's Day", country: '케냐', countryCode: 'KE' },
  { rule: { type: 'easter', offset: -2 }, name: 'Good Friday', nameKr: '성금요일', nameEn: 'Good Friday', country: '케냐', countryCode: 'KE' },
  { rule: { type: 'easter', offset: 1 }, name: 'Easter Monday', nameKr: '부활절 월요일', nameEn: 'Easter Monday', country: '케냐', countryCode: 'KE' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'Labour Day', nameKr: '노동절', nameEn: 'Labour Day', country: '케냐', countryCode: 'KE' },
  { rule: { type: 'fixed', month: 6, day: 1 }, name: 'Madaraka Day', nameKr: '마다라카의 날', nameEn: 'Madaraka Day', country: '케냐', countryCode: 'KE' },
  { rule: { type: 'fixed', month: 10, day: 20 }, name: 'Mashujaa Day', nameKr: '영웅의 날', nameEn: 'Mashujaa Day', country: '케냐', countryCode: 'KE' },
  { rule: { type: 'fixed', month: 12, day: 12 }, name: 'Jamhuri Day', nameKr: '잠후리의 날', nameEn: 'Jamhuri Day', country: '케냐', countryCode: 'KE' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'Christmas Day', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '케냐', countryCode: 'KE' },
  { rule: { type: 'fixed', month: 12, day: 26 }, name: 'Boxing Day', nameKr: '박싱데이', nameEn: 'Boxing Day', country: '케냐', countryCode: 'KE' },

  // ===== 방글라데시 🇧🇩 =====
  { rule: { type: 'fixed', month: 2, day: 21 }, name: 'শহীদ দিবস', nameKr: '순국선열의 날', nameEn: 'Language Martyrs Day', country: '방글라데시', countryCode: 'BD' },
  { rule: { type: 'fixed', month: 3, day: 26 }, name: 'স্বাধীনতা দিবস', nameKr: '독립기념일', nameEn: 'Independence Day', country: '방글라데시', countryCode: 'BD' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'মে দিবস', nameKr: '노동절', nameEn: 'Labour Day', country: '방글라데시', countryCode: 'BD' },
  { rule: { type: 'fixed', month: 12, day: 16 }, name: 'বিজয় দিবস', nameKr: '승전기념일', nameEn: 'Victory Day', country: '방글라데시', countryCode: 'BD' },

  // ===== 파키스탄 🇵🇰 =====
  { rule: { type: 'fixed', month: 3, day: 23 }, name: 'یوم پاکستان', nameKr: '파키스탄의 날', nameEn: 'Pakistan Day', country: '파키스탄', countryCode: 'PK' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'یوم مزدور', nameKr: '노동절', nameEn: 'Labour Day', country: '파키스탄', countryCode: 'PK' },
  { rule: { type: 'fixed', month: 8, day: 14 }, name: 'یوم آزادی', nameKr: '독립기념일', nameEn: 'Independence Day', country: '파키스탄', countryCode: 'PK' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'یوم قائد', nameKr: '진나 탄신일', nameEn: 'Quaid-e-Azam Day', country: '파키스탄', countryCode: 'PK' },

  // ===== 스리랑카 🇱🇰 =====
  { rule: { type: 'fixed', month: 1, day: 15 }, name: 'දෙමළ උදානය', nameKr: '타밀 퐁갈', nameEn: 'Tamil Thai Pongal Day', country: '스리랑카', countryCode: 'LK' },
  { rule: { type: 'fixed', month: 2, day: 4 }, name: 'ජාතික නිදහස් දිනය', nameKr: '독립기념일', nameEn: 'Independence Day', country: '스리랑카', countryCode: 'LK' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'කම්කරු දිනය', nameKr: '노동절', nameEn: 'Labour Day', country: '스리랑카', countryCode: 'LK' },
  { rule: { type: 'lunar', month: 4, day: 15 }, name: 'වෙසක් පොහෝ දිනය', nameKr: '베삭 포야', nameEn: 'Vesak Full Moon Poya', country: '스리랑카', countryCode: 'LK' },
  { rule: { type: 'fixed', month: 12, day: 25 }, name: 'නත්තල', nameKr: '크리스마스', nameEn: 'Christmas Day', country: '스리랑카', countryCode: 'LK' },

  // ===== 미얀마 🇲🇲 =====
  { rule: { type: 'fixed', month: 1, day: 4 }, name: 'လွတ်လပ်ရေးနေ့', nameKr: '독립기념일', nameEn: 'Independence Day', country: '미얀마', countryCode: 'MM' },
  { rule: { type: 'fixed', month: 2, day: 12 }, name: 'ပြည်ထောင်စုနေ့', nameKr: '연방의 날', nameEn: 'Union Day', country: '미얀마', countryCode: 'MM' },
  { rule: { type: 'fixed', month: 3, day: 2 }, name: 'တောင်သူလယ်သမားနေ့', nameKr: '농민의 날', nameEn: 'Peasants Day', country: '미얀마', countryCode: 'MM' },
  { rule: { type: 'fixed', month: 3, day: 27 }, name: 'တပ်မတော်နေ့', nameKr: '군인의 날', nameEn: 'Armed Forces Day', country: '미얀마', countryCode: 'MM' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'အလုပ်သမားနေ့', nameKr: '노동절', nameEn: 'Labour Day', country: '미얀마', countryCode: 'MM' },
  { rule: { type: 'fixed', month: 7, day: 19 }, name: 'အာဇာနည်နေ့', nameKr: '순국선열의 날', nameEn: 'Martyrs Day', country: '미얀마', countryCode: 'MM' },

  // ===== 캄보디아 🇰🇭 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'ថ្ងៃចូលឆ្នាំសកល', nameKr: '신정', nameEn: "New Year's Day", country: '캄보디아', countryCode: 'KH' },
  { rule: { type: 'fixed', month: 1, day: 7 }, name: 'ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍', nameKr: '승전기념일', nameEn: 'Victory over Genocide Day', country: '캄보디아', countryCode: 'KH' },
  { rule: { type: 'fixed', month: 4, day: 14 }, name: 'ចូលឆ្នាំខ្មែរ', nameKr: '크메르 신년', nameEn: 'Khmer New Year', country: '캄보디아', countryCode: 'KH' },
  { rule: { type: 'fixed', month: 4, day: 15 }, name: 'ចូលឆ្នាំខ្មែរ', nameKr: '크메르 신년', nameEn: 'Khmer New Year', country: '캄보디아', countryCode: 'KH' },
  { rule: { type: 'fixed', month: 4, day: 16 }, name: 'ចូលឆ្នាំខ្មែរ', nameKr: '크메르 신년', nameEn: 'Khmer New Year', country: '캄보디아', countryCode: 'KH' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'ទិវាពលកម្មអន្តរជាតិ', nameKr: '노동절', nameEn: 'Labour Day', country: '캄보디아', countryCode: 'KH' },
  { rule: { type: 'lunar', month: 4, day: 15 }, name: 'ពិធីបុណ្យវិសាខបូជា', nameKr: '비사카부차', nameEn: 'Visak Bochea Day', country: '캄보디아', countryCode: 'KH' },
  { rule: { type: 'fixed', month: 11, day: 9 }, name: 'ទិវាឯករាជ្យជាតិ', nameKr: '독립기념일', nameEn: 'Independence Day', country: '캄보디아', countryCode: 'KH' },

  // ===== 라오스 🇱🇦 =====
  { rule: { type: 'fixed', month: 1, day: 1 }, name: 'ວັນປີໃໝ່ສາກົນ', nameKr: '신정', nameEn: "New Year's Day", country: '라오스', countryCode: 'LA' },
  { rule: { type: 'fixed', month: 4, day: 14 }, name: 'ປີໃໝ່ລາວ', nameKr: '라오스 신년', nameEn: 'Lao New Year', country: '라오스', countryCode: 'LA' },
  { rule: { type: 'fixed', month: 4, day: 15 }, name: 'ປີໃໝ່ລາວ', nameKr: '라오스 신년', nameEn: 'Lao New Year', country: '라오스', countryCode: 'LA' },
  { rule: { type: 'fixed', month: 4, day: 16 }, name: 'ປີໃໝ່ລາວ', nameKr: '라오스 신년', nameEn: 'Lao New Year', country: '라오스', countryCode: 'LA' },
  { rule: { type: 'fixed', month: 5, day: 1 }, name: 'ວັນແຮງງານ', nameKr: '노동절', nameEn: 'Labour Day', country: '라오스', countryCode: 'LA' },
  { rule: { type: 'fixed', month: 12, day: 2 }, name: 'ວັນຊາດ', nameKr: '국경일', nameEn: 'National Day', country: '라오스', countryCode: 'LA' },
];

// ========== 공휴일 생성 함수 ==========
function generateHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const easterDate = getEasterDate(year);

  for (const def of HOLIDAY_RULES) {
    let date: Date | null = null;

    switch (def.rule.type) {
      case 'fixed':
        date = new Date(year, def.rule.month - 1, def.rule.day);
        break;

      case 'nthWeekday':
        date = getNthWeekdayOfMonth(year, def.rule.month, def.rule.nth, def.rule.weekday);
        break;

      case 'lastWeekday':
        date = getLastWeekdayOfMonth(year, def.rule.month, def.rule.weekday);
        break;

      case 'lunar': {
        const baseDate = lunarToSolar(year, def.rule.month, def.rule.day);
        const offset = def.rule.offset || 0;
        date = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
        break;
      }

      case 'easter': {
        date = new Date(easterDate.getTime() + def.rule.offset * 24 * 60 * 60 * 1000);
        break;
      }

      case 'islamic': {
        // 이슬람 공휴일은 근사 계산 (실제로는 달 관측에 따라 다름)
        const islamicYear = getIslamicYear(year);
        date = islamicToGregorian(islamicYear, def.rule.month, def.rule.day);
        // 해당 연도 범위 내인지 확인
        if (date.getFullYear() !== year) {
          date = islamicToGregorian(islamicYear + 1, def.rule.month, def.rule.day);
        }
        break;
      }
    }

    if (date && date.getFullYear() === year) {
      const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      holidays.push({
        date: dateStr,
        name: def.name,
        nameKr: def.nameKr,
        nameEn: def.nameEn,
        country: def.country,
        countryCode: def.countryCode,
      });
    }
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const STORAGE_KEY = 'shipdago_holidays_countries';

const WorldHolidays: React.FC<WorldHolidaysProps> = ({
  leftSideAdSlot,
  rightSideAdSlot,
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedCountries, setSelectedCountries] = useState<string[]>(() => {
    if (typeof window === 'undefined') return COUNTRIES.map(c => c.code);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return COUNTRIES.map(c => c.code);
      }
    }
    return COUNTRIES.map(c => c.code);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 로컬스토리지 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCountries));
  }, [selectedCountries]);

  // 선택된 연도의 공휴일 생성 (메모이제이션)
  const yearHolidays = useMemo(() => {
    return generateHolidaysForYear(selectedYear);
  }, [selectedYear]);

  // 선택된 국가의 공휴일만 필터링
  const filteredHolidays = useMemo(() => {
    return yearHolidays.filter(h => selectedCountries.includes(h.countryCode));
  }, [yearHolidays, selectedCountries]);

  // 해당 월의 달력 데이터 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [selectedYear, selectedMonth]);

  const getHolidaysForDate = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredHolidays.filter(h => h.date === dateStr);
  };

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const selectAllCountries = () => setSelectedCountries(COUNTRIES.map(c => c.code));
  const clearAllCountries = () => setSelectedCountries([]);

  // 지역별 선택/해제
  const toggleRegion = (regionId: Country['region']) => {
    const regionCountries = COUNTRIES.filter(c => c.region === regionId).map(c => c.code);
    const allSelected = regionCountries.every(code => selectedCountries.includes(code));
    if (allSelected) {
      setSelectedCountries(prev => prev.filter(code => !regionCountries.includes(code)));
    } else {
      setSelectedCountries(prev => [...new Set([...prev, ...regionCountries])]);
    }
  };

  const isRegionFullySelected = (regionId: Country['region']) => {
    const regionCountries = COUNTRIES.filter(c => c.region === regionId).map(c => c.code);
    return regionCountries.every(code => selectedCountries.includes(code));
  };

  const isRegionPartiallySelected = (regionId: Country['region']) => {
    const regionCountries = COUNTRIES.filter(c => c.region === regionId).map(c => c.code);
    const selectedCount = regionCountries.filter(code => selectedCountries.includes(code)).length;
    return selectedCount > 0 && selectedCount < regionCountries.length;
  };

  const getRegionSelectedCount = (regionId: Country['region']) => {
    const regionCountries = COUNTRIES.filter(c => c.region === regionId).map(c => c.code);
    return regionCountries.filter(code => selectedCountries.includes(code)).length;
  };

  const selectedDateHolidays = selectedDate
    ? filteredHolidays.filter(h => h.date === selectedDate)
    : [];

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear(prev => prev - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear(prev => prev + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  return (
    <div className="flex-1 overflow-visible bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">세계 공휴일 달력</h1>
                <p className="text-slate-400 text-xs">주요 무역국 공휴일 한눈에 보기 ({COUNTRIES.length}개국)</p>
              </div>
            </div>

            {/* Year & Month Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-bold text-slate-800 min-w-[100px] text-center">
                {selectedYear}년 {MONTHS[selectedMonth]}
              </span>
              <button
                onClick={goToNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
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
        {/* Region Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {REGIONS.map(region => {
            const regionCountries = COUNTRIES.filter(c => c.region === region.id);
            if (regionCountries.length === 0) return null;
            const isFullySelected = isRegionFullySelected(region.id);
            const isPartiallySelected = isRegionPartiallySelected(region.id);

            return (
              <button
                key={region.id}
                onClick={() => toggleRegion(region.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isFullySelected
                    ? 'bg-slate-800 text-white'
                    : isPartiallySelected
                      ? 'bg-slate-300 text-slate-700'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {region.name}
              </button>
            );
          })}
          <span className="text-slate-300">|</span>
          <button onClick={selectAllCountries} className="text-[11px] text-slate-500 hover:text-slate-700">전체</button>
          <button onClick={clearAllCountries} className="text-[11px] text-slate-400 hover:text-slate-600">초기화</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Calendar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
              {WEEKDAYS.map((day, idx) => (
                <div key={day} className={`py-2 text-center text-xs font-bold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-600'}`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="min-h-[80px] sm:min-h-[100px] bg-slate-50/50" />;
                }

                const holidays = getHolidaysForDate(day);
                const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === getTodayString();
                const dayOfWeek = new Date(selectedYear, selectedMonth, day).getDay();
                const hasHoliday = holidays.length > 0;

                return (
                  <div
                    key={day}
                    onClick={() => holidays.length > 0 && setSelectedDate(dateStr)}
                    className={`min-h-[80px] sm:min-h-[100px] p-1 border-b border-r border-slate-100 ${
                      holidays.length > 0 ? 'cursor-pointer hover:bg-blue-50/50' : ''
                    } ${isToday ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className={`text-xs font-bold mb-0.5 w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-blue-600 text-white' :
                      hasHoliday ? 'text-red-500' :
                      dayOfWeek === 0 ? 'text-red-400' :
                      dayOfWeek === 6 ? 'text-blue-500' : 'text-slate-700'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {holidays.slice(0, 3).map((h, hIdx) => {
                        const country = COUNTRIES.find(c => c.code === h.countryCode);
                        return (
                          <div key={hIdx} className="text-[10px] sm:text-[11px] truncate flex items-center gap-0.5">
                            <span className="text-xs leading-none">{country?.flag}</span>
                            <span className="text-slate-700 font-bold truncate hidden sm:inline leading-none">{h.nameKr}</span>
                          </div>
                        );
                      })}
                      {holidays.length > 3 && (
                        <div className="text-[10px] text-slate-400">+{holidays.length - 3}개</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Country Toggle */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">국가 선택</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{selectedCountries.length}/{COUNTRIES.length}</span>
                  <button onClick={selectAllCountries} className="text-[10px] text-blue-500 hover:text-blue-700">전체</button>
                  <button onClick={clearAllCountries} className="text-[10px] text-slate-400 hover:text-slate-600">초기화</button>
                </div>
              </div>
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {REGIONS.map(region => {
                  const regionCountries = COUNTRIES.filter(c => c.region === region.id);
                  if (regionCountries.length === 0) return null;
                  return (
                    <div key={region.id}>
                      <p className="text-[10px] text-slate-400 mb-1">{region.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {regionCountries.map(country => {
                          const isSelected = selectedCountries.includes(country.code);
                          return (
                            <button
                              key={country.code}
                              onClick={() => toggleCountry(country.code)}
                              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-all ${
                                isSelected
                                  ? 'bg-slate-700 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Holidays */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">다가오는 한국 공휴일</h3>
              <div className="space-y-2">
                {(() => {
                  const today = new Date();
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

                  // 올해와 내년 공휴일 합치기
                  const thisYearHolidays = generateHolidaysForYear(today.getFullYear());
                  const nextYearHolidays = generateHolidaysForYear(today.getFullYear() + 1);
                  const allHolidays = [...thisYearHolidays, ...nextYearHolidays];

                  return allHolidays
                    .filter(h => h.countryCode === 'KR' && h.date >= todayStr)
                    .slice(0, 5)
                    .map((h, idx) => {
                      const [year, month, day] = h.date.split('-');
                      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      const dayOfWeek = WEEKDAYS[dateObj.getDay()];
                      const isNextYear = parseInt(year) > today.getFullYear();
                      return (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400 min-w-[70px]">
                            {isNextYear && <span className="text-blue-500">{year.slice(2)}.</span>}
                            {parseInt(month)}/{parseInt(day)} ({dayOfWeek})
                          </span>
                          <span className="text-slate-700">{h.nameKr}</span>
                        </div>
                      );
                    });
                })()}
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

      {/* Holiday Detail Modal */}
      {selectedDate && selectedDateHolidays.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">
                  {selectedDate.split('-')[0]}년 {parseInt(selectedDate.split('-')[1])}월 {parseInt(selectedDate.split('-')[2])}일
                </p>
                <h2 className="text-lg font-bold text-slate-800">공휴일 정보</h2>
              </div>
              <button onClick={() => setSelectedDate(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {selectedDateHolidays.map((h, idx) => {
                const country = COUNTRIES.find(c => c.code === h.countryCode);
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <span className="text-2xl">{country?.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{h.nameKr}</p>
                      {h.name !== h.nameKr && (
                        <p className="text-xs text-slate-500 mt-0.5">{h.name}</p>
                      )}
                      {h.nameEn !== h.name && h.nameEn !== h.nameKr && (
                        <p className="text-xs text-slate-400">{h.nameEn}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{country?.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldHolidays;
