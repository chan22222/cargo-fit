import React, { useState } from 'react';
import { FeedbackFormData, FeedbackType } from '../types/feedback';
import { db } from '../lib/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    name: '',
    email: '',
    contact: '',
    organization: '',
    message: '',
    type: 'feedback' as FeedbackType
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.message) {
      setSubmitMessage('이름, 이메일, 메시지는 필수 입력 항목입니다.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const { error } = await db.feedbacks.create(feedbackForm);

      if (!error) {
        setSubmitMessage('피드백이 성공적으로 전송되었습니다. 감사합니다!');
        setTimeout(() => {
          setFeedbackForm({
            name: '',
            email: '',
            contact: '',
            organization: '',
            message: '',
            type: 'feedback' as FeedbackType
          });
          setSubmitMessage('');
          onClose();
        }, 2000);
      } else {
        setSubmitMessage('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitMessage('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 mb-2">피드백 & 제안</h2>
          <p className="text-sm text-slate-600">
            SHIPDAGO 서비스에 대한 의견을 들려주세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="이름 *"
              value={feedbackForm.name}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSubmitting}
              required
            />
            <input
              type="email"
              placeholder="이메일 *"
              value={feedbackForm.email}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="연락처 (선택)"
              value={feedbackForm.contact}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, contact: e.target.value })}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSubmitting}
            />
            <input
              type="text"
              placeholder="기관/회사명 (선택)"
              value={feedbackForm.organization}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, organization: e.target.value })}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSubmitting}
            />
          </div>

          <select
            value={feedbackForm.type}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value as FeedbackType })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isSubmitting}
          >
            <option value="feedback">일반 피드백</option>
            <option value="suggestion">기능 제안</option>
            <option value="bug">버그 신고</option>
            <option value="feature">기능 요청</option>
            <option value="question">문의사항</option>
            <option value="partnership">제휴/협업 제안</option>
            <option value="other">기타</option>
          </select>

          <textarea
            placeholder="메시지를 입력하세요 * (자세히 작성해주시면 더 좋은 답변을 드릴 수 있습니다)"
            value={feedbackForm.message}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
            rows={6}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            disabled={isSubmitting}
            required
          />

          {submitMessage && (
            <p className={`text-sm ${submitMessage.includes('성공') ? 'text-green-600' : 'text-red-600'} text-center`}>
              {submitMessage}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '전송 중...' : '전송하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;