import React, { useState, useEffect } from 'react';
import { Insight } from '../types/insights';
import { Feedback } from '../types/feedback';
import { CommunityPost, CommunityComment } from '../types/community';
import { db } from '../lib/supabase';
import { getTodayString } from '../lib/date';
import TiptapEditor from './TiptapEditor';
import FSSCAdmin from './fssc/FSSCAdmin';

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

type MenuSection = 'dashboard' | 'insights' | 'feedbacks' | 'community' | 'fssc' | 'analytics' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
  const [activeSection, setActiveSection] = useState<MenuSection>('dashboard');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [viewingPost, setViewingPost] = useState<CommunityPost | null>(null);
  const [viewingPostComments, setViewingPostComments] = useState<CommunityComment[]>([]);
  const [viewingPostCommentsLoading, setViewingPostCommentsLoading] = useState(false);
  const [showInsightForm, setShowInsightForm] = useState(false);
  const [editingInsight, setEditingInsight] = useState<Insight | null>(null);
  const [editingViewCount, setEditingViewCount] = useState<string | null>(null);
  const [viewCountInput, setViewCountInput] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<Insight>>({
    tag: 'Logistics',
    title: '',
    date: getTodayString(),
    imageUrl: '',
    content: '',
    author: '',
    published: false
  });

  // Load insights and feedbacks from Supabase
  useEffect(() => {
    loadInsights();
    loadFeedbacks();
    loadCommunityPosts();
  }, []);

  const loadInsights = async () => {
    try {
      const { data, error } = await db.insights.getAll();
      if (error) {
        console.error('Error loading insights:', error);
        // Fallback to localStorage if Supabase fails
        const savedInsights = localStorage.getItem('insights');
        if (savedInsights) {
          setInsights(JSON.parse(savedInsights));
        }
        return;
      }

      if (data) {
        // Convert snake_case to camelCase
        const formattedInsights = data.map((item: any) => ({
          id: item.id,
          tag: item.tag,
          title: item.title,
          date: item.date,
          imageUrl: item.image_url,
          content: item.content,
          author: item.author,
          published: item.published,
          viewCount: item.view_count || 0
        }));
        setInsights(formattedInsights);
        // Also save to localStorage as backup
        localStorage.setItem('insights', JSON.stringify(formattedInsights));
      }
    } catch (error) {
      console.error('Error loading insights:', error);
      // Fallback to localStorage
      const savedInsights = localStorage.getItem('insights');
      if (savedInsights) {
        setInsights(JSON.parse(savedInsights));
      }
    }
  };

  const loadFeedbacks = async () => {
    try {
      const { data, error } = await db.feedbacks.getAll();
      if (error) {
        console.error('Error loading feedbacks:', error);
        // Fallback to localStorage if Supabase fails
        const savedFeedbacks = localStorage.getItem('feedbacks');
        if (savedFeedbacks) {
          setFeedbacks(JSON.parse(savedFeedbacks));
        }
        return;
      }

      if (data) {
        setFeedbacks(data);
        // Count unread feedbacks
        const unreadCount = data.filter(f => !f.read).length;
        setUnreadFeedbackCount(unreadCount);
        // Also save to localStorage as backup
        localStorage.setItem('feedbacks', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading feedbacks:', error);
      // Fallback to localStorage
      const savedFeedbacks = localStorage.getItem('feedbacks');
      if (savedFeedbacks) {
        const parsedFeedbacks = JSON.parse(savedFeedbacks);
        setFeedbacks(parsedFeedbacks);
        const unreadCount = parsedFeedbacks.filter((f: Feedback) => !f.read).length;
        setUnreadFeedbackCount(unreadCount);
      }
    }
  };

  const loadCommunityPosts = async () => {
    setCommunityLoading(true);
    try {
      const { data, error } = await db.communityPosts.getAll(1, 1000);
      if (!error && data) {
        setCommunityPosts(data as CommunityPost[]);
      }
    } catch (err) {
      // silently fail
    }
    setCommunityLoading(false);
  };

  const openPostModal = async (post: CommunityPost) => {
    setViewingPost(post);
    setViewingPostComments([]);
    setViewingPostCommentsLoading(true);
    try {
      const { data, error } = await db.communityComments.getByPostId(post.id);
      if (!error && data) {
        setViewingPostComments(data as CommunityComment[]);
      }
    } catch (err) {
      // silently fail
    }
    setViewingPostCommentsLoading(false);
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return;
    try {
      const { error } = await db.communityComments.delete(commentId);
      if (!error) {
        setViewingPostComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (err) {
      // silently fail
    }
  };

  const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const renderPostContent = (text: string) => {
    const parts = text.split(/(\[(?:img|video):[^\]]+\])/g);
    return parts.map((part, i) => {
      const imgMatch = part.match(/^\[img:([^\]]+)\]$/);
      if (imgMatch) {
        return (
          <img
            key={i}
            src={imgMatch[1].trim()}
            alt="첨부 이미지"
            className="max-w-full rounded-lg my-3 border border-gray-200"
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
            <div key={i} className="aspect-video my-3 rounded-lg overflow-hidden border border-gray-200">
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
          <video key={i} src={url} controls className="max-w-full rounded-lg my-3 border border-gray-200">
            동영상을 재생할 수 없습니다.
          </video>
        );
      }
      return part ? <span key={i}>{part}</span> : null;
    });
  };

  const deleteCommunityPost = async (id: string) => {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return;
    try {
      const { error } = await db.communityPosts.delete(id);
      if (!error) {
        setCommunityPosts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      // silently fail
    }
  };

  const markFeedbackAsRead = async (id: string) => {
    try {
      const { error } = await db.feedbacks.markAsRead(id);
      if (!error) {
        loadFeedbacks();
      } else {
        // Fallback to localStorage
        const savedFeedbacks = localStorage.getItem('feedbacks');
        if (savedFeedbacks) {
          const feedbacks = JSON.parse(savedFeedbacks);
          const updatedFeedbacks = feedbacks.map((f: Feedback) =>
            f.id === id ? { ...f, read: true } : f
          );
          localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
          setFeedbacks(updatedFeedbacks);
          const unreadCount = updatedFeedbacks.filter((f: Feedback) => !f.read).length;
          setUnreadFeedbackCount(unreadCount);
        }
      }
    } catch (error) {
      console.error('Error marking feedback as read:', error);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('정말로 이 피드백을 삭제하시겠습니까?')) return;

    try {
      const { error } = await db.feedbacks.delete(id);
      if (!error) {
        loadFeedbacks();
      } else {
        // Fallback to localStorage
        const savedFeedbacks = localStorage.getItem('feedbacks');
        if (savedFeedbacks) {
          const feedbacks = JSON.parse(savedFeedbacks);
          const updatedFeedbacks = feedbacks.filter((f: Feedback) => f.id !== id);
          localStorage.setItem('feedbacks', JSON.stringify(updatedFeedbacks));
          setFeedbacks(updatedFeedbacks);
          const unreadCount = updatedFeedbacks.filter((f: Feedback) => !f.read).length;
          setUnreadFeedbackCount(unreadCount);
        }
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const handleInsightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingInsight) {
        // Update existing insight in Supabase
        const updates = {
          tag: formData.tag,
          title: formData.title,
          date: formData.date?.replace(/-/g, '.'),
          image_url: formData.imageUrl,
          content: formData.content,
          author: formData.author,
          published: formData.published
        };

        const { error } = await db.insights.update(editingInsight.id, updates);
        if (error) {
          console.error('Error updating insight:', error);
          alert('수정 중 오류가 발생했습니다.');
          return;
        }
      } else {
        // Add new insight to Supabase
        const newInsight = {
          tag: formData.tag,
          title: formData.title,
          date: formData.date?.replace(/-/g, '.'),
          image_url: formData.imageUrl,
          content: formData.content,
          author: formData.author,
          published: formData.published
        };

        const { error } = await db.insights.create(newInsight);
        if (error) {
          console.error('Error creating insight:', error);
          alert('추가 중 오류가 발생했습니다.');
          return;
        }
      }

      // Reload insights from Supabase
      await loadInsights();

      // Reset form
      setFormData({
        tag: 'Logistics',
        title: '',
        date: getTodayString(),
        imageUrl: '',
        content: '',
        author: '',
        published: false
      });
      setEditingInsight(null);
      setShowInsightForm(false);

      // Notify other components
      window.dispatchEvent(new Event('insightsUpdated'));
    } catch (error) {
      console.error('Error submitting insight:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteInsight = async (id: string) => {
    if (confirm('정말 이 콘텐츠를 삭제하시겠습니까?')) {
      try {
        const { error } = await db.insights.delete(id);
        if (error) {
          console.error('Error deleting insight:', error);
          alert('삭제 중 오류가 발생했습니다.');
          return;
        }
        await loadInsights();
        window.dispatchEvent(new Event('insightsUpdated'));
      } catch (error) {
        console.error('Error deleting insight:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditInsight = (insight: Insight) => {
    setEditingInsight(insight);
    setFormData({
      ...insight,
      date: insight.date.replace(/\./g, '-')
    });
    setShowInsightForm(true);
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const insight = insights.find(i => i.id === id);
      if (!insight) return;

      const { error } = await db.insights.togglePublish(id, !insight.published);
      if (error) {
        console.error('Error toggling publish:', error);
        alert('상태 변경 중 오류가 발생했습니다.');
        return;
      }
      await loadInsights();
      window.dispatchEvent(new Event('insightsUpdated'));
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // Handle view count update
  const handleUpdateViewCount = async (id: string) => {
    try {
      const { error } = await db.insights.setViewCount(id, viewCountInput);
      if (error) {
        console.error('Error updating view count:', error);
        alert('조회수 업데이트 중 오류가 발생했습니다.');
        return;
      }
      await loadInsights();
      setEditingViewCount(null);
      window.dispatchEvent(new Event('insightsUpdated'));
    } catch (error) {
      console.error('Error updating view count:', error);
      alert('조회수 업데이트 중 오류가 발생했습니다.');
    }
  };

  // Calculate statistics
  const stats = {
    totalInsights: insights.length,
    publishedInsights: insights.filter(i => i.published).length,
    draftInsights: insights.filter(i => !i.published).length,
    categories: [...new Set(insights.map(i => i.tag))].length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-black text-gray-900">SHIPDAGO</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {!sidebarCollapsed && <span className="font-medium">대시보드</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('insights')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'insights' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                {!sidebarCollapsed && <span className="font-medium">콘텐츠 관리</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('feedbacks')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${
                  activeSection === 'feedbacks' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {!sidebarCollapsed && <span className="font-medium">피드백</span>}
                {unreadFeedbackCount > 0 && !sidebarCollapsed && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {unreadFeedbackCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('community')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'community' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                {!sidebarCollapsed && <span className="font-medium">게시판 관리</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('fssc')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'fssc' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {!sidebarCollapsed && <span className="font-medium">FS/SC 관리</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'analytics' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {!sidebarCollapsed && <span className="font-medium">분석</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'settings' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {!sidebarCollapsed && <span className="font-medium">설정</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span className="font-medium">나가기</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSection === 'dashboard' && '대시보드'}
                {activeSection === 'insights' && '콘텐츠 관리'}
                {activeSection === 'feedbacks' && '피드백 관리'}
                {activeSection === 'community' && '게시판 관리'}
                {activeSection === 'fssc' && 'FS/SC 관리'}
                {activeSection === 'analytics' && '분석'}
                {activeSection === 'settings' && '설정'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                SHIPDAGO 관리자 패널
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-400">TOTAL</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.totalInsights}</h3>
                  <p className="text-sm text-gray-500 mt-1">전체 콘텐츠</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-400">PUBLISHED</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.publishedInsights}</h3>
                  <p className="text-sm text-gray-500 mt-1">게시된 콘텐츠</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-400">DRAFT</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.draftInsights}</h3>
                  <p className="text-sm text-gray-500 mt-1">미게시 콘텐츠</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-gray-400">CATEGORIES</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.categories}</h3>
                  <p className="text-sm text-gray-500 mt-1">카테고리</p>
                </div>
              </div>

              {/* Recent Insights */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">최근 콘텐츠</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {insights.slice(0, 5).map(insight => (
                      <div key={insight.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={insight.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <p className="text-sm text-gray-500">{insight.date}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          insight.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {insight.published ? '게시됨' : '미게시'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'insights' && (
            <div>
              {/* Add Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowInsightForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  새 콘텐츠 추가
                </button>
              </div>

              {/* Form Modal */}
              {showInsightForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">
                        {editingInsight ? '콘텐츠 수정' : '새 콘텐츠 추가'}
                      </h3>
                    </div>
                    <form onSubmit={handleInsightSubmit} className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                          <select
                            value={formData.tag}
                            onChange={(e) => setFormData({ ...formData, tag: e.target.value as Insight['tag'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                            <input
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">작성자</label>
                            <input
                              type="text"
                              value={formData.author}
                              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                          <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                          <TiptapEditor
                            value={formData.content || ''}
                            onChange={(content) => setFormData({ ...formData, content })}
                            placeholder="내용을 입력하세요..."
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
                          <label htmlFor="published" className="text-sm font-medium text-gray-700">
                            바로 게시하기
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {editingInsight ? '수정' : '추가'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowInsightForm(false);
                            setEditingInsight(null);
                            setFormData({
                              tag: 'Logistics',
                              title: '',
                              date: getTodayString(),
                              imageUrl: '',
                              content: '',
                              author: '',
                              published: false
                            });
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Insights Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이미지</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회수</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {insights.map(insight => (
                        <tr key={insight.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={insight.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{insight.title}</div>
                            {insight.author && (
                              <div className="text-sm text-gray-500">by {insight.author}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              {insight.tag}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {insight.date}
                          </td>
                          <td className="px-6 py-4">
                            {editingViewCount === insight.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={viewCountInput}
                                  onChange={(e) => setViewCountInput(parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                  min="0"
                                />
                                <button
                                  onClick={() => handleUpdateViewCount(insight.id)}
                                  className="text-green-600 hover:text-green-700"
                                  title="저장"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setEditingViewCount(null)}
                                  className="text-red-600 hover:text-red-700"
                                  title="취소"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingViewCount(insight.id);
                                  setViewCountInput(insight.viewCount || 0);
                                }}
                                className="text-sm text-gray-700 hover:text-blue-600 hover:underline"
                                title="클릭하여 수정"
                              >
                                {insight.viewCount?.toLocaleString() || 0}
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              insight.published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {insight.published ? '게시됨' : '미게시'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleTogglePublish(insight.id)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title={insight.published ? '미게시로 전환' : '게시하기'}
                              >
                                {insight.published ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => handleEditInsight(insight)}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="수정"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteInsight(insight.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="삭제"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'feedbacks' && (
            <div>
              {/* Feedback Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">전체</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{feedbacks.length}</div>
                  <div className="text-xs text-gray-500 mt-1">총 피드백</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">미확인</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{unreadFeedbackCount}</div>
                  <div className="text-xs text-gray-500 mt-1">읽지 않은 피드백</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">확인</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{feedbacks.length - unreadFeedbackCount}</div>
                  <div className="text-xs text-gray-500 mt-1">확인된 피드백</div>
                </div>
              </div>

              {/* Feedback List */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">피드백 목록</h2>
                  <p className="text-sm text-gray-500 mt-1">사용자들이 남긴 피드백과 제안사항</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {feedbacks.length === 0 ? (
                    <div className="p-12 text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">아직 피드백이 없습니다</h3>
                      <p className="text-sm text-gray-500">사용자들의 피드백이 여기에 표시됩니다</p>
                    </div>
                  ) : (
                    feedbacks.map((feedback) => (
                      <div key={feedback.id} className={`p-6 ${!feedback.read ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{feedback.name}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                feedback.type === 'suggestion' ? 'bg-purple-100 text-purple-700' :
                                feedback.type === 'bug' ? 'bg-red-100 text-red-700' :
                                feedback.type === 'feature' ? 'bg-green-100 text-green-700' :
                                feedback.type === 'question' ? 'bg-yellow-100 text-yellow-700' :
                                feedback.type === 'partnership' ? 'bg-indigo-100 text-indigo-700' :
                                feedback.type === 'other' ? 'bg-gray-100 text-gray-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {feedback.type === 'suggestion' ? '기능 제안' :
                                 feedback.type === 'bug' ? '버그 신고' :
                                 feedback.type === 'feature' ? '기능 요청' :
                                 feedback.type === 'question' ? '문의사항' :
                                 feedback.type === 'partnership' ? '제휴/협업' :
                                 feedback.type === 'other' ? '기타' :
                                 '일반 피드백'}
                              </span>
                              {!feedback.read && (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
                              {feedback.email && <span>📧 {feedback.email}</span>}
                              {feedback.contact && <span>📱 {feedback.contact}</span>}
                              {feedback.organization && <span>🏢 {feedback.organization}</span>}
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
                            <p className="text-xs text-gray-500 mt-3">
                              {new Date(feedback.created_at).toLocaleString('ko-KR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {!feedback.read && (
                              <button
                                onClick={() => markFeedbackAsRead(feedback.id)}
                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                title="읽음 표시"
                              >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => deleteFeedback(feedback.id)}
                              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                              title="삭제"
                            >
                              <svg className="w-4 h-4 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'community' && (
            <div>
              {/* Community Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">전체</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{communityPosts.length}</div>
                  <div className="text-xs text-gray-500 mt-1">전체 게시글</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">공개</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{communityPosts.filter(p => !p.is_private).length}</div>
                  <div className="text-xs text-gray-500 mt-1">공개 게시글</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">비밀</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{communityPosts.filter(p => p.is_private).length}</div>
                  <div className="text-xs text-gray-500 mt-1">비밀 게시글</div>
                </div>
              </div>

              {/* Community Posts Table */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">게시글 목록</h2>
                    <p className="text-sm text-gray-500 mt-1">커뮤니티 게시글을 관리합니다</p>
                  </div>
                  <button
                    onClick={loadCommunityPosts}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    새로고침
                  </button>
                </div>
                {communityLoading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">게시글을 불러오는 중...</p>
                  </div>
                ) : communityPosts.length === 0 ? (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">게시글이 없습니다</h3>
                    <p className="text-sm text-gray-500">커뮤니티에 작성된 게시글이 여기에 표시됩니다</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">번호</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">작성자</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">작성일</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">조회수</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">유형</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">작업</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {communityPosts.map((post, index) => (
                          <tr key={post.id} onClick={() => openPostModal(post)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                            <td className="px-6 py-4 text-sm text-gray-400">{communityPosts.length - index}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {post.is_private && (
                                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                )}
                                <span className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-blue-600">{post.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{post.author_nickname}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{post.view_count}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                post.is_private
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {post.is_private ? '비밀' : '공개'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteCommunityPost(post.id); }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="삭제"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'fssc' && (
            <FSSCAdmin embedded={true} />
          )}

          {activeSection === 'analytics' && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">분석 기능 준비 중</h3>
                <p className="text-sm text-gray-500">곧 상세한 분석 기능이 추가될 예정입니다.</p>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">설정 기능 준비 중</h3>
                <p className="text-sm text-gray-500">시스템 설정 기능이 곧 추가될 예정입니다.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Community Post View Modal */}
      {viewingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  {viewingPost.is_private && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded border border-amber-200">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      비밀글
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{viewingPost.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{viewingPost.author_nickname}</span>
                  <span>{new Date(viewingPost.created_at).toLocaleString('ko-KR')}</span>
                  <span>조회 {viewingPost.view_count}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingPost(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                {renderPostContent(viewingPost.content)}
              </div>
            </div>

            {/* Comments in Modal */}
            <div className="border-t border-gray-200">
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  댓글 {viewingPostComments.length > 0 && `(${viewingPostComments.length})`}
                </h4>
              </div>
              {viewingPostCommentsLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : viewingPostComments.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-400">댓글이 없습니다.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {viewingPostComments.map(comment => (
                    <div key={comment.id} className="px-6 py-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">{comment.author_nickname}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.created_at).toLocaleString('ko-KR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">{comment.content}</p>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="shrink-0 p-1 text-gray-300 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                        title="댓글 삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => { deleteCommunityPost(viewingPost.id); setViewingPost(null); }}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                게시글 삭제
              </button>
              <button
                onClick={() => setViewingPost(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;