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
    if (isAdLoaded.current) return;

    let retryCount = 0;
    const maxRetries = 5;
    let retryTimer: ReturnType<typeof setTimeout>;

    const tryPush = () => {
      try {
        // @ts-ignore
        if (window.adsbygoogle && adRef.current) {
          const hasAd = adRef.current.getAttribute('data-adsbygoogle-status');
          if (hasAd) {
            // 이미 AdSense가 처리함
            isAdLoaded.current = true;
            return;
          }

          // push 전에 DOM에서 소유자 없는 유령 <ins> 정리
          document.querySelectorAll('ins.adsbygoogle').forEach(el => {
            if (el === adRef.current) return; // 자기 자신 스킵
            const status = el.getAttribute('data-adsbygoogle-status');
            const slot = el.getAttribute('data-ad-slot');
            // status 없고 slot도 없는 유령 요소 제거
            if (!status && !slot) {
              el.remove();
            }
          });

          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});

          // push 후 실제로 우리 요소가 처리되었는지 확인 (200ms 후)
          retryTimer = setTimeout(() => {
            if (adRef.current) {
              const filled = adRef.current.getAttribute('data-adsbygoogle-status');
              if (filled) {
                isAdLoaded.current = true;
              } else if (retryCount < maxRetries) {
                // 다른 유령 요소가 push를 가로챘을 수 있음 → 재시도
                retryCount++;
                tryPush();
              }
            }
          }, 200);
        }
      } catch (err: unknown) {
        // AdSense 에러는 무시 (중복 push 등)
      }
    };

    // 마운트 후 약간의 지연을 두고 로드
    const timer = setTimeout(() => {
      if (!isAdLoaded.current) {
        tryPush();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer!);
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
