import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { CommunityPost, hashPassword } from '../types/community';

const RATE_LIMIT_KEY = 'community_post_submissions';
const COOLDOWN_KEY = 'community_post_cooldown';
const MAX_SUBMISSIONS_PER_HOUR = 3;
const COOLDOWN_MINUTES = 5;

const MEDIA_TAG_REGEX = /\[(img|video):([^\]]+)\]/g;
const ALLOWED_IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
const ALLOWED_VIDEO_HOSTS = /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//;
const ALLOWED_VIDEO_EXT = /\.(mp4|webm)(\?.*)?$/i;

const spamPatterns = [
  /(.)\1{10,}/,
  /\b(viagra|casino|lottery|prize|winner|crypto|bitcoin)\b/gi,
];

const hasRawUrl = (text: string): boolean => {
  const withoutTags = text.replace(MEDIA_TAG_REGEX, '');
  return /(http|https):\/\/[^\s]+/gi.test(withoutTags);
};

const validateMediaTags = (text: string): string | null => {
  let match;
  const regex = /\[(img|video):([^\]]+)\]/g;
  while ((match = regex.exec(text)) !== null) {
    const type = match[1];
    const url = match[2].trim();
    if (!/^https:\/\//.test(url)) {
      return `미디어 URL은 https://로 시작해야 합니다.`;
    }
    if (type === 'img' && !ALLOWED_IMAGE_EXT.test(url)) {
      return '이미지 URL은 jpg, png, gif, webp 형식만 지원합니다.';
    }
    if (type === 'video' && !ALLOWED_VIDEO_HOSTS.test(url) && !ALLOWED_VIDEO_EXT.test(url)) {
      return '동영상은 YouTube, Vimeo 링크 또는 mp4, webm 형식만 지원합니다.';
    }
  }
  return null;
};

const sanitize = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

interface CommunityWriteProps {
  onNavigateBack: () => void;
  onPostCreated: (id: string) => void;
  editPostId?: string;
  initialData?: CommunityPost;
}

const CommunityWrite: React.FC<CommunityWriteProps> = ({ onNavigateBack, onPostCreated, editPostId, initialData }) => {
  const isEditMode = !!editPostId;

  const [title, setTitle] = useState(initialData?.title || '');
  const [authorNickname, setAuthorNickname] = useState(initialData?.author_nickname || '');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(initialData?.content || '');
  const [isPrivate, setIsPrivate] = useState(initialData?.is_private || false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (isEditMode) return;
    const checkCooldown = () => {
      const cooldownUntil = localStorage.getItem(COOLDOWN_KEY);
      if (cooldownUntil) {
        const remaining = Math.ceil((parseInt(cooldownUntil) - Date.now()) / 1000);
        setCooldownRemaining(remaining > 0 ? remaining : 0);
        if (remaining <= 0) localStorage.removeItem(COOLDOWN_KEY);
      }
    };
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [isEditMode]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const submissions: number[] = stored ? JSON.parse(stored) : [];
    const recentSubmissions = submissions.filter(t => now - t < 60 * 60 * 1000);
    return recentSubmissions.length < MAX_SUBMISSIONS_PER_HOUR;
  };

  const recordSubmission = () => {
    const now = Date.now();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const submissions: number[] = stored ? JSON.parse(stored) : [];
    const recentSubmissions = submissions.filter(t => now - t < 60 * 60 * 1000);
    recentSubmissions.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentSubmissions));
    localStorage.setItem(COOLDOWN_KEY, (now + COOLDOWN_MINUTES * 60 * 1000).toString());
    setCooldownRemaining(COOLDOWN_MINUTES * 60);
  };

  const checkSpam = (text: string): boolean => {
    return spamPatterns.some(pattern => pattern.test(text));
  };

  const handleSubmit = async () => {
    setError('');

    if (!isEditMode) {
      if (cooldownRemaining > 0) {
        const min = Math.floor(cooldownRemaining / 60);
        const sec = cooldownRemaining % 60;
        setError(`잠시 후 다시 시도해주세요. (${min}분 ${sec}초 남음)`);
        return;
      }
      if (!checkRateLimit()) {
        setError('너무 많은 글을 작성했습니다. 1시간 후에 다시 시도해주세요.');
        return;
      }
    }

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!isEditMode && !authorNickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }
    if (title.trim().length > 100) {
      setError('제목은 100자 이내로 입력해주세요.');
      return;
    }
    if (!isEditMode && authorNickname.trim().length > 20) {
      setError('닉네임은 20자 이내로 입력해주세요.');
      return;
    }
    if (!isEditMode && !password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (!isEditMode && password.trim().length < 4) {
      setError('비밀번호는 4자 이상 입력해주세요.');
      return;
    }
    if (content.trim().length < 5) {
      setError('내용은 5자 이상 입력해주세요.');
      return;
    }

    if (checkSpam(title) || checkSpam(content)) {
      setError('부적절한 내용이 포함되어 있습니다.');
      return;
    }

    if (hasRawUrl(content)) {
      setError('본문에 직접 URL을 입력할 수 없습니다. 이미지/동영상 버튼을 사용해주세요.');
      return;
    }

    const mediaError = validateMediaTags(content);
    if (mediaError) {
      setError(mediaError);
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        const { data, error: dbError } = await db.communityPosts.update(editPostId, {
          title: sanitize(title.trim()),
          content: sanitize(content.trim()),
          is_private: isPrivate,
        });

        if (dbError) {
          const msg = typeof dbError === 'object' && dbError !== null && 'message' in dbError
            ? (dbError as { message: string }).message
            : '알 수 없는 오류';
          setError(`수정 실패: ${msg}`);
          setSubmitting(false);
          return;
        }

        onPostCreated(editPostId);
      } else {
        const passwordHash = hashPassword(password.trim());
        const { data, error: dbError } = await db.communityPosts.create({
          title: sanitize(title.trim()),
          content: sanitize(content.trim()),
          author_nickname: sanitize(authorNickname.trim()),
          password_hash: passwordHash,
          is_private: isPrivate,
        });

        if (dbError) {
          const msg = typeof dbError === 'object' && dbError !== null && 'message' in dbError
            ? (dbError as { message: string }).message
            : '알 수 없는 오류';
          setError(`작성 실패: ${msg}`);
          setSubmitting(false);
          return;
        }

        if (data && data[0]) {
          recordSubmission();
          onPostCreated(data[0].id);
        } else {
          onNavigateBack();
        }
      }
    } catch (err) {
      setError(`오류: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
              {isEditMode ? '글 수정' : '글쓰기'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEditMode ? '게시글을 수정합니다.' : '커뮤니티에 게시글을 작성해보세요.'}
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">제목</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="게시글 제목을 입력하세요"
                maxLength={100}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{title.length}/100</p>
            </div>

            {/* Nickname - 신규 작성 시에만 */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">닉네임</label>
                <input
                  type="text"
                  value={authorNickname}
                  onChange={e => setAuthorNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{authorNickname.length}/20</p>
              </div>
            )}

            {/* Password - 신규 작성 시에만 */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="수정/삭제 시 필요한 비밀번호 (4자 이상)"
                  maxLength={30}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1">게시글 수정/삭제 시 필요합니다.</p>
              </div>
            )}

            {/* Content */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">내용</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('이미지 URL을 입력하세요 (https://로 시작, jpg/png/gif/webp)');
                    if (url?.trim()) setContent(prev => prev + `\n[img:${url.trim()}]\n`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  이미지
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('동영상 URL을 입력하세요 (YouTube, Vimeo 또는 mp4/webm)');
                    if (url?.trim()) setContent(prev => prev + `\n[video:${url.trim()}]\n`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  동영상
                </button>
                <span className="text-xs text-slate-400">URL 링크로 첨부</span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={12}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Private Toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={e => setIsPrivate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform"></div>
              </div>
              <div>
                <span className="text-sm font-bold text-slate-700">비밀글</span>
                <p className="text-xs text-slate-400">비밀번호를 아는 사람만 열람할 수 있습니다.</p>
              </div>
            </label>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onNavigateBack}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || (!isEditMode && cooldownRemaining > 0)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? (isEditMode ? '수정 중...' : '등록 중...')
                  : (!isEditMode && cooldownRemaining > 0)
                    ? `대기 중 (${Math.floor(cooldownRemaining / 60)}:${String(cooldownRemaining % 60).padStart(2, '0')})`
                    : (isEditMode ? '수정하기' : '등록하기')
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityWrite;
