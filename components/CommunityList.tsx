import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../types/community';
import { db } from '../lib/supabase';

interface CommunityListProps {
  onNavigateToPost: (id: string) => void;
  onNavigateToWrite: () => void;
  onNavigateBack: () => void;
}

const CommunityList: React.FC<CommunityListProps> = ({ onNavigateToPost, onNavigateToWrite, onNavigateBack }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const { data, error, count } = await db.communityPosts.getAll(currentPage, postsPerPage);
        if (error) {
          setLoading(false);
          return;
        }
        if (data) {
          setPosts(data as CommunityPost[]);
          setTotalCount(count || 0);
        }
      } catch (err) {
        // silently fail
      }
      setLoading(false);
    };

    loadPosts();

    const scrollPos = sessionStorage.getItem('communityListScrollPos');
    if (scrollPos) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPos));
        sessionStorage.removeItem('communityListScrollPos');
      }, 100);
    }
  }, [currentPage]);

  const handlePostClick = (id: string) => {
    sessionStorage.setItem('communityListScrollPos', window.scrollY.toString());
    onNavigateToPost(id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));

    if (diffHours < 1) return '방금 전';
    if (diffHours < 24) return `${diffHours}시간 전`;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (year === now.getFullYear()) return `${month}.${day}`;
    return `${year}.${month}.${day}`;
  };

  const totalPages = Math.ceil(totalCount / postsPerPage);

  const getRowNumber = (index: number) => {
    return totalCount - ((currentPage - 1) * postsPerPage + index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-blue-200 uppercase tracking-wider">Community</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">커뮤니티</h2>
          <p className="text-blue-100 text-lg max-w-xl">물류 실무자들의 소통 공간. 자유롭게 정보를 공유하고 의견을 나눠보세요.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            총 <span className="font-bold text-slate-800">{totalCount}</span>개의 게시글
          </p>
          <button
            onClick={onNavigateToWrite}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all active:scale-95"
          >
            글쓰기
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-500 text-sm">게시글을 불러오는 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-semibold mb-2">아직 게시글이 없습니다</p>
            <p className="text-slate-400 text-sm mb-6">첫 번째 게시글을 작성해보세요!</p>
            <button
              onClick={onNavigateToWrite}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              글쓰기
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">번호</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">제목</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-28 text-center">작성자</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 text-center">날짜</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20 text-center">조회</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post, index) => (
                    <tr
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="border-b border-slate-50 hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 text-sm text-slate-400 text-center">{getRowNumber(index)}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1">
                          {post.title}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-500 text-center">{post.author_nickname}</td>
                      <td className="py-3.5 px-4 text-sm text-slate-400 text-center">{formatDate(post.created_at)}</td>
                      <td className="py-3.5 px-4 text-sm text-slate-400 text-center">{post.view_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 active:bg-slate-50 cursor-pointer transition-colors"
                >
                  <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-medium text-slate-500">{post.author_nickname}</span>
                    <span>{formatDate(post.created_at)}</span>
                    <span>조회 {post.view_count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 text-sm font-bold rounded-lg transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityList;
