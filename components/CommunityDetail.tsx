import React, { useState, useEffect } from 'react';
import { CommunityPost, CommunityComment, hashPassword } from '../types/community';
import { db } from '../lib/supabase';

interface CommunityDetailProps {
  postId: string;
  onNavigateBack: () => void;
  onNavigateToEdit: (id: string, post: CommunityPost) => void;
  leftSideAdSlot?: React.ReactNode;
  rightSideAdSlot?: React.ReactNode;
}

const CommunityDetail: React.FC<CommunityDetailProps> = ({ postId, onNavigateBack, onNavigateToEdit, leftSideAdSlot, rightSideAdSlot }) => {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privateUnlocked, setPrivateUnlocked] = useState(false);
  const [modalPassword, setModalPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentNickname, setCommentNickname] = useState('');
  const [commentPassword, setCommentPassword] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [deleteCommentPw, setDeleteCommentPw] = useState('');
  const [deleteCommentError, setDeleteCommentError] = useState('');

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
          const postData = data as CommunityPost;
          setPost(postData);

          if (postData.is_private) {
            setShowPrivateModal(true);
          }

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
    loadComments();
    window.scrollTo(0, 0);
  }, [postId]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const { data, error } = await db.communityComments.getByPostId(postId);
      if (!error && data) {
        setComments(data as CommunityComment[]);
      }
    } catch (err) {
      // silently fail
    }
    setCommentsLoading(false);
  };

  const commentSpamPatterns = [/(.)\1{10,}/, /\b(viagra|casino|lottery|prize|winner|crypto|bitcoin)\b/gi];

  const sanitizeComment = (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const handleCommentSubmit = async () => {
    setCommentError('');
    if (!commentNickname.trim()) { setCommentError('닉네임을 입력해주세요.'); return; }
    if (commentNickname.trim().length > 20) { setCommentError('닉네임은 20자 이내로 입력해주세요.'); return; }
    if (!commentPassword.trim()) { setCommentError('비밀번호를 입력해주세요.'); return; }
    if (!commentContent.trim()) { setCommentError('댓글 내용을 입력해주세요.'); return; }
    if (commentContent.trim().length < 2) { setCommentError('댓글은 2자 이상 입력해주세요.'); return; }
    if (commentContent.trim().length > 500) { setCommentError('댓글은 500자 이내로 작성해주세요.'); return; }

    if (commentSpamPatterns.some(p => p.test(commentContent))) {
      setCommentError('스팸으로 감지되었습니다. 내용을 수정해주세요.');
      return;
    }

    const now = Date.now();
    const lastComment = parseInt(localStorage.getItem('lastCommentTime') || '0');
    if (now - lastComment < 30 * 1000) {
      setCommentError('댓글은 30초에 한 번만 작성할 수 있습니다.');
      return;
    }

    const hourKey = 'comment_submissions_hour';
    let hourData: { count: number; reset: number } = { count: 0, reset: now + 3600000 };
    try {
      const saved = JSON.parse(localStorage.getItem(hourKey) || '{}');
      if (saved.reset && saved.reset > now) { hourData = saved; }
    } catch { /* ignore */ }
    if (hourData.count >= 10) {
      setCommentError('댓글을 너무 많이 작성했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setCommentSubmitting(true);
    try {
      const passwordHash = hashPassword(commentPassword.trim());
      const { error } = await db.communityComments.create({
        post_id: postId,
        content: sanitizeComment(commentContent.trim()),
        author_nickname: sanitizeComment(commentNickname.trim()),
        password_hash: passwordHash
      });
      if (error) {
        setCommentError('댓글 등록에 실패했습니다.');
        setCommentSubmitting(false);
        return;
      }
      localStorage.setItem('lastCommentTime', now.toString());
      hourData.count++;
      localStorage.setItem(hourKey, JSON.stringify(hourData));
      setCommentContent('');
      await loadComments();
    } catch (err) {
      setCommentError('오류가 발생했습니다.');
    }
    setCommentSubmitting(false);
  };

  const handleDeleteComment = async () => {
    setDeleteCommentError('');
    if (!deleteCommentPw.trim()) { setDeleteCommentError('비밀번호를 입력해주세요.'); return; }
    if (!deleteCommentId) return;
    try {
      const passwordHash = hashPassword(deleteCommentPw.trim());
      const isValid = await db.communityComments.verifyPassword(deleteCommentId, passwordHash);
      if (!isValid) { setDeleteCommentError('비밀번호가 일치하지 않습니다.'); return; }
      const { error } = await db.communityComments.delete(deleteCommentId);
      if (error) { setDeleteCommentError('삭제에 실패했습니다.'); return; }
      setDeleteCommentId(null);
      setDeleteCommentPw('');
      await loadComments();
    } catch (err) {
      setDeleteCommentError('오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    setModalError('');
    if (!modalPassword.trim()) {
      setModalError('비밀번호를 입력해주세요.');
      return;
    }
    setDeleting(true);
    try {
      const passwordHash = hashPassword(modalPassword.trim());
      const isValid = await db.communityPosts.verifyPassword(postId, passwordHash);
      if (!isValid) {
        setModalError('비밀번호가 일치하지 않습니다.');
        setDeleting(false);
        return;
      }
      const { error } = await db.communityPosts.delete(postId);
      if (error) {
        setModalError('삭제에 실패했습니다. 다시 시도해주세요.');
        setDeleting(false);
        return;
      }
      onNavigateBack();
    } catch (err) {
      setModalError('오류가 발생했습니다.');
    }
    setDeleting(false);
  };

  const handleEditVerify = async () => {
    setModalError('');
    if (!modalPassword.trim()) {
      setModalError('비밀번호를 입력해주세요.');
      return;
    }
    try {
      const passwordHash = hashPassword(modalPassword.trim());
      const isValid = await db.communityPosts.verifyPassword(postId, passwordHash);
      if (!isValid) {
        setModalError('비밀번호가 일치하지 않습니다.');
        return;
      }
      setShowEditModal(false);
      if (post) onNavigateToEdit(postId, post);
    } catch (err) {
      setModalError('오류가 발생했습니다.');
    }
  };

  const handlePrivateVerify = async () => {
    setModalError('');
    if (!modalPassword.trim()) {
      setModalError('비밀번호를 입력해주세요.');
      return;
    }
    try {
      const passwordHash = hashPassword(modalPassword.trim());
      const isValid = await db.communityPosts.verifyPassword(postId, passwordHash);
      if (!isValid) {
        setModalError('비밀번호가 일치하지 않습니다.');
        return;
      }
      setShowPrivateModal(false);
      setPrivateUnlocked(true);
    } catch (err) {
      setModalError('오류가 발생했습니다.');
    }
  };

  const openModal = (type: 'delete' | 'edit') => {
    setModalPassword('');
    setModalError('');
    if (type === 'delete') {
      setShowDeleteModal(true);
      setShowEditModal(false);
    } else {
      setShowEditModal(true);
      setShowDeleteModal(false);
    }
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

  const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(\[(?:img|video):[^\]]+\])/g);
    return parts.map((part, i) => {
      const imgMatch = part.match(/^\[img:([^\]]+)\]$/);
      if (imgMatch) {
        return (
          <img
            key={i}
            src={imgMatch[1].trim()}
            alt="첨부 이미지"
            className="max-w-full rounded-xl my-4 border border-slate-200"
            loading="lazy"
          />
        );
      }
      const videoMatch = part.match(/^\[video:([^\]]+)\]$/);
      if (videoMatch) {
        const url = videoMatch[1].trim();
        const ytId = getYouTubeId(url);
        if (ytId) {
          return (
            <div key={i} className="aspect-video my-4 rounded-xl overflow-hidden border border-slate-200">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                className="w-full h-full"
                allowFullScreen
                title="YouTube 동영상"
              />
            </div>
          );
        }
        return (
          <video key={i} src={url} controls className="max-w-full rounded-xl my-4 border border-slate-200">
            동영상을 재생할 수 없습니다.
          </video>
        );
      }
      return part ? <span key={i}>{part}</span> : null;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-500 text-sm">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
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

  const isPrivateAndLocked = post.is_private && !privateUnlocked;

  return (
    <div className="flex-1 overflow-visible bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              SHIPDAGO COMMUNITY
            </span>
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              커뮤니티
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              물류 실무자들의 소통 공간. 자유롭게 정보를 공유하고 의견을 나눠보세요.
            </p>
          </div>
        </div>
      </header>

      {/* Content with Side Ads */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex gap-6">
          {leftSideAdSlot && (
            <div className="hidden md:block w-40 shrink-0">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ minHeight: '600px', maxHeight: '800px' }}>
                {leftSideAdSlot}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          {/* Post Header */}
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              {post.is_private && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  비밀글
                </span>
              )}
            </div>
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
            {isPrivateAndLocked ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-slate-600 font-semibold mb-2">비밀글입니다</p>
                <p className="text-slate-400 text-sm mb-4">내용을 확인하려면 비밀번호를 입력하세요.</p>
                <button
                  onClick={() => { setShowPrivateModal(true); setModalPassword(''); setModalError(''); }}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  비밀번호 입력
                </button>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap break-words text-[15px]">
                {renderContent(post.content)}
              </div>
            )}
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
            onClick={() => openModal('edit')}
            className="px-6 py-3 bg-white text-blue-600 text-sm font-bold rounded-xl border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            수정
          </button>
          <button
            onClick={() => openModal('delete')}
            className="px-6 py-3 bg-white text-red-500 text-sm font-bold rounded-xl border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all"
          >
            삭제
          </button>
        </div>

        {/* Comments Section */}
        {!isPrivateAndLocked && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  댓글 {comments.length > 0 && <span className="text-sm font-semibold text-blue-600">{comments.length}</span>}
                </h3>
              </div>

              {/* Comment List */}
              <div className="divide-y divide-slate-50">
                {commentsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-400">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-bold text-slate-800">{comment.author_nickname}</span>
                            <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap break-words leading-relaxed">{comment.content}</p>
                        </div>
                        <button
                          onClick={() => { setDeleteCommentId(comment.id); setDeleteCommentPw(''); setDeleteCommentError(''); }}
                          className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Form */}
              <div className="p-5 bg-slate-50/80 border-t border-slate-100">
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={commentNickname}
                    onChange={e => setCommentNickname(e.target.value)}
                    placeholder="닉네임"
                    maxLength={20}
                    className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                  <input
                    type="password"
                    value={commentPassword}
                    onChange={e => setCommentPassword(e.target.value)}
                    placeholder="비밀번호"
                    maxLength={20}
                    className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="flex gap-3">
                  <textarea
                    value={commentContent}
                    onChange={e => setCommentContent(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    maxLength={500}
                    rows={2}
                    className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
                  />
                  <button
                    onClick={handleCommentSubmit}
                    disabled={commentSubmitting}
                    className="self-end shrink-0 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {commentSubmitting ? '등록 중...' : '등록'}
                  </button>
                </div>
                {commentError && (
                  <p className="text-xs text-red-600 font-medium mt-2">{commentError}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">{commentContent.length}/500</p>
              </div>
            </div>
          </div>
        )}
            </div>
          </div>
          {rightSideAdSlot && (
            <div className="hidden md:block w-40 shrink-0">
              <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ minHeight: '600px', maxHeight: '800px' }}>
                {rightSideAdSlot}
              </div>
            </div>
          )}
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
              value={modalPassword}
              onChange={e => setModalPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDelete()}
              placeholder="비밀번호"
              autoFocus
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all placeholder:text-slate-400"
            />
            {modalError && (
              <p className="text-sm text-red-600 font-medium mt-2">{modalError}</p>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-black text-slate-900 mb-2">게시글 수정</h3>
            <p className="text-sm text-slate-500 mb-5">수정하려면 게시글 작성 시 입력한 비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={modalPassword}
              onChange={e => setModalPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEditVerify()}
              placeholder="비밀번호"
              autoFocus
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            {modalError && (
              <p className="text-sm text-blue-600 font-medium mt-2">{modalError}</p>
            )}
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleEditVerify}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Delete Modal */}
      {deleteCommentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-black text-slate-900 mb-2">댓글 삭제</h3>
            <p className="text-sm text-slate-500 mb-5">삭제하려면 댓글 작성 시 입력한 비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={deleteCommentPw}
              onChange={e => setDeleteCommentPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDeleteComment()}
              placeholder="비밀번호"
              autoFocus
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all placeholder:text-slate-400"
            />
            {deleteCommentError && (
              <p className="text-sm text-red-600 font-medium mt-2">{deleteCommentError}</p>
            )}
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setDeleteCommentId(null)}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteComment}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Private Access Modal */}
      {showPrivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-black text-slate-900 mb-2">비밀글</h3>
            <p className="text-sm text-slate-500 mb-5">이 게시글은 비밀글입니다. 비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={modalPassword}
              onChange={e => setModalPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePrivateVerify()}
              placeholder="비밀번호"
              autoFocus
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
            {modalError && (
              <p className="text-sm text-red-600 font-medium mt-2">{modalError}</p>
            )}
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => { setShowPrivateModal(false); onNavigateBack(); }}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                돌아가기
              </button>
              <button
                onClick={handlePrivateVerify}
                className="px-5 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetail;
