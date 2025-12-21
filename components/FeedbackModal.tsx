import React, { useState, useEffect } from 'react';
import { FeedbackFormData, FeedbackType } from '../types/feedback';
import { db } from '../lib/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Rate limiting constants
const RATE_LIMIT_KEY = 'feedback_submissions';
const COOLDOWN_KEY = 'feedback_cooldown';
const MAX_SUBMISSIONS_PER_HOUR = 3;
const COOLDOWN_MINUTES = 5;
const MESSAGE_MAX_LENGTH = 1000;

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
  const [honeypot, setHoneypot] = useState(''); // Bot detection field
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Check cooldown on component mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      checkCooldown();
    }
  }, [isOpen]);

  // Update cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const checkCooldown = () => {
    const cooldownEnd = localStorage.getItem(COOLDOWN_KEY);
    if (cooldownEnd) {
      const remaining = Math.ceil((parseInt(cooldownEnd) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldownRemaining(remaining);
      } else {
        localStorage.removeItem(COOLDOWN_KEY);
      }
    }
  };

  const checkRateLimit = () => {
    const submissions = localStorage.getItem(RATE_LIMIT_KEY);
    if (submissions) {
      let parsedSubmissions;
      try {
        parsedSubmissions = JSON.parse(submissions);
        // Ensure it's an array
        if (!Array.isArray(parsedSubmissions)) {
          parsedSubmissions = [];
          localStorage.removeItem(RATE_LIMIT_KEY);
        }
      } catch (e) {
        // If parsing fails, reset
        parsedSubmissions = [];
        localStorage.removeItem(RATE_LIMIT_KEY);
      }

      const hourAgo = Date.now() - (60 * 60 * 1000);

      // Filter out submissions older than 1 hour
      const recentSubmissions = parsedSubmissions.filter((time: number) => time > hourAgo);

      if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
        return false;
      }

      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentSubmissions));
    }
    return true;
  };

  const recordSubmission = () => {
    const submissions = localStorage.getItem(RATE_LIMIT_KEY);
    const currentSubmissions = submissions ? JSON.parse(submissions) : [];
    currentSubmissions.push(Date.now());
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(currentSubmissions));

    // Set cooldown
    const cooldownEnd = Date.now() + (COOLDOWN_MINUTES * 60 * 1000);
    localStorage.setItem(COOLDOWN_KEY, cooldownEnd.toString());
    setCooldownRemaining(COOLDOWN_MINUTES * 60);
  };

  const sanitizeInput = (input: string): string => {
    // Remove potential XSS threats
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .slice(0, MESSAGE_MAX_LENGTH);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bot detection - if honeypot field is filled, reject silently
    if (honeypot) {
      setSubmitMessage('피드백이 성공적으로 전송되었습니다. 감사합니다!');
      setTimeout(() => onClose(), 2000);
      return;
    }

    // Check cooldown
    if (cooldownRemaining > 0) {
      setSubmitMessage(`잠시 후 다시 시도해주세요. (${Math.floor(cooldownRemaining / 60)}분 ${cooldownRemaining % 60}초 남음)`);
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      setSubmitMessage('너무 많은 요청을 보내셨습니다. 1시간 후에 다시 시도해주세요.');
      return;
    }

    // Validate required fields
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.message) {
      setSubmitMessage('이름, 이메일, 메시지는 필수 입력 항목입니다.');
      return;
    }

    // Validate email format
    if (!validateEmail(feedbackForm.email)) {
      setSubmitMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    // Validate message length
    if (feedbackForm.message.length < 10) {
      setSubmitMessage('메시지는 최소 10자 이상 입력해주세요.');
      return;
    }

    if (feedbackForm.message.length > MESSAGE_MAX_LENGTH) {
      setSubmitMessage(`메시지는 ${MESSAGE_MAX_LENGTH}자를 초과할 수 없습니다.`);
      return;
    }

    // Check for spam patterns
    const spamPatterns = [
      /(.)\1{10,}/,  // Same character repeated 10+ times
      /(http|https):\/\/[^\s]+/gi,  // URLs (optional - remove if links are allowed)
      /\b(viagra|casino|lottery|prize|winner)\b/gi  // Common spam words
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(feedbackForm.message)) {
        setSubmitMessage('부적절한 내용이 포함되어 있습니다. 다시 작성해주세요.');
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Sanitize all inputs before submission
      const sanitizedForm = {
        ...feedbackForm,
        name: sanitizeInput(feedbackForm.name).slice(0, 100),
        email: sanitizeInput(feedbackForm.email).slice(0, 100),
        contact: sanitizeInput(feedbackForm.contact).slice(0, 50),
        organization: sanitizeInput(feedbackForm.organization).slice(0, 100),
        message: sanitizeInput(feedbackForm.message)
      };

      const { error } = await db.feedbacks.create(sanitizedForm);

      if (!error) {
        recordSubmission(); // Record successful submission for rate limiting
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
              maxLength={100}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSubmitting || cooldownRemaining > 0}
              required
            />
            <input
              type="email"
              placeholder="이메일 *"
              value={feedbackForm.email}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
              maxLength={100}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSubmitting || cooldownRemaining > 0}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="연락처 (선택)"
              value={feedbackForm.contact}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, contact: e.target.value })}
              maxLength={50}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSubmitting || cooldownRemaining > 0}
            />
            <input
              type="text"
              placeholder="기관/회사명 (선택)"
              value={feedbackForm.organization}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, organization: e.target.value })}
              maxLength={100}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSubmitting || cooldownRemaining > 0}
            />
          </div>

          <select
            value={feedbackForm.type}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value as FeedbackType })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isSubmitting || cooldownRemaining > 0}
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
            maxLength={MESSAGE_MAX_LENGTH}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            disabled={isSubmitting || cooldownRemaining > 0}
            required
          />

          {/* Character counter */}
          <div className="text-right text-xs text-slate-500">
            {feedbackForm.message.length} / {MESSAGE_MAX_LENGTH}자
          </div>

          {/* Honeypot field - hidden from users */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ position: 'absolute', left: '-9999px' }}
            tabIndex={-1}
            autoComplete="off"
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
              disabled={isSubmitting || cooldownRemaining > 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '전송 중...' : cooldownRemaining > 0 ? `대기 중 (${Math.floor(cooldownRemaining / 60)}:${(cooldownRemaining % 60).toString().padStart(2, '0')})` : '전송하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;