import React, { useState, useEffect } from 'react';
import { Insight } from '../types/insights';
import { db } from '../lib/supabase';

interface InsightsListProps {
  onNavigateToInsight: (id: string) => void;
  onNavigateBack: () => void;
}

const InsightsList: React.FC<InsightsListProps> = ({ onNavigateToInsight, onNavigateBack }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const { data, error } = await db.insights.getAll();
        if (error) {
          console.error('Error loading insights:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const formattedInsights = data
            .filter((item: any) => item.published)
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
          setInsights(formattedInsights);
        }
      } catch (error) {
        console.error('Error loading insights:', error);
      }
      setLoading(false);
    };

    loadInsights();

    // Restore scroll position
    const scrollPos = sessionStorage.getItem('insightsListScrollPos');
    if (scrollPos) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPos));
        sessionStorage.removeItem('insightsListScrollPos');
      }, 100);
    }
  }, []);

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleInsightClick = (id: string) => {
    sessionStorage.setItem('insightsListScrollPos', window.scrollY.toString());
    onNavigateToInsight(id);
  };

  const tags = ['all', 'Logistics', 'Tech', 'Sustainability', 'Market', 'Policy', 'Innovation'];
  const filteredInsights = selectedTag === 'all'
    ? insights
    : insights.filter(insight => insight.tag === selectedTag);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Top Banner with Logo */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">홈으로</span>
            </button>

            {/* Logo */}
            <div
              onClick={onNavigateBack}
              className="flex items-center gap-2 md:gap-4 cursor-pointer group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center font-black text-white text-xl md:text-2xl shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg width="20" height="20" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.9"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-none">SHIPDAGO</h1>
                <p className="text-[9px] md:text-[10px] text-slate-500 font-medium tracking-wide mt-0.5 md:mt-1 flex items-center gap-1 md:gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Container Loading Tool
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <header className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              SHIPDAGO INSIGHTS
            </span>
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              글로벌 물류 트렌드
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              물류 산업의 최신 동향과 혁신적인 인사이트를 만나보세요
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold">{insights.length}</div>
              <div className="text-blue-100 text-sm">총 아티클</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {formatViewCount(insights.reduce((sum, i) => sum + (i.viewCount || 0), 0))}
              </div>
              <div className="text-blue-100 text-sm">총 조회수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{[...new Set(insights.map(i => i.tag))].length}</div>
              <div className="text-blue-100 text-sm">카테고리</div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Tags */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tag === 'all' ? '전체' : tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 text-lg">아직 게시된 인사이트가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {filteredInsights[0] && (
              <div
                className="mb-12 bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group"
                onClick={() => handleInsightClick(filteredInsights[0].id)}
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <img
                      src={filteredInsights[0].imageUrl}
                      alt={filteredInsights[0].title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-wide">
                        Featured
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {filteredInsights[0].tag}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {filteredInsights[0].title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{filteredInsights[0].date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {formatViewCount(filteredInsights[0].viewCount || 0)}
                      </span>
                    </div>
                    <button className="mt-6 inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all">
                      자세히 보기
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Article Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredInsights.slice(1).map(insight => (
                <article
                  key={insight.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleInsightClick(insight.id)}
                >
                  {/* Image */}
                  <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <img
                      src={insight.imageUrl}
                      alt={insight.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Tag and Date */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-medium">
                        {insight.tag}
                      </span>
                      <span className="text-xs text-slate-400">{insight.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {insight.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{formatViewCount(insight.viewCount || 0)}</span>
                      </div>

                      {/* Read More */}
                      <span className="text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Read →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default InsightsList;