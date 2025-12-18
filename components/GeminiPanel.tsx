
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface GeminiPanelProps {
  advice: string;
  isLoading: boolean;
  onGenerate: () => void;
  hasItems: boolean;
}

const GeminiPanel: React.FC<GeminiPanelProps> = ({ advice, isLoading, onGenerate, hasItems }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[11px] font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
          <span className="w-5 h-5 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px]">✨</span>
          AI Insights
        </h2>
        <button
          onClick={onGenerate}
          disabled={isLoading || !hasItems}
          className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${
            isLoading || !hasItems
              ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 shadow-sm'
          }`}
        >
          {isLoading ? 'Analysing...' : 'Get Advice'}
        </button>
      </div>

      <div className="flex-1 bg-slate-50/50 rounded-xl p-4 overflow-y-auto border border-slate-100 min-h-0">
        {!advice && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2.5 py-4 opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p className="text-center text-[10px] font-bold leading-tight tracking-tight">
              AI를 통해 적재 공간 활용에 대한<br/>전문가 리포트를 생성하세요.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-1.5 bg-slate-200 rounded-full w-3/4"></div>
            <div className="h-1.5 bg-slate-200 rounded-full w-full"></div>
            <div className="h-1.5 bg-slate-200 rounded-full w-5/6"></div>
            <div className="h-1.5 bg-slate-200 rounded-full w-2/3"></div>
          </div>
        ) : (
          <div className="prose prose-xs prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
            <ReactMarkdown>{advice}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiPanel;
