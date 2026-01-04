/**
 * 로컬 시간대 기준 날짜 유틸리티
 * toISOString()은 UTC 기준이라 한국(UTC+9)에서 오전 9시 전에는 전날로 표시됨
 * 이 함수들은 로컬 시간대 기준으로 날짜를 반환
 */

/**
 * 로컬 시간대 기준 YYYY-MM-DD 문자열 반환
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 오늘 날짜 YYYY-MM-DD 문자열 반환 (로컬 시간대)
 */
export const getTodayString = (): string => {
  return getLocalDateString(new Date());
};

/**
 * N일 후/전 날짜 YYYY-MM-DD 문자열 반환 (로컬 시간대)
 * @param days 양수면 미래, 음수면 과거
 */
export const getOffsetDateString = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
};

/**
 * N년 후/전 날짜 YYYY-MM-DD 문자열 반환 (로컬 시간대)
 * @param years 양수면 미래, 음수면 과거
 */
export const getOffsetYearDateString = (years: number): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return getLocalDateString(date);
};
