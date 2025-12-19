# Vercel 배포 가이드 - 환경 변수 안전 설정

## 🔐 중요: API 키 보안

**절대 API 키를 GitHub에 커밋하지 마세요!**
Vercel 대시보드에서 환경 변수를 설정하면 안전하게 관리됩니다.

## 📝 Vercel 환경 변수 설정 방법

### 1. Vercel 대시보드 접속
1. [vercel.com](https://vercel.com) 로그인
2. 프로젝트 선택 (shipdago 또는 해당 프로젝트명)

### 2. 환경 변수 추가
1. **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 클릭
3. 다음 변수들을 추가:

| Name | Value | Environment |
|------|-------|------------|
| `VITE_SUPABASE_URL` | `https://pjrgfmqjfacvhumurlcw.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON` | `eyJhbGciOiJIUzI1NiI...` (실제 키) | Production, Preview, Development |

### 3. 변수 추가 단계별:
1. **Key** 필드에 `VITE_SUPABASE_URL` 입력
2. **Value** 필드에 Supabase URL 붙여넣기
3. **Environment** 체크박스 모두 선택 (Production, Preview, Development)
4. **Save** 클릭
5. 같은 방법으로 `VITE_SUPABASE_ANON` 추가

### 4. 재배포
환경 변수 추가 후 재배포 필요:
1. **Deployments** 탭으로 이동
2. 최근 배포의 **...** 메뉴 클릭
3. **Redeploy** 선택
4. **Use existing Build Cache** 체크 해제
5. **Redeploy** 클릭

## 🖥️ 로컬 개발 설정

### .env.local 파일 (Git에 커밋되지 않음)
```env
VITE_SUPABASE_URL=https://pjrgfmqjfacvhumurlcw.supabase.co
VITE_SUPABASE_ANON=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 개발 서버 재시작
```bash
npm run dev
```

## ✅ 체크리스트

- [ ] `.env.local` 파일 생성 (로컬 개발용)
- [ ] `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- [ ] Vercel 대시보드에서 환경 변수 설정
- [ ] GitHub에 푸시하기 전 `.env` 파일이 없는지 확인
- [ ] Vercel에서 재배포 실행
- [ ] 배포된 사이트에서 기능 테스트

## 🔍 확인 방법

### 1. 환경 변수가 제대로 설정되었는지 확인
브라우저 콘솔에서 Supabase 관련 에러가 없는지 확인

### 2. Git 상태 확인
```bash
git status
```
`.env.local`이 표시되지 않아야 함

### 3. GitHub 확인
GitHub 저장소에서 `.env` 파일이 없는지 확인

## ⚠️ 주의사항

1. **anon key는 공개되어도 괜찮습니다**
   - 이 키는 공개용(public) 키입니다
   - RLS(Row Level Security) 정책으로 보호됩니다

2. **service_role key는 절대 노출하면 안됩니다**
   - 서버 사이드에서만 사용
   - 절대 클라이언트 코드에 포함하지 마세요

3. **환경 변수 업데이트 시**
   - Vercel에서 수정 후 반드시 재배포
   - 로컬에서는 개발 서버 재시작

## 🚀 자동 배포 워크플로우

1. 코드 변경 → GitHub 푸시
2. Vercel이 자동으로 감지하여 빌드
3. 환경 변수는 Vercel 대시보드의 값 사용
4. 빌드 완료 후 자동 배포

## 📞 문제 해결

### Supabase 연결 오류
- Vercel 대시보드에서 환경 변수 확인
- 변수명이 정확한지 확인 (`VITE_` 접두사 필수)
- 재배포 실행

### 로컬에서는 되는데 배포 후 안 될 때
- Vercel 환경 변수 설정 확인
- Build 로그에서 에러 확인
- 환경 변수 스코프 확인 (Production 체크)

### API 키가 GitHub에 노출된 경우
1. 즉시 Supabase 대시보드에서 키 재생성
2. GitHub에서 해당 커밋 삭제
3. Vercel 환경 변수 업데이트
4. `.env.local` 업데이트