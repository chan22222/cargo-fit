import React, { useState, useEffect } from 'react';
import { Insight } from '../types/insights';
import { db } from '../lib/supabase';
import { getFeaturedImageUrl, getThumbnailUrl } from '../lib/image';

interface InsightDetailProps {
  insightId: string;
  onNavigateBack: () => void;
  onNavigateToInsight: (id: string) => void;
}

const InsightDetail: React.FC<InsightDetailProps> = ({ insightId, onNavigateBack, onNavigateToInsight }) => {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [relatedInsights, setRelatedInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsight = async () => {
      setLoading(true);
      try {
        // Load specific insight
        const { data, error } = await db.insights.getById(insightId);
        if (error) {
          console.error('Error loading insight:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const formattedInsight = {
            id: data.id,
            tag: data.tag,
            title: data.title,
            date: data.date,
            imageUrl: data.image_url,
            content: data.content,
            author: data.author,
            published: data.published,
            viewCount: data.view_count || 0
          };
          setInsight(formattedInsight);

          // Increment view count
          const viewCountKey = `viewed_${insightId}`;
          const alreadyViewed = sessionStorage.getItem(viewCountKey);
          if (!alreadyViewed) {
            // 먼저 플래그 설정해서 race condition 방지
            sessionStorage.setItem(viewCountKey, 'true');
            await db.insights.incrementViewCount(insightId);
          }

          // Load related insights
          const { data: allData } = await db.insights.getAll();
          if (allData) {
            const related = allData
              .filter((item: any) => item.id !== insightId && item.published && item.tag === data.tag)
              .slice(0, 3)
              .map((item: any) => ({
                id: item.id,
                tag: item.tag,
                title: item.title,
                date: item.date,
                imageUrl: item.image_url,
                content: item.content,
                author: item.author,
                published: item.published,
                viewCount: item.view_count || 0
              }));
            setRelatedInsights(related);
          }
        }
      } catch (error) {
        console.error('Error loading insight:', error);
      }
      setLoading(false);
    };

    loadInsight();
  }, [insightId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <svg className="w-24 h-24 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="text-lg mb-4 text-slate-600">인사이트를 찾을 수 없습니다.</div>
        <button
          onClick={onNavigateBack}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg transition-all"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const shareUrl = window.location.href;
  const shareTitle = insight.title;
  const shareText = `${insight.title} - SHIPDAGO Insights`;

  const handleShare = (platform: string) => {
    let url = '';

    switch(platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'kakao':
        // KakaoTalk web share URL (works without SDK)
        url = `https://sharer.kakao.com/talk/friends/picker/link?app_key=YOUR_APP_KEY&app_ver=1.0&title=${encodeURIComponent(shareTitle)}&description=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        // Alternative: Use simple URL scheme that prompts to open KakaoTalk
        url = `kakaotalk://sendurl?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      case 'copy':
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl);
        }
        alert('링크가 복사되었습니다!');
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article */}
        <article className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Hero Image */}
          {insight.imageUrl && (
            <div className="relative aspect-[21/9] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
              <img
                src={getFeaturedImageUrl(insight.imageUrl)}
                alt={insight.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Article Content */}
          <div className="p-8 md:p-12">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium">
                {insight.tag}
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{insight.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  조회수 {formatViewCount(insight.viewCount)}
                </span>
                {insight.author && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {insight.author}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
              {insight.title}
            </h1>

            {/* Content - Render HTML content */}
            <div
              className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:mb-4 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-4 prose-ul:list-disc prose-ol:list-decimal"
              dangerouslySetInnerHTML={{ __html: insight.content || '' }}
            />

            {/* Editor Info & Share Section */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between">
                {/* Editor Info */}
                {insight.author && (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {insight.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{insight.author}</div>
                      <div className="text-sm text-slate-500">SHIPDAGO Insights Editor</div>
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 mr-2">공유하기:</span>

                  {/* Facebook */}
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] hover:opacity-80 transition-opacity"
                    title="Facebook에 공유"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>

                  {/* Twitter/X */}
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black hover:opacity-80 transition-opacity"
                    title="X(Twitter)에 공유"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0A66C2] hover:opacity-80 transition-opacity"
                    title="LinkedIn에 공유"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>

                  {/* KakaoTalk */}
                  <button
                    onClick={() => handleShare('kakao')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FEE500] hover:opacity-80 transition-opacity"
                    title="카카오톡에 공유"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#000000" d="M12 3C6.48 3 2 6.59 2 10.86c0 2.77 1.87 5.2 4.69 6.56l-.78 2.84c-.06.22.16.4.37.3l3.16-1.9c.52.08 1.04.12 1.56.12 5.52 0 10-3.59 10-7.86S17.52 3 12 3zm-4.5 8.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                    </svg>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366] hover:opacity-80 transition-opacity"
                    title="WhatsApp에 공유"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => handleShare('telegram')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#26A5E4] hover:opacity-80 transition-opacity"
                    title="Telegram에 공유"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </button>

                  {/* Email */}
                  <button
                    onClick={() => handleShare('email')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-600 hover:opacity-80 transition-opacity"
                    title="이메일로 공유"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-600 hover:opacity-80 transition-opacity"
                    title="링크 복사"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedInsights.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-black text-slate-900 mb-8">관련 콘텐츠</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {relatedInsights.map(related => (
                <article
                  key={related.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                  onClick={() => onNavigateToInsight(related.id)}
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <img
                      src={getThumbnailUrl(related.imageUrl)}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-medium">
                        {related.tag}
                      </span>
                      <span className="text-xs text-slate-400">{related.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {related.title}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{formatViewCount(related.viewCount || 0)}</span>
                      </div>
                      <span className="text-blue-600 font-medium text-sm">
                        Read →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default InsightDetail;