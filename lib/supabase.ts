import { createClient } from '@supabase/supabase-js';
import { FSSCRecord, FSSCFormData, FSSCFilter } from '../types/fssc';

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
      try {
        // RPC 함수 사용 시도 (서버 측에서 권한 체크 없이 실행)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('increment_view_count', { insight_id: id });

        if (!rpcError) {
          return { data: rpcData, error: null };
        }

        // RPC 실패 시 직접 업데이트 시도
        console.log('RPC failed, trying direct update:', rpcError.message);

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

        if (error) {
          console.error('Failed to increment view count:', error.message);
        }

        return { data, error };
      } catch (err) {
        console.error('Error in incrementViewCount:', err);
        return { data: null, error: err };
      }
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
  },

  feedbacks: {
    // 모든 피드백 가져오기
    getAll: async () => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },

    // 피드백 생성 (IP 기반 체크 포함)
    create: async (feedback: { name: string; email: string; contact?: string; organization?: string; message: string; type: string }) => {
      // 먼저 최근 제출 확인 (email 기반으로 체크)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentSubmissions, error: checkError } = await supabase
        .from('feedbacks')
        .select('created_at')
        .eq('email', feedback.email)
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false });

      if (checkError) {
        console.error('Error checking recent submissions:', checkError);
      }

      // 시간당 3개 이상 제출 방지
      if (recentSubmissions && recentSubmissions.length >= 3) {
        return {
          data: null,
          error: {
            message: '너무 많은 요청입니다. 1시간 후에 다시 시도해주세요.',
            code: 'RATE_LIMIT_EXCEEDED'
          }
        };
      }

      // 마지막 제출 후 5분 cooldown
      if (recentSubmissions && recentSubmissions.length > 0) {
        const lastSubmission = new Date(recentSubmissions[0].created_at);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        if (lastSubmission > fiveMinutesAgo) {
          const remainingSeconds = Math.ceil((lastSubmission.getTime() + 5 * 60 * 1000 - Date.now()) / 1000);
          return {
            data: null,
            error: {
              message: `잠시 후 다시 시도해주세요. (${Math.floor(remainingSeconds / 60)}분 ${remainingSeconds % 60}초 남음)`,
              code: 'COOLDOWN_ACTIVE'
            }
          };
        }
      }

      // 피드백 저장
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([{
          ...feedback,
          created_at: new Date().toISOString(),
          read: false,
          // IP는 클라이언트에서 얻을 수 없으므로 생략
          user_agent: navigator.userAgent
        }])
        .select();
      return { data, error };
    },

    // 피드백 읽음 처리
    markAsRead: async (id: string) => {
      const { data, error } = await supabase
        .from('feedbacks')
        .update({ read: true })
        .eq('id', id)
        .select();
      return { data, error };
    },

    // 피드백 삭제
    delete: async (id: string) => {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', id);
      return { error };
    },

    // 읽지 않은 피드백 수 가져오기
    getUnreadCount: async () => {
      const { count, error } = await supabase
        .from('feedbacks')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);
      return { count, error };
    }
  },

  // FS/SC (유류할증료/보안료) 관련 함수
  fssc: {
    // 모든 FS/SC 데이터 가져오기
    getAll: async () => {
      const { data, error } = await supabase
        .from('fssc')
        .select('*')
        .order('carrier_code', { ascending: true })
        .order('start_date', { ascending: false });
      return { data: data as FSSCRecord[] | null, error };
    },

    // 필터링된 FS/SC 데이터 가져오기
    getFiltered: async (filter: FSSCFilter) => {
      let query = supabase.from('fssc').select('*');

      // 타입 필터 (A: 전체가 아닌 경우)
      if (filter.type && filter.type !== 'A') {
        query = query.eq('type', filter.type);
      }

      // 항공사 코드 필터
      if (filter.carrier_code) {
        query = query.ilike('carrier_code', `%${filter.carrier_code}%`);
      }

      // 기준일 필터 (해당 날짜가 적용 기간 내에 있는 경우)
      if (filter.date) {
        query = query
          .lte('start_date', filter.date)
          .gte('end_date', filter.date);
      }

      const { data, error } = await query
        .order('carrier_code', { ascending: true })
        .order('start_date', { ascending: false });

      return { data: data as FSSCRecord[] | null, error };
    },

    // FS/SC 레코드 생성
    create: async (record: FSSCFormData) => {
      const { data, error } = await supabase
        .from('fssc')
        .insert([{
          ...record,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      return { data: data as FSSCRecord[] | null, error };
    },

    // FS/SC 레코드 수정
    update: async (id: string, updates: Partial<FSSCFormData>) => {
      const { data, error } = await supabase
        .from('fssc')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      return { data: data as FSSCRecord[] | null, error };
    },

    // FS/SC 레코드 삭제
    delete: async (id: string) => {
      const { error } = await supabase
        .from('fssc')
        .delete()
        .eq('id', id);
      return { error };
    },

    // 여러 레코드 삭제
    deleteMany: async (ids: string[]) => {
      const { error } = await supabase
        .from('fssc')
        .delete()
        .in('id', ids);
      return { error };
    },

    // 항공사 코드 목록 가져오기 (중복 제거)
    getCarrierCodes: async () => {
      const { data, error } = await supabase
        .from('fssc')
        .select('carrier_code, carrier_name')
        .order('carrier_code', { ascending: true });

      if (error) return { data: null, error };

      // 중복 제거
      const uniqueCarriers = Array.from(
        new Map(data?.map(item => [item.carrier_code, item]) || []).values()
      );

      return { data: uniqueCarriers, error: null };
    },

    // 대량 데이터 추가 (CSV 임포트 등)
    bulkCreate: async (records: FSSCFormData[]) => {
      const recordsWithTimestamp = records.map(record => ({
        ...record,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('fssc')
        .insert(recordsWithTimestamp)
        .select();
      return { data: data as FSSCRecord[] | null, error };
    },

    // 외부 소스에서 데이터 가져오기
    fetchFromExternal: async (date: string, force: boolean = false) => {
      const { data, error } = await supabase.functions.invoke('fetch-fssc', {
        body: { date, force }
      });
      return { data, error };
    }
  }
};