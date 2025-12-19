import { createClient } from '@supabase/supabase-js';

// Supabase 설정 - 환경 변수 사용
// Vercel에서는 환경 변수를 대시보드에서 설정
// 로컬에서는 .env.local 파일 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON || '';

// Supabase client 생성
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다. 일부 기능이 제한될 수 있습니다.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// 인증 관련 함수들
export const auth = {
  // 로그인
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 현재 세션 가져오기
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // 세션 변경 리스너
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // 관리자 계정 생성 (초기 설정용)
  createAdmin: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin'
        }
      }
    });
    return { data, error };
  }
};

// Insights 데이터베이스 작업
export const db = {
  insights: {
    // 모든 insights 가져오기
    getAll: async () => {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // 게시된 insights만 가져오기
    getPublished: async () => {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });
      return { data, error };
    },

    // Insight 생성
    create: async (insight: any) => {
      const { data, error } = await supabase
        .from('insights')
        .insert([insight])
        .select();
      return { data, error };
    },

    // Insight 업데이트
    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('insights')
        .update(updates)
        .eq('id', id)
        .select();
      return { data, error };
    },

    // Insight 삭제
    delete: async (id: string) => {
      const { error } = await supabase
        .from('insights')
        .delete()
        .eq('id', id);
      return { error };
    },

    // 게시 상태 토글
    togglePublish: async (id: string, published: boolean) => {
      const { data, error } = await supabase
        .from('insights')
        .update({ published })
        .eq('id', id)
        .select();
      return { data, error };
    },

    // ID로 특정 Insight 가져오기
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    // 조회수 증가
    incrementViewCount: async (id: string) => {
      // 먼저 현재 조회수 가져오기
      const { data: current } = await supabase
        .from('insights')
        .select('view_count')
        .eq('id', id)
        .single();

      const currentCount = current?.view_count || 0;

      const { data, error } = await supabase
        .from('insights')
        .update({ view_count: currentCount + 1 })
        .eq('id', id)
        .select();

      return { data, error };
    },

    // 조회수 직접 설정
    setViewCount: async (id: string, viewCount: number) => {
      const { data, error } = await supabase
        .from('insights')
        .update({ view_count: viewCount })
        .eq('id', id)
        .select();
      return { data, error };
    }
  }
};