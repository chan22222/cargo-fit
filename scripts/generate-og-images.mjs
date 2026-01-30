import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public');

const PROFILES = [
  { code: 'EXW', name: 'Ex Works', emoji: '🏭', nickname: '꿈쩍 않는 미니멀리스트', fullName: '공장인도', color: '#6366f1', personality: '"공장 문 열어뒀으니 가져가세요." 자기 영역 밖의 일에는 절대 관여하지 않는 철저한 개인주의자.' },
  { code: 'FCA', name: 'Free Carrier', emoji: '🚛', nickname: '똑똑한 바통 터치', fullName: '운송인인도', color: '#8b5cf6', personality: '"수출 면허는 끊어놨습니다." 구역이 명확한 것을 선호하는 깔끔한 합리적 현대인.' },
  { code: 'FAS', name: 'Free Alongside Ship', emoji: '⚓', nickname: '거친 현장의 마이웨이', fullName: '선측인도', color: '#06b6d4', personality: '"배 옆 부두 바닥에 내려놨으니, 크레인 작업은 알아서 하쇼." 무뚝뚝한 현장 전문가.' },
  { code: 'FOB', name: 'Free On Board', emoji: '🚢', nickname: '무역계의 교과서', fullName: '본선인도', color: '#0ea5e9', personality: '"난간 넘어가면 제 책임 끝입니다!" 전 세계 어디서나 통하는 가장 대중적인 인싸.' },
  { code: 'CFR', name: 'Cost and Freight', emoji: '💰', nickname: '계산 빠른 전략가', fullName: '운임포함인도', color: '#14b8a6', personality: '"도착지까지 운임은 제가 낼게요." 생색과 실속을 동시에 챙기는 머리 회전 빠른 타입.' },
  { code: 'CPT', name: 'Carriage Paid To', emoji: '✈️', nickname: '유연한 멀티 플레이어', fullName: '운송비지급인도', color: '#10b981', personality: '"비행기든 트럭이든 다 됩니다." 모든 수단을 활용하는 상황 대처 능력이 뛰어난 타입.' },
  { code: 'CIF', name: 'Cost, Insurance and Freight', emoji: '🛡️', nickname: '가성비 수호자', fullName: '운임보험료포함인도', color: '#22c55e', personality: '"걱정 마세요, 보험도 들어뒀습니다." 형식과 실속을 동시에 챙기는 알뜰한 타입.' },
  { code: 'CIP', name: 'Carriage and Insurance Paid To', emoji: '🔒', nickname: '완벽주의 과보호러', fullName: '운송비보험료지급인도', color: '#84cc16', personality: '"풀커버 보험 가입했습니다." 작은 리스크도 용납하지 못하는 꼼꼼한 타입.' },
  { code: 'DAP', name: 'Delivered at Place', emoji: '📦', nickname: '문 앞의 에스코트', fullName: '도착장소인도', color: '#eab308', personality: '"목적지 도착했습니다." 집 앞까지 모셔다드리는 은근한 밀당의 고수.' },
  { code: 'DPU', name: 'Delivered at Place Unloaded', emoji: '🏗️', nickname: '끝장 보는 현장 반장', fullName: '도착지양하인도', color: '#f97316', personality: '"바닥에 안전하게 내려놓는 것까지 제가 해야 합니다." 끝마무리를 직접 해야 직성이 풀리는 타입.' },
  { code: 'DDP', name: 'Delivered Duty Paid', emoji: '👑', nickname: 'VVIP 콘시어지', fullName: '관세지급인도', color: '#ef4444', personality: '"아무것도 신경 쓰지 마세요. 통관, 세금, 배송 다 끝났습니다." 헌신적인 리더 타입.' },
];

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateHtml(profile) {
  const { code, name, emoji, nickname, fullName, color, personality } = profile;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui, -apple-system, sans-serif; }
  .card {
    width: 1200px; height: 630px;
    background: linear-gradient(135deg, ${hexToRgba(color, 0.08)}, ${hexToRgba(color, 0.02)}, #ffffff);
    position: relative; display: flex; flex-direction: column;
  }
  .top-bar { height: 6px; background: linear-gradient(90deg, ${color}, ${hexToRgba(color, 0.4)}); }
  .watermark {
    position: absolute; top: 40px; right: 50px;
    font-size: 160px; font-weight: 900; opacity: 0.04;
    color: ${color}; transform: rotate(-15deg); line-height: 1;
  }
  .content {
    flex: 1; display: flex; align-items: center;
    padding: 40px 80px; gap: 60px; position: relative;
  }
  .left { display: flex; flex-direction: column; align-items: center; gap: 20px; flex-shrink: 0; }
  .emoji { font-size: 140px; line-height: 1; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.12)); }
  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 24px; border-radius: 999px;
    background: ${color}; color: white;
    font-size: 18px; font-weight: 900;
    box-shadow: 0 4px 14px ${hexToRgba(color, 0.3)};
  }
  .badge-sep { opacity: 0.5; }
  .badge-name { font-weight: 600; opacity: 0.9; }
  .right { flex: 1; display: flex; flex-direction: column; gap: 12px; }
  .nickname { font-size: 48px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; line-height: 1.2; }
  .full-name { font-size: 18px; color: #94a3b8; font-weight: 500; }
  .personality { font-size: 20px; color: #475569; line-height: 1.6; margin-top: 8px; }
  .branding {
    position: absolute; bottom: 30px; right: 50px;
    display: flex; align-items: center; gap: 12px;
    font-size: 18px; color: #94a3b8; font-weight: 700;
  }
  .branding-dot { width: 6px; height: 6px; border-radius: 50%; background: ${color}; }
</style>
</head>
<body>
<div class="card">
  <div class="top-bar"></div>
  <div class="watermark">${code}</div>
  <div class="content">
    <div class="left">
      <div class="emoji">${emoji}</div>
      <div class="badge">
        <span>${code}</span>
        <span class="badge-sep">|</span>
        <span class="badge-name">${name}</span>
      </div>
    </div>
    <div class="right">
      <div class="nickname">${nickname}</div>
      <div class="full-name">${fullName}</div>
      <div class="personality">${personality}</div>
    </div>
  </div>
  <div class="branding">
    <div class="branding-dot"></div>
    <span>Trade MBTI</span>
    <div class="branding-dot"></div>
    <span>쉽다고 SHIPDAGO</span>
  </div>
</div>
</body>
</html>`;
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  for (const profile of PROFILES) {
    const html = generateHtml(profile);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const outputPath = path.join(OUTPUT_DIR, `og-mbti-${profile.code}.png`);
    await page.screenshot({ path: outputPath, type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
    process.stdout.write(`Generated: og-mbti-${profile.code}.png\n`);
  }

  await browser.close();
  process.stdout.write('Done! All 11 OG images generated.\n');
}

main().catch(console.error);
