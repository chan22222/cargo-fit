import React, { useState, useEffect } from 'react';
import { CommunityPost, hashPassword } from '../types/community';
import { db } from '../lib/supabase';

interface CommunityDetailProps {
  postId: string;
  onNavigateBack: () => void;
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({ postId, onNavigateBack }) => {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        const { data, error } = await db.communityPosts.getById(postId);
        if (error) {
          setLoading(false);
          return;
        }

        if (data) {
          setPost(data as CommunityPost);

          const viewCountKey = `viewed_post_${postId}`;
          const alreadyViewed = sessionStorage.getItem(viewCountKey);
          if (!alreadyViewed) {
            sessionStorage.setItem(viewCountKey, 'true');
            await db.communityPosts.incrementViewCount(postId);
          }
        }
      } catch (err) {
        // silently fail
      }
      setLoading(false);
    };

    loadPost();
    window.scrollTo(0, 0);
  }, [postId]);

  const handleDelete = async () => {
    setDeleteError('');
    if (!deletePassword.trim()) {
      setDeleteError('비밀번호를 입력해주세요.');
      return;
    }
    setDeleting(true);
    try {
      const passwordHash = hashPassword(deletePassword.trim());
      const isValid = await db.communityPosts.verifyPassword(postId, passwordHash);
      if (!isValid) {
        setDeleteError('비밀번호가 일치하지 않습니다.');
        setDeleting(false);
        return;
      }
      const { error } = await db.communityPosts.delete(postId);
      if (error) {
        setDeleteError('삭제에 실패했습니다. 다시 시도해주세요.');
        setDeleting(false);
        return;
      }
      onNavigateBack();
    } catch (err) {
      setDeleteError('오류가 발생했습니다.');
    }
    setDeleting(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-500 text-sm">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold mb-2">게시글을 찾을 수 없습니다</p>
          <button
            onClick={onNavigateBack}
            className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          {/* Post Header */}
          <div className="p-6 md:p-8 border-b border-slate-100">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 leading-tight">{post.title}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-semibold text-slate-700">{post.author_nickname}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.view_count}</span>
              </div>
            </div>
          </div>

          {/* Post Body */}
          <div className="p-6 md:p-8">
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap break-words text-[15px]">
              {post.content}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onNavigateBack}
            className="px-6 py-3 bg-white text-slate-700 text-sm font-bold rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            목록으로 돌아가기
          </button>
          <button
            onClick={() => { setShowDeleteModal(true); setDeletePassword(''); setDeleteError(''); }}
            className="px-6 py-3 bg-white text-red-500 text-sm font-bold rounded-xl border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all"
          >
            삭제
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-black text-slate-900 mb-2">게시글 삭제</h3>
            <p className="text-sm text-slate-500 mb-5">삭제하려면 게시글 작성 시 입력한 비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDelete()}
              placeholder="비밀번호"
              autoFocus
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all placeholder:text-slate-400"
            />
            {deleteError && (
              <p className="text-sm text-red-600 font-medium mt-2">{deleteError}</p>
            )}
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetail;
