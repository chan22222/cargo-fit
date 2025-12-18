# SHIPDA - 3D Container Loading Simulator

## 개요
SHIPDA는 웹 기반 3D 컨테이너 적재 시뮬레이터입니다. 화물의 효율적인 배치를 시각화하고 최적화할 수 있는 도구입니다.

## 주요 기능

### 📦 컨테이너 적재 시뮬레이터
- 다양한 컨테이너 타입 지원 (10ft, 20ft, 20HQ, 40ft, 40HQ, 45HQ, Open Top)
- 실시간 3D 시각화
- 드래그 앤 드롭으로 화물 재배치
- 공간 효율성 실시간 계산

### 🎯 팔레트 화물 빌더
- 3D 팔레트 화물 구성
- 6방향 자동 회전 최적화
- 층별 패킹 패턴 (격자, 나선형, 모서리, 중앙)
- 복합 화물 생성 및 수정

### ⚡ 스마트 기능
- 자동 최적화 배치
- 화물 자동 회전으로 공간 활용도 극대화
- 무게 중심 시각화
- 깊이 정렬 알고리즘으로 360도 회전 지원

## 설치 및 실행

### 요구사항
- Node.js 16.0 이상
- npm 또는 yarn

### 로컬 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/chan22222/cargo-fit.git
cd cargo-fit
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 http://localhost:5173 접속

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 기술 스택

- **Frontend**: React, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **3D Visualization**: SVG 기반 커스텀 렌더링

## 사용 방법

1. **화물 추가**: 우측 패널에서 화물 정보 입력
2. **프리셋 활용**: 미리 정의된 박스 크기 선택
3. **팔레트 화물**: "팔레트 화물 적재" 버튼으로 복합 화물 생성
4. **자동 최적화**: "자동 최적화" 버튼으로 효율적인 배치
5. **수동 조정**: 3D 뷰어에서 드래그로 화물 위치 조정

## 라이선스

**Proprietary License - All Rights Reserved**

이 소프트웨어는 저작권법에 의해 보호됩니다.
- ❌ **상업적 이용 금지**
- ❌ **재배포 금지**
- ❌ **수정 및 파생 저작물 금지**
- ✅ **개인적, 교육적 목적으로만 사용 가능**

자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

## 개발자

Developed by chan22222

## 기여하기

이슈 제보나 풀 리퀘스트는 언제나 환영합니다.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request