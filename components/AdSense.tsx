import React, { useEffect, useRef } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal' | 'autorelaxed';
  adLayoutKey?: string; // 인피드 광고용
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adFormat = 'auto',
  adLayoutKey,
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
    } catch (err: unknown) {
      // 광고 차단기나 중복 광고 오류는 무시
      const error = err as Error;
      if (error.message && !error.message.includes('adsbygoogle')) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  // 인피드 광고 (fluid + layoutKey)
  if (adLayoutKey) {
    return (
      <ins
        ref={adRef}
        className={`adsbygoogle ${className}`}
        style={style || { display: 'block' }}
        data-ad-client="ca-pub-6070760100543970"
        data-ad-slot={adSlot}
        data-ad-format="fluid"
        data-ad-layout-key={adLayoutKey}
      />
    );
  }

  // 멀티플렉스 광고 (autorelaxed)
  if (adFormat === 'autorelaxed') {
    return (
      <ins
        ref={adRef}
        className={`adsbygoogle ${className}`}
        style={style || { display: 'block' }}
        data-ad-client="ca-pub-6070760100543970"
        data-ad-slot={adSlot}
        data-ad-format="autorelaxed"
      />
    );
  }

  // 기본 광고
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
