import React, { useState } from 'react';
import { db } from '../lib/supabase';
import { hashPassword } from '../types/community';

interface CommunityWriteProps {
  onNavigateBack: () => void;
  onPostCreated: (id: string) => void;
}

const CommunityWrite: React.FC<CommunityWriteProps> = ({ onNavigateBack, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [authorNickname, setAuthorNickname] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!authorNickname.trim()) {
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
    if (authorNickname.trim().length > 20) {
      setError('닉네임은 20자 이내로 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (password.trim().length < 4) {
      setError('비밀번호는 4자 이상 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const passwordHash = hashPassword(password.trim());
      const { data, error: dbError } = await db.communityPosts.create({
        title: title.trim(),
        content: content.trim(),
        author_nickname: authorNickname.trim(),
        password_hash: passwordHash,
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
        onPostCreated(data[0].id);
      } else {
        onNavigateBack();
      }
    } catch (err) {
      console.error('[CommunityWrite] 게시글 작성 오류:', err);
      setError(`오류: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">글쓰기</h2>
            <p className="text-sm text-slate-500 mt-1">커뮤니티에 게시글을 작성해보세요.</p>
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

            {/* Nickname */}
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

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="삭제 시 필요한 비밀번호 (4자 이상)"
                maxLength={30}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400 mt-1">게시글 삭제 시 필요합니다.</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">내용</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={12}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

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
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityWrite;
