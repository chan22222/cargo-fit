import React, { useEffect, useRef } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adFormat = 'auto',
  style,
  className = '',
  fullWidthResponsive = true
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // 광고가 이미 로드되었거나 AdSense가 없으면 skip
    if (isAdLoaded.current) return;

    try {
      // @ts-ignore
      if (window.adsbygoogle && adRef.current) {
        // 이 요소에 이미 광고가 있는지 확인
        const hasAd = adRef.current.getAttribute('data-adsbygoogle-status');

        if (!hasAd) {
          // @ts-ignore
          window.adsbygoogle.push({});
          isAdLoaded.current = true;
        }
      }
    } catch (err) {
      // 광고 차단기나 중복 광고 오류는 무시
      if (err.message && !err.message.includes('adsbygoogle')) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={style || { display: 'block' }}
      data-ad-client="ca-pub-6070760100543970"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  );
};

export default AdSense;