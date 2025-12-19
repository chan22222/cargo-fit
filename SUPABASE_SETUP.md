# Supabase 설정 가이드

## 🚀 빠른 시작

### 1. Supabase 계정 생성
1. [https://supabase.com](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인 (권장) 또는 이메일로 가입

### 2. 프로젝트 생성
1. "New project" 클릭
2. 프로젝트 정보 입력:
   - **Name**: shipdago-admin
   - **Database Password**: 강력한 비밀번호 설정 (저장 필수!)
   - **Region**: Northeast Asia (Seoul) - 한국 서버 선택
3. "Create new project" 클릭 (1-2분 소요)

### 3. API 키 가져오기
1. 왼쪽 메뉴에서 "Settings" → "API" 클릭
2. 다음 값들을 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. 환경 변수 설정
1. 프로젝트 루트에 `.env` 파일 생성
2. 다음 내용 입력:
```env
VITE_SUPABASE_URL=여기에_Project_URL_붙여넣기
VITE_SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기
```

### 5. 데이터베이스 테이블 생성

Supabase 대시보드에서 SQL Editor 열고 다음 쿼리 실행:

```sql
-- Insights 테이블 생성
CREATE TABLE insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tag VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  date VARCHAR(20) NOT NULL,
  image_url TEXT NOT NULL,
  content TEXT,
  author VARCHAR(100),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS (Row Level Security) 활성화
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- 읽기 정책 (게시된 콘텐츠는 누구나 읽기 가능)
CREATE POLICY "Public can read published insights" ON insights
  FOR SELECT USING (published = true);

-- 인증된 사용자는 모든 작업 가능
CREATE POLICY "Authenticated users can do everything" ON insights
  FOR ALL USING (auth.role() = 'authenticated');

-- 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE
  ON insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 6. 관리자 계정 생성

Supabase 대시보드에서:
1. "Authentication" → "Users" 클릭
2. "Invite user" 클릭
3. 관리자 이메일 입력
4. 이메일로 받은 링크로 비밀번호 설정

또는 코드로:
```javascript
// 초기 관리자 생성 (한 번만 실행)
const { data, error } = await supabase.auth.signUp({
  email: 'admin@shipdago.com',
  password: 'your-secure-password'
});
```

## 📱 현재 구현된 기능

### 임시 로그인 (Supabase 설정 전 테스트용)
- **이메일**: demo@shipdago.com
- **비밀번호**: demo123
- localStorage 기반 세션 관리

### Supabase 연동 시 장점
1. **24/7 클라우드 호스팅** - 컴퓨터 꺼도 데이터 유지
2. **실시간 동기화** - 여러 기기에서 동시 작업 가능
3. **자동 백업** - 데이터 손실 걱정 없음
4. **보안** - SSL 암호화, RLS 정책
5. **무료 티어** - 500MB 스토리지, 충분한 용량

## 🔧 문제 해결

### CORS 에러 발생 시
- Supabase URL이 올바른지 확인
- `.env` 파일 수정 후 개발 서버 재시작

### 로그인 안 될 때
1. 이메일/비밀번호 확인
2. Supabase 대시보드에서 사용자 확인
3. 네트워크 연결 확인

### 데이터가 안 보일 때
1. RLS 정책 확인
2. 테이블 권한 확인
3. published 필드 값 확인

## 🚨 보안 주의사항

1. **절대 GitHub에 `.env` 파일 커밋하지 마세요!**
2. `.gitignore`에 `.env` 추가 확인
3. 프로덕션 환경에서는 환경 변수 사용
4. 강력한 비밀번호 사용 (최소 12자, 특수문자 포함)

## 📞 지원

문제가 있으시면:
- Supabase 문서: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- 프로젝트 이슈: GitHub Issues에 등록