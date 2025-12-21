# IP 기반 Rate Limiting 설정 가이드

## 1. 에러 수정 완료 ✅
`parsedSubmissions.filter` 에러를 수정했습니다. localStorage 데이터가 배열이 아닌 경우를 처리하도록 개선했습니다.

## 2. IP 기반 Rate Limiting 구현

### 방법 1: Supabase Edge Function (권장)

#### 1단계: Edge Function 배포
```bash
# Supabase CLI 설치 (아직 안했다면)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref [your-project-ref]

# Edge Function 배포
supabase functions deploy submit-feedback
```

#### 2단계: 환경 변수 설정
Supabase 대시보드에서:
1. Settings → Edge Functions
2. 다음 환경 변수 추가:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### 3단계: 데이터베이스 테이블 수정
```sql
-- IP 주소와 User Agent 컬럼 추가
ALTER TABLE feedbacks
ADD COLUMN ip_address VARCHAR(45),
ADD COLUMN user_agent TEXT;

-- 인덱스 추가 (성능 향상)
CREATE INDEX idx_feedbacks_ip_created
ON feedbacks(ip_address, created_at);
```

#### 4단계: FeedbackModal 수정 (Edge Function 사용)
```typescript
// FeedbackModal.tsx 수정
import { submitFeedbackViaEdgeFunction } from '../lib/feedback-api';

// handleSubmit 함수에서:
const response = await submitFeedbackViaEdgeFunction(sanitizedForm);

if (response.success) {
  // 성공 처리
} else if (response.cooldown) {
  setCooldownRemaining(response.cooldown);
} else {
  setSubmitMessage(response.error || '오류 발생');
}
```

### 방법 2: Vercel Edge Middleware (Vercel 배포 시)

`middleware.ts` 파일 생성:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/feedback') {
    const ip = request.ip ?? 'unknown';
    const limit = 5; // 시간당 5회
    const window = 60 * 60 * 1000; // 1시간

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const timestamps = rateLimitMap.get(ip);
    const now = Date.now();
    const recentTimestamps = timestamps.filter((t: number) => now - t < window);

    if (recentTimestamps.length >= limit) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    recentTimestamps.push(now);
    rateLimitMap.set(ip, recentTimestamps);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 방법 3: Cloudflare Workers (Cloudflare 사용 시)

```javascript
// worker.js
const RATE_LIMIT = 5;
const TIME_WINDOW = 3600; // 1시간 (초)

export default {
  async fetch(request, env, ctx) {
    const ip = request.headers.get('CF-Connecting-IP');

    // KV 스토어에서 요청 횟수 확인
    const key = `rate_limit:${ip}`;
    const count = await env.RATE_LIMIT.get(key);

    if (count && parseInt(count) >= RATE_LIMIT) {
      return new Response('Too many requests', { status: 429 });
    }

    // 카운트 증가
    const newCount = count ? parseInt(count) + 1 : 1;
    await env.RATE_LIMIT.put(key, newCount.toString(), {
      expirationTtl: TIME_WINDOW
    });

    // 원래 요청 처리
    return fetch(request);
  }
};
```

## 3. 추가 보안 강화

### Redis를 사용한 분산 Rate Limiting (프로덕션 권장)

```typescript
// redis-rate-limit.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 3600); // 1시간 만료
  }

  return count <= 5;
}
```

### reCAPTCHA v3 통합

```typescript
// FeedbackModal에 추가
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const { executeRecaptcha } = useGoogleReCaptcha();

const handleSubmit = async () => {
  const token = await executeRecaptcha('submit_feedback');

  // 서버로 token 전송하여 검증
  const response = await fetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({
      ...feedbackData,
      recaptchaToken: token
    })
  });
};
```

## 4. 현재 구현된 보안 기능

✅ **클라이언트 측 보안:**
- localStorage 기반 rate limiting (시간당 3회)
- 5분 cooldown 타이머
- Honeypot 필드 (봇 탐지)
- XSS 방지 (input sanitization)
- 스팸 패턴 감지
- 입력 길이 제한

✅ **서버 측 보안 (Edge Function):**
- IP 기반 rate limiting
- 서버 측 validation
- 스팸 필터링
- SQL injection 방지 (Supabase 자동 처리)

## 5. 모니터링 & 로깅

```sql
-- 의심스러운 활동 모니터링
SELECT
  ip_address,
  COUNT(*) as submission_count,
  DATE_TRUNC('hour', created_at) as hour
FROM feedbacks
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address, hour
HAVING COUNT(*) > 3
ORDER BY submission_count DESC;
```

## 6. 테스트 방법

1. **Rate Limit 테스트:**
   - 같은 IP에서 빠르게 여러 번 제출
   - 429 상태 코드 확인

2. **Honeypot 테스트:**
   - 브라우저 개발자 도구로 숨겨진 필드 채우기
   - 제출이 거부되는지 확인

3. **XSS 테스트:**
   - `<script>alert('test')</script>` 입력
   - 스크립트가 제거되는지 확인

## 주의사항

- Edge Function은 배포 후 몇 분 정도 시간이 걸릴 수 있습니다
- IP 주소는 개인정보이므로 GDPR 준수 필요
- 프로덕션에서는 Redis 또는 전용 rate limiting 서비스 사용 권장