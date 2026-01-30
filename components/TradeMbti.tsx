import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  MBTI_QUESTIONS,
  MBTI_PROFILES,
  INCOTERMS_ORDER,
  calculateResult,
  type MbtiProfile,
} from '../data/tradeMbtiQuestions';

interface TradeMbtiProps {
  leftSideAdSlot?: React.ReactNode;
  rightSideAdSlot?: React.ReactNode;
}

type Phase = 'intro' | 'question' | 'result';

const OPTION_COLORS = [
  { bg: 'bg-amber-50', border: 'border-amber-300', hover: 'hover:border-amber-400 hover:bg-amber-100', selected: 'border-amber-500 bg-amber-100 ring-2 ring-amber-300', label: 'bg-amber-500', text: 'text-amber-700' },
  { bg: 'bg-sky-50', border: 'border-sky-300', hover: 'hover:border-sky-400 hover:bg-sky-100', selected: 'border-sky-500 bg-sky-100 ring-2 ring-sky-300', label: 'bg-sky-500', text: 'text-sky-700' },
  { bg: 'bg-emerald-50', border: 'border-emerald-300', hover: 'hover:border-emerald-400 hover:bg-emerald-100', selected: 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300', label: 'bg-emerald-500', text: 'text-emerald-700' },
  { bg: 'bg-rose-50', border: 'border-rose-300', hover: 'hover:border-rose-400 hover:bg-rose-100', selected: 'border-rose-500 bg-rose-100 ring-2 ring-rose-300', label: 'bg-rose-500', text: 'text-rose-700' },
];

const DIMENSION_LABELS: Record<string, string> = {
  control: '통제권',
  risk: '위험 선호',
  cost: '비용 태도',
  logistics: '물류 참여',
  relationship: '파트너 관계',
};

export default function TradeMbti({
  leftSideAdSlot,
  rightSideAdSlot,
}: TradeMbtiProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [resultCode, setResultCode] = useState<string>('');
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const totalQuestions = MBTI_QUESTIONS.length;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    if (typeParam) {
      const upperCode = typeParam.toUpperCase();
      if (MBTI_PROFILES[upperCode]) {
        setResultCode(upperCode);
        setPhase('result');
      }
    }
  }, []);

  useEffect(() => {
    if (phase === 'intro') {
      const t = setTimeout(() => setIntroVisible(true), 100);
      return () => clearTimeout(t);
    }
    setIntroVisible(false);
  }, [phase]);

  useEffect(() => {
    if (phase === 'result') {
      const t = setTimeout(() => setShowResult(true), 200);
      return () => clearTimeout(t);
    }
    setShowResult(false);
  }, [phase]);

  const handleStart = useCallback(() => {
    setPhase('question');
    setCurrentQ(0);
    setAnswers([]);
    setResultCode('');
    setSlideDir('left');
  }, []);

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (animating) return;

      const newAnswers = [...answers];
      newAnswers[currentQ] = optionIndex;
      setAnswers(newAnswers);
      setAnimating(true);
      setSlideDir('left');

      setTimeout(() => {
        if (currentQ + 1 < totalQuestions) {
          setCurrentQ(currentQ + 1);
        } else {
          const code = calculateResult(newAnswers);
          setResultCode(code);
          setPhase('result');
        }
        setAnimating(false);
      }, 400);
    },
    [animating, answers, currentQ, totalQuestions]
  );

  const handlePrev = useCallback(() => {
    if (currentQ > 0 && !animating) {
      setSlideDir('right');
      setAnimating(true);
      setTimeout(() => {
        setCurrentQ(currentQ - 1);
        setAnimating(false);
      }, 300);
    }
  }, [currentQ, animating]);

  const handleRestart = useCallback(() => {
    setPhase('intro');
    setCurrentQ(0);
    setAnswers([]);
    setResultCode('');
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const profile: MbtiProfile | null = resultCode
    ? MBTI_PROFILES[resultCode]
    : null;

  const SHARE_URL = profile
    ? `https://www.shipdago.com/share/${profile.code}`
    : 'https://www.shipdago.com/trade-mbti';

  const getShareText = () =>
    profile
      ? `나의 물류 유형은 ${profile.code} - ${profile.nickname}! 나도 테스트해보기`
      : '나의 물류 유형을 알아보세요!';

  const execCopy = (text: string) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // copy failed
    }
  };

  const shareToKakao = () => {
    const text = `${getShareText()}\n${SHARE_URL}`;
    if (navigator.share) {
      navigator.share({ title: 'Trade MBTI', text: getShareText(), url: SHARE_URL }).catch(() => {});
    } else {
      execCopy(text);
    }
  };

  const shareToX = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(SHARE_URL);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(SHARE_URL);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420');
  };

  const copyUrl = () => execCopy(SHARE_URL);

  const goToIncoterms = () => {
    window.history.pushState({}, '', '/incoterms');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // --- CSS Keyframes (injected once) ---
  useEffect(() => {
    const styleId = 'trade-mbti-keyframes';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes mbti-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes mbti-wave {
        0% { transform: translateX(0) translateY(0); }
        25% { transform: translateX(4px) translateY(-2px); }
        50% { transform: translateX(0) translateY(-4px); }
        75% { transform: translateX(-4px) translateY(-2px); }
        100% { transform: translateX(0) translateY(0); }
      }
      @keyframes mbti-slide-in-left {
        from { opacity: 0; transform: translateX(40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes mbti-slide-in-right {
        from { opacity: 0; transform: translateX(-40px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes mbti-slide-out-left {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(-40px); }
      }
      @keyframes mbti-slide-out-right {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(40px); }
      }
      @keyframes mbti-pop-in {
        0% { opacity: 0; transform: scale(0.8); }
        70% { transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes mbti-stamp {
        0% { opacity: 0; transform: scale(2.5) rotate(-15deg); }
        60% { opacity: 1; transform: scale(0.9) rotate(2deg); }
        80% { transform: scale(1.05) rotate(-1deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes mbti-confetti-fall {
        0% { opacity: 1; transform: translateY(0) rotate(0deg); }
        100% { opacity: 0; transform: translateY(120px) rotate(360deg); }
      }
      @keyframes mbti-progress-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
        50% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
      }
      @keyframes mbti-badge-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.12); }
      }
      .mbti-option-card {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .mbti-option-card:hover {
        transform: translateY(-2px);
      }
      .mbti-option-card:active {
        transform: translateY(0) scale(0.98);
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  // --- Intro Phase ---
  const renderIntro = () => (
    <div
      className="flex flex-col items-center text-center py-8 sm:py-12"
      style={{
        opacity: introVisible ? 1 : 0,
        transform: introVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Decorative waves background */}
      <div className="relative w-full max-w-lg mx-auto mb-6">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <span className="text-[120px] sm:text-[160px]" style={{ animation: 'mbti-wave 4s ease-in-out infinite' }}>
            🌊
          </span>
        </div>

        {/* Hero icon */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className="relative mb-6"
            style={{ animation: 'mbti-float 3s ease-in-out infinite' }}
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30 rotate-3">
              <span className="text-5xl sm:text-6xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                🧭
              </span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg text-sm font-black text-amber-900">
              ?
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">
        나의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">물류 유형</span>은?
      </h1>
      <p className="text-lg sm:text-xl text-slate-400 font-medium mb-2">
        Trade MBTI
      </p>
      <p className="text-sm sm:text-base text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
        10가지 재미있는 질문으로<br className="sm:hidden" /> 나에게 딱 맞는 인코텀즈를 찾아보세요
      </p>

      {/* Scrolling badges */}
      <div className="w-full max-w-md mx-auto overflow-hidden mb-10">
        <div className="flex gap-2 justify-center flex-wrap px-4">
          {INCOTERMS_ORDER.map((code, i) => {
            const p = MBTI_PROFILES[code];
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm cursor-default"
                style={{
                  backgroundColor: p.color,
                  animation: `mbti-pop-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.05}s both`,
                }}
              >
                <span>{p.emoji}</span>
                <span>{code}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleStart}
        className="group relative px-12 py-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/30 overflow-hidden"
        style={{ transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.boxShadow = '0 20px 40px -8px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3)';
        }}
      >
        <span className="relative z-10 flex items-center gap-2">
          <span>항해 시작하기</span>
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </button>

      <p className="mt-4 text-xs text-slate-400">
        약 2~3분 소요
      </p>
    </div>
  );

  // --- Question Phase ---
  const renderQuestion = () => {
    const q = MBTI_QUESTIONS[currentQ];
    const progress = (currentQ / Math.max(totalQuestions - 1, 1)) * 100;
    const dimensionLabel = DIMENSION_LABELS[q.dimension] || q.dimension;

    return (
      <div className="py-6 sm:py-8">
        {/* Header: Progress + Step */}
        <div className="mb-6">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{q.emoji}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {dimensionLabel}
              </span>
            </div>
            <span className="text-sm font-black text-slate-900 tabular-nums">
              {currentQ + 1}
              <span className="text-slate-300 mx-0.5">/</span>
              {totalQuestions}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative w-full h-3">
            <div className="absolute inset-0 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)',
                }}
              />
            </div>
            {/* Progress dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-indigo-500 rounded-full shadow-md transition-all duration-500 ease-out"
              style={{
                left: `calc(${progress}% - 10px)`,
                animation: 'mbti-progress-pulse 2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Mini step dots */}
          <div className="flex justify-between mt-2">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i < currentQ
                    ? 'bg-indigo-500'
                    : i === currentQ
                    ? 'bg-indigo-400 scale-150'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div
          key={`q-${currentQ}`}
          style={{
            animation: animating
              ? slideDir === 'left'
                ? 'mbti-slide-out-left 0.3s ease-in forwards'
                : 'mbti-slide-out-right 0.3s ease-in forwards'
              : slideDir === 'left'
              ? 'mbti-slide-in-left 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards'
              : 'mbti-slide-in-right 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        >
          {/* Question text */}
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-7 mb-5">
            <div className="absolute top-3 right-3 text-4xl opacity-10 select-none pointer-events-none">
              {q.emoji}
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full mb-3">
              Q{currentQ + 1}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed pr-8">
              {q.question}
            </h2>
          </div>

          {/* 4 Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((option, idx) => {
              const isSelected = answers[currentQ] === idx;
              const color = OPTION_COLORS[idx];

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={animating}
                  className={`mbti-option-card text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? color.selected
                      : `${color.bg} ${color.border} ${color.hover}`
                  }`}
                  style={{
                    animation: `mbti-pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.08}s both`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-black text-white shadow-sm ${color.label}`}
                    >
                      {option.label}
                    </div>
                    <span
                      className={`text-sm font-semibold leading-snug ${
                        isSelected ? color.text : 'text-slate-700'
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        {currentQ > 0 && (
          <button
            onClick={handlePrev}
            className="mt-5 flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            이전 질문
          </button>
        )}
      </div>
    );
  };

  // --- Result Phase ---
  const renderResult = () => {
    if (!profile) return null;

    const bestMatchProfile = MBTI_PROFILES[profile.bestMatch];
    const worstMatchProfile = MBTI_PROFILES[profile.worstMatch];

    return (
      <div
        className="py-6 sm:py-8 space-y-5"
        style={{
          opacity: showResult ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        {/* Confetti burst (decorative) */}
        <div className="relative pointer-events-none select-none" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 flex justify-center gap-3 -mt-4 overflow-hidden h-32">
            {['🎉', '✨', '🎊', '⭐', '🌟', '🎉', '✨', '🎊'].map((emoji, i) => (
              <span
                key={i}
                className="text-xl"
                style={{
                  animation: `mbti-confetti-fall 1.5s ease-out ${i * 0.1}s both`,
                  position: 'relative',
                  left: `${(i - 4) * 24}px`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Main Result Card - Passport style */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${profile.color}18, ${profile.color}08, #ffffff)`,
            animation: showResult ? 'mbti-pop-in 0.6s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          }}
        >
          {/* Top accent bar */}
          <div
            className="h-2"
            style={{
              background: `linear-gradient(90deg, ${profile.color}, ${profile.color}88)`,
            }}
          />

          {/* Stamp watermark */}
          <div className="absolute top-8 right-6 opacity-[0.06] pointer-events-none select-none rotate-[-15deg]">
            <div
              className="text-8xl sm:text-9xl font-black"
              style={{ color: profile.color }}
            >
              {profile.code}
            </div>
          </div>

          <div className="relative p-6 sm:p-10 text-center">
            {/* Emoji + stamp effect */}
            <div
              className="inline-block mb-4"
              style={{
                animation: showResult ? 'mbti-stamp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' : 'none',
              }}
            >
              <span className="text-7xl sm:text-8xl block" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
                {profile.emoji}
              </span>
            </div>

            {/* Code badge */}
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-black mb-3 shadow-lg"
              style={{
                backgroundColor: profile.color,
                boxShadow: `0 4px 14px ${profile.color}40`,
                animation: showResult ? 'mbti-badge-bounce 0.5s ease 0.8s both' : 'none',
              }}
            >
              <span>{profile.code}</span>
              <span className="opacity-60">|</span>
              <span className="font-semibold opacity-90">{profile.name}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">
              {profile.nickname}
            </h2>
            <p className="text-sm text-slate-400 font-medium mb-6">
              {profile.fullName}
            </p>

            {/* Personality description */}
            <div className="relative max-w-lg mx-auto">
              <div className="absolute -left-2 top-0 text-4xl text-slate-200 font-serif select-none">&ldquo;</div>
              <p className="text-base text-slate-600 leading-relaxed px-4">
                {profile.personality}
              </p>
              <div className="absolute -right-2 bottom-0 text-4xl text-slate-200 font-serif select-none">&rdquo;</div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Strengths */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 overflow-hidden relative"
            style={{
              animation: showResult ? 'mbti-pop-in 0.4s ease 0.4s both' : 'none',
            }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 rounded-r" />
            <h3 className="text-sm font-black text-emerald-600 mb-3 flex items-center gap-2 pl-2">
              <span className="text-lg">💪</span>
              강점
            </h3>
            <ul className="space-y-2.5 pl-2">
              {profile.strengths.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700"
                  style={{
                    animation: showResult ? `mbti-pop-in 0.3s ease ${0.6 + i * 0.1}s both` : 'none',
                  }}
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-medium">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div
            className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 overflow-hidden relative"
            style={{
              animation: showResult ? 'mbti-pop-in 0.4s ease 0.5s both' : 'none',
            }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 rounded-r" />
            <h3 className="text-sm font-black text-amber-600 mb-3 flex items-center gap-2 pl-2">
              <span className="text-lg">⚡</span>
              약점
            </h3>
            <ul className="space-y-2.5 pl-2">
              {profile.weaknesses.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700"
                  style={{
                    animation: showResult ? `mbti-pop-in 0.3s ease ${0.7 + i * 0.1}s both` : 'none',
                  }}
                >
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-medium">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Compatibility */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6"
          style={{
            animation: showResult ? 'mbti-pop-in 0.4s ease 0.6s both' : 'none',
          }}
        >
          <h3 className="text-base font-black text-slate-900 mb-4 text-center flex items-center justify-center gap-2">
            <span className="text-xl">🤝</span>
            궁합 분석
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Best Match */}
            {bestMatchProfile && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/80">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm text-3xl"
                  style={{ backgroundColor: `${bestMatchProfile.color}15` }}
                >
                  {bestMatchProfile.emoji}
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-600 mb-0.5 tracking-wide">
                    BEST MATCH
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {bestMatchProfile.code}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {bestMatchProfile.nickname}
                  </p>
                </div>
              </div>
            )}

            {/* Worst Match */}
            {worstMatchProfile && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/80">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm text-3xl"
                  style={{ backgroundColor: `${worstMatchProfile.color}15` }}
                >
                  {worstMatchProfile.emoji}
                </div>
                <div>
                  <p className="text-xs font-black text-red-500 mb-0.5 tracking-wide">
                    WATCH OUT
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {worstMatchProfile.code}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {worstMatchProfile.nickname}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Share Buttons */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6"
          style={{
            animation: showResult ? 'mbti-pop-in 0.4s ease 0.7s both' : 'none',
          }}
        >
          <h3 className="text-base font-black text-slate-900 mb-4 text-center flex items-center justify-center gap-2">
            <span className="text-xl">📣</span>
            결과 공유하기
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 카카오톡 */}
            <button
              onClick={shareToKakao}
              className="flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 bg-[#FEE500] rounded-xl hover:brightness-95 transition-all active:scale-[0.97]"
            >
              <svg className="w-7 h-7 text-[#3C1E1E]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.5 3 2 6.58 2 11c0 2.84 1.87 5.33 4.67 6.73l-.97 3.59a.38.38 0 00.57.42l4.13-2.73c.53.05 1.07.09 1.6.09 5.5 0 10-3.58 10-8s-4.5-8-10-8z" />
              </svg>
              <span className="text-xs font-bold text-[#3C1E1E]">카카오톡</span>
            </button>

            {/* X (Twitter) */}
            <button
              onClick={shareToX}
              className="flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 bg-black rounded-xl hover:bg-gray-800 transition-all active:scale-[0.97]"
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-xs font-bold text-white">X</span>
            </button>

            {/* Facebook */}
            <button
              onClick={shareToFacebook}
              className="flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 bg-[#1877F2] rounded-xl hover:bg-[#166FE5] transition-all active:scale-[0.97]"
            >
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-xs font-bold text-white">Facebook</span>
            </button>

            {/* URL 복사 */}
            <button
              onClick={copyUrl}
              className="flex flex-col items-center justify-center gap-1.5 px-3 py-3.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all active:scale-[0.97]"
            >
              {copied ? (
                <>
                  <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-bold text-emerald-600">복사 완료!</span>
                </>
              ) : (
                <>
                  <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-xs font-bold text-slate-600">링크 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={goToIncoterms}
            className="flex-1 px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>📖</span>
            인코텀즈 가이드 보기
          </button>
          <button
            onClick={handleRestart}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            다시 테스트하기
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-visible bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Trade MBTI</h1>
              <p className="text-slate-400 text-xs">나의 물류 성향 테스트</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Side Rails */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Ad */}
          {leftSideAdSlot && (
            <div className="hidden md:block w-40 shrink-0">
              <div
                className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                style={{ minHeight: '600px', maxHeight: '800px' }}
              >
                {leftSideAdSlot}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0" ref={contentRef}>
            <div className="max-w-5xl mx-auto">
              {phase === 'intro' && renderIntro()}
              {phase === 'question' && renderQuestion()}
              {phase === 'result' && renderResult()}
            </div>
          </div>

          {/* Right Ad */}
          {rightSideAdSlot && (
            <div className="hidden md:block w-40 shrink-0">
              <div
                className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                style={{ minHeight: '600px', maxHeight: '800px' }}
              >
                {rightSideAdSlot}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
