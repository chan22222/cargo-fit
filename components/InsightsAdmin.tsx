import React, { useState, useEffect } from 'react';
import { Insight, InsightFormData } from '../types/insights';

interface InsightsAdminProps {
  onClose: () => void;
}

const InsightsAdmin: React.FC<InsightsAdminProps> = ({ onClose }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsightFormData>({
    tag: 'Logistics',
    title: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    content: '',
    author: '',
    published: false
  });

  // Load insights from localStorage
  useEffect(() => {
    const savedInsights = localStorage.getItem('insights');
    if (savedInsights) {
      setInsights(JSON.parse(savedInsights));
    } else {
      // Initialize with default insights
      const defaultInsights: Insight[] = [
        {
          id: '1',
          tag: 'Logistics',
          title: '2024년 해상 운임 전망 및 컨테이너 수급 분석',
          date: '2024.05.24',
          imageUrl: 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&q=80&w=400',
          published: true
        },
        {
          id: '2',
          tag: 'Tech',
          title: 'AI와 머신러닝이 바꾸는 창고 자동화 시스템의 미래',
          date: '2024.05.20',
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400',
          published: true
        },
        {
          id: '3',
          tag: 'Sustainability',
          title: '해운업계의 탄소 중립 실현을 위한 대체 연료 기술',
          date: '2024.05.15',
          imageUrl: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=400',
          published: true
        }
      ];
      setInsights(defaultInsights);
      localStorage.setItem('insights', JSON.stringify(defaultInsights));
    }
  }, []);

  // Save insights to localStorage whenever they change
  useEffect(() => {
    if (insights.length > 0) {
      localStorage.setItem('insights', JSON.stringify(insights));
    }
  }, [insights]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing insight
      setInsights(prev => prev.map(insight =>
        insight.id === editingId
          ? { ...formData, id: editingId }
          : insight
      ));
    } else {
      // Add new insight
      const newInsight: Insight = {
        ...formData,
        id: Date.now().toString()
      };
      setInsights(prev => [...prev, newInsight]);
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      tag: 'Logistics',
      title: '',
      date: new Date().toISOString().split('T')[0],
      imageUrl: '',
      content: '',
      author: '',
      published: false
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (insight: Insight) => {
    setFormData({
      tag: insight.tag,
      title: insight.title,
      date: insight.date.replace(/\./g, '-'),
      imageUrl: insight.imageUrl,
      content: insight.content || '',
      author: insight.author || '',
      published: insight.published
    });
    setEditingId(insight.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 이 항목을 삭제하시겠습니까?')) {
      setInsights(prev => prev.filter(insight => insight.id !== id));
    }
  };

  const handleTogglePublish = (id: string) => {
    setInsights(prev => prev.map(insight =>
      insight.id === id
        ? { ...insight, published: !insight.published }
        : insight
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black">Insights 관리</h2>
              <p className="text-blue-100 text-sm mt-1">글로벌 물류 트렌드 콘텐츠 관리</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Add Button */}
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="mb-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 콘텐츠 추가
            </button>
          )}

          {/* Form */}
          {isFormOpen && (
            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">
                {editingId ? '콘텐츠 수정' : '새 콘텐츠 추가'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      카테고리
                    </label>
                    <select
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value as Insight['tag'] })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Logistics">Logistics</option>
                      <option value="Tech">Tech</option>
                      <option value="Sustainability">Sustainability</option>
                      <option value="Market">Market</option>
                      <option value="Policy">Policy</option>
                      <option value="Innovation">Innovation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      날짜
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="콘텐츠 제목을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    이미지 URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    작성자
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="작성자 이름"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    내용
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="콘텐츠 내용을 입력하세요 (선택사항)"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-slate-700">
                    바로 게시하기
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingId ? '수정' : '추가'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Insights List */}
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                아직 등록된 콘텐츠가 없습니다.
              </div>
            ) : (
              insights.map(insight => (
                <div
                  key={insight.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Image Preview */}
                    <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={insight.imageUrl}
                        alt={insight.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                              {insight.tag}
                            </span>
                            <span className="text-xs text-slate-400">
                              {insight.date}
                            </span>
                            {!insight.published && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                미게시
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 mb-1">
                            {insight.title}
                          </h4>
                          {insight.author && (
                            <p className="text-sm text-slate-500">
                              작성자: {insight.author}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePublish(insight.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={insight.published ? '비공개로 전환' : '게시하기'}
                          >
                            {insight.published ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(insight)}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="수정"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(insight.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsAdmin;