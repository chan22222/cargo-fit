import React, { useEffect, useRef } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal' | 'autorelaxed';
  adLayoutKey?: string; // 인피드 광고용
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

// 전역 로드 큐 - 광고를 순차적으로 로드
let adLoadQueue: (() => void)[] = [];
let isProcessingQueue = false;

const processQueue = () => {
  if (isProcessingQueue || adLoadQueue.length === 0) return;

  isProcessingQueue = true;
  const loadFn = adLoadQueue.shift();

  if (loadFn) {
    loadFn();
    // 다음 광고 로드 전 100ms 대기
    setTimeout(() => {
      isProcessingQueue = false;
      processQueue();
    }, 100);
  }
};

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
    if (isAdLoaded.current) return;

    const loadAd = () => {
      try {
        // @ts-ignore
        if (window.adsbygoogle && adRef.current) {
          const hasAd = adRef.current.getAttribute('data-adsbygoogle-status');
          if (!hasAd) {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isAdLoaded.current = true;
          }
        }
      } catch (err: unknown) {
        // AdSense 에러는 무시 (중복 push 등)
      }
    };

    // 마운트 후 약간의 지연을 두고 큐에 추가
    const timer = setTimeout(() => {
      if (!isAdLoaded.current) {
        adLoadQueue.push(loadAd);
        processQueue();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [adSlot]);

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
