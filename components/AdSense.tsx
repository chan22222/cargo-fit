import React, { useEffect, useRef } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal' | 'autorelaxed';
  adLayoutKey?: string; // 인피드 광고용
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
}

// 현재 마운트된 AdSense 요소 레지스트리
const activeAdElements = new Set<HTMLElement>();

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

  // 레지스트리에 등록/해제
  useEffect(() => {
    const el = adRef.current;
    if (el) activeAdElements.add(el);
    return () => {
      if (el) activeAdElements.delete(el);
    };
  }, []);

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
            isAdLoaded.current = true;
            return;
          }

          // push 전: 현재 마운트된 컴포넌트가 아닌 미처리 유령 <ins> 제거
          document.querySelectorAll('ins.adsbygoogle').forEach(el => {
            if (activeAdElements.has(el as HTMLElement)) return;
            const status = el.getAttribute('data-adsbygoogle-status');
            if (!status) {
              el.remove();
            }
          });

          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});

          // push 후 우리 요소가 처리되었는지 확인
          retryTimer = setTimeout(() => {
            if (adRef.current) {
              const filled = adRef.current.getAttribute('data-adsbygoogle-status');
              if (filled) {
                isAdLoaded.current = true;
              } else if (retryCount < maxRetries) {
                retryCount++;
                tryPush();
              }
            }
          }, 200);
        }
      } catch (err: unknown) {
        // AdSense 에러 무시
      }
    };

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
