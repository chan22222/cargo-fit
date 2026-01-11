/**
 * pexels 이미지 URL 최적화
 * 큰 이미지를 적절한 크기로 리사이즈하여 로딩 속도 개선
 */
export const optimizeImageUrl = (url: string, width: number = 800): string => {
  if (!url) return url;

  // pexels 이미지인 경우 최적화 파라미터 추가
  if (url.includes('images.pexels.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=compress&cs=tinysrgb&w=${width}&dpr=1`;
  }

  return url;
};

/**
 * 썸네일용 작은 이미지
 */
export const getThumbnailUrl = (url: string): string => {
  return optimizeImageUrl(url, 600);
};

/**
 * Featured/상세 페이지용 큰 이미지
 */
export const getFeaturedImageUrl = (url: string): string => {
  return optimizeImageUrl(url, 1200);
};
