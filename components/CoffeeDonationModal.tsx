import React, { useState, useEffect } from 'react';

interface CoffeeDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CoffeeDonationModal: React.FC<CoffeeDonationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [developerEnergy, setDeveloperEnergy] = useState(100);
  const [bugCount, setBugCount] = useState(5);
  const [coffeeCount, setCoffeeCount] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isHelping, setIsHelping] = useState(false);

  const accountNumber = '1002-0138-7394';
  const bankName = '토스뱅크';

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      const startMessages = [
        '야생의 버그가 나타났다! 🐛',
        '야생의 버그가 나타났다! 🐛',
        '야생의 버그가 나타났다! 🐛'
      ];

      setDeveloperEnergy(100);
      setBugCount(5);
      setCoffeeCount(0);
      setCurrentMessage(startMessages[Math.floor(Math.random() * startMessages.length)]);
      setIsHelping(false);
    }
  }, [isOpen]);

  // Developer loses energy over time
  useEffect(() => {
    if (!isOpen || bugCount === 0) return;

    const timer = setInterval(() => {
      setDeveloperEnergy(prev => {
        const newEnergy = Math.max(0, prev - 8);

        const normalMessages = [
          '고양이가 방해하는 중...😼',
          '코드를 다시 살펴보는 중...',
          '구글링 중... 🔍',
          '스택오버플로우 검색 중...',
          'console.log 확인해보는 중...📝',
          '캐시 문제인가...? 🤔',
          '왜 안되지? 🤷‍♂️',
          'GPT에 물어봤다 더 꼬이는 중...',
          '롤백해야 하나...',
          '이거 전에도 본 문제인데...🤔',
          '고양이 한테 물어보는 중...😼',
          '고양이 만지는 중...😺',
          '패턴을 찾는 중...',
          '한 줄씩 검토 중...'
        ];

        const tiredMessages = [
          '집중력이 떨어지고 있어요 😅',
          '눈이 침침해지네요... 👀',
          '커피가 떨어졌어요... ☕',
          '집중력이 흐려지는 중...',
          '5분만 쉬었다 할까...🤔',
          '스트레칭이 필요해요... 🙆‍♂️',
          '화면을 너무 오래 봤나봐요...'
        ];

        if (newEnergy <= 15) {
          setCurrentMessage(tiredMessages[Math.floor(Math.random() * tiredMessages.length)]);
        } else if (Math.random() > 0.3) {
          setCurrentMessage(normalMessages[Math.floor(Math.random() * normalMessages.length)]);
        }

        return newEnergy;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [isOpen, bugCount]);

  const handleCoffeeDonation = () => {
    if (isHelping) return; // 중복 클릭 방지

    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setIsHelping(true);
    setCoffeeCount(prev => prev + 1);

    // Help developer with coffee
    setBugCount(prev => Math.max(0, prev - 1));
    setDeveloperEnergy(prev => Math.min(100, prev + 20));

    const successMessages = [
      '스택오버플로우에서 답을 찾았어요!',
      '우연히 방법을 찾았어요!',
      '유레카! 💡',
      '고양이가 힌트를 줬어요!',
      '리팩토링 완료!⚡',
      '성공! ✨',
      '빌드 성공! ✅',
      '고양이가 해결해줬어요!',
      '버그 퇴치 성공! 🎯'
    ];

    setCurrentMessage(successMessages[Math.floor(Math.random() * successMessages.length)]);

    setTimeout(() => {
      setCopied(false);
      setIsHelping(false);
    }, 2000);
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
          <h2 className="text-2xl font-black text-slate-900 mb-2">개발 현황</h2>
          <p className="text-sm text-slate-600">
            SHIPDAGO 개발자의 하루
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">

          {/* Developer Status */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(59, 130, 246, 0.1) 10px, rgba(59, 130, 246, 0.1) 20px)`
              }}/>
            </div>

            <div className="relative z-10">
              {/* Developer and Bugs */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl transition-transform ${isHelping ? 'scale-110' : ''}`}>
                    {developerEnergy > 50 ? '😊' : developerEnergy > 20 ? '😓' : '😵'}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">개발자 에너지</p>
                    <div className="w-32 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          developerEnergy > 50 ? 'bg-green-500' :
                          developerEnergy > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${developerEnergy}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">남은 버그</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg transition-all ${i < bugCount ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                        🐛
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <p className="text-sm text-slate-700 font-medium">
                  {currentMessage}
                </p>
              </div>

              {/* Help Counter */}
              {coffeeCount > 0 && (
                <div className="mt-2 text-center">
                  <p className="text-xs text-slate-500">
                    🤝 도와준 횟수: {coffeeCount}번
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Account Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">후원 계좌</p>
                <p className="text-sm font-semibold text-slate-900">{bankName}</p>
                <p className="text-base font-mono font-medium text-slate-700 mt-1">{accountNumber}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(accountNumber);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="계좌번호 복사"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 text-center">✓ 계좌번호가 복사되었습니다</p>
            )}
          </div>

          {/* Success/Warning Messages */}
          {bugCount === 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-green-800">🎉 오늘의 버그 클리어!</p>
              <p className="text-xs text-green-600 mt-1">이제 새로운 기능 개발을 시작할 수 있어요</p>
            </div>
          )}

          {developerEnergy === 0 && bugCount > 0 && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-slate-700">💤 개발자가 잠들었어요</p>
              <p className="text-xs text-slate-600 mt-1">내일 다시 도전하겠죠?</p>
            </div>
          )}

          <p className="text-xs text-slate-500 text-center">
            후원 계좌로 응원해주시면 감사하겠습니다
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleCoffeeDonation}
              disabled={bugCount === 0 || developerEnergy === 0 || isHelping}
              className={`flex-1 py-2.5 font-semibold rounded-lg transition-all ${
                bugCount === 0 || developerEnergy === 0 || isHelping
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
              }`}
            >
              {bugCount === 0 ? '✅ 완료!' : developerEnergy === 0 ? '😴 수고했어요' : isHelping ? '도움 전달중...' : '☕ 도움 주기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeDonationModal;