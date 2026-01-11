import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
}

const BASE_URL = 'https://www.shipdago.com';
const DEFAULT_TITLE = 'SHIPDAGO | 쉽다고, 포워딩/무역 협업 플랫폼';
const DEFAULT_DESCRIPTION = '물류의 디지털 전환, SHIPDAGO와 함께하세요. 컨테이너 3D 시뮬레이션, 환율 계산, 화물 추적 등 물류 실무 도구를 무료로 제공합니다.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | SHIPDAGO` : DEFAULT_TITLE;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // Open Graph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', canonicalUrl || window.location.href, true);
    setMetaTag('og:site_name', 'SHIPDAGO', true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Robots
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalUrl) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }

    // JSON-LD structured data
    const existingJsonLd = document.querySelector('script[data-seo-jsonld]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
      document.head.appendChild(script);
    }

    // Cleanup
    return () => {
      const jsonLdScript = document.querySelector('script[data-seo-jsonld]');
      if (jsonLdScript) {
        jsonLdScript.remove();
      }
    };
  }, [fullTitle, description, keywords, ogImage, ogType, canonicalUrl, noIndex, jsonLd]);

  return null;
};

// Pre-defined JSON-LD schemas
export const schemas = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SHIPDAGO',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    description: '물류 실무자를 위한 올인원 도구 플랫폼',
    sameAs: [],
  },

  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SHIPDAGO',
    url: BASE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },

  softwareApplication: (name: string, description: string, url: string) => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
  }),

  faqPage: (faqs: { question: string; answer: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  breadcrumb: (items: { name: string; url: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  article: (title: string, description: string, imageUrl: string, datePublished: string, author: string) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: imageUrl,
    datePublished,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SHIPDAGO',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.svg`,
      },
    },
  }),
};

export default SEO;
