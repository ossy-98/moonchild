import { STREAMING_PLATFORMS } from '../config/links';

const COUNTER_API_BASE = 'https://abacus.jasoncameron.dev';
const NAMESPACE = 'ossy-moonchild-v1-prod';
const UV_STORAGE_KEY = 'ossy_mc_uv_v1';

// SHA-256("980115Kra!") — 소스코드에 평문 비밀번호가 노출되지 않도록 해시로만 검증
const ADMIN_PASSPHRASE_SHA256 =
  'f64b55abfd89fbe4ddc8f2847607af5607c33329a425a4cfb192378d0e6263dc';

export interface AnalyticsSnapshot {
  totalViews: number;
  uniqueVisitors: number;
  platformClicks: Record<string, number>;
  instagramClicks: number;
  contactClicks: number;
  bookletModalClicks: number;
  fetchedAt: string;
}

/**
 * 순수 JS SHA-256 폴백 포함 해시 계산기 (HTTPS 및 로컬 HTTP 모두 지원)
 */
async function sha256Hex(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const buf = new TextEncoder().encode(input);
    const hashBuf = await window.crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // WebCrypto 비활성 환경용 순수 JS SHA-256
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  const bytes = Array.from(new TextEncoder().encode(input));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push((bitLen / Math.pow(2, i * 8)) & 0xff);

  let [h0, h1, h2, h3, h4, h5, h6, h7] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const w = new Array<number>(64);

  for (let i = 0; i < bytes.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] =
        (bytes[i + t * 4] << 24) |
        (bytes[i + t * 4 + 1] << 16) |
        (bytes[i + t * 4 + 2] << 8) |
        bytes[i + t * 4 + 3];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(7, w[t - 15]) ^ rotr(18, w[t - 15]) ^ (w[t - 15] >>> 3);
      const s1 = rotr(17, w[t - 2]) ^ rotr(19, w[t - 2]) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = [h0, h1, h2, h3, h4, h5, h6, h7];
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + w[t]) | 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => (v >>> 0).toString(16).padStart(8, '0'))
    .join('');
}

/**
 * URL 쿼리스트링(?admin=비밀번호)이 아티스트 본인의 비밀번호와 일치하는지 확인
 * - 주소창 정리는 모달이 실제로 열린 뒤 호출하도록 분리하여 React StrictMode 이중 마운트와 충돌하지 않게 처리
 */
export async function checkAdminUrlAccess(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const candidate = params.get('admin');
  if (!candidate) return false;

  const hash = await sha256Hex(candidate.trim());
  return hash === ADMIN_PASSPHRASE_SHA256;
}

export function clearAdminQueryFromUrl(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (params.has('admin')) {
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

/**
 * 카운터 1 증가 (새 탭으로 이동하는 링크 클릭 시에도 유실되지 않도록 keepalive 사용)
 */
async function incrementKey(key: string): Promise<void> {
  try {
    await fetch(`${COUNTER_API_BASE}/hit/${NAMESPACE}/${key}`, {
      method: 'GET',
      keepalive: true,
      cache: 'no-store',
    });
  } catch {
    // 네트워크 차단/애드블록 환경에서도 사용자 UX에 영향 없도록 무시
  }
}

/**
 * 카운터 현재 값 조회 (아직 생성되지 않은 키는 0 반환)
 */
async function getKeyCount(key: string): Promise<number> {
  try {
    const res = await fetch(`${COUNTER_API_BASE}/get/${NAMESPACE}/${key}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data?.value === 'number' ? data.value : 0;
  } catch {
    return 0;
  }
}

/**
 * 일반 방문자 페이지 접속 시 조회수(Total Views) 및 순 방문자(Unique Visitors) 기록
 */
export async function trackPageView(): Promise<void> {
  await incrementKey('total_views');

  try {
    const alreadyVisited = localStorage.getItem(UV_STORAGE_KEY);
    if (!alreadyVisited) {
      localStorage.setItem(UV_STORAGE_KEY, '1');
      await incrementKey('unique_visitors');
    }
  } catch {
    // 시크릿 모드 등 localStorage 제한 시 무시
  }
}

/**
 * 각 북클릿(음원 스트리밍 플랫폼) 링크 클릭 기록
 */
export function trackPlatformClick(platformId: string): void {
  void incrementKey(`click_${platformId}`);
}

/**
 * 기타 주요 버튼(인스타그램, 이메일 문의, 전체 북클릿 열기) 클릭 기록
 */
export function trackExtraClick(
  action: 'instagram' | 'contact' | 'booklet_modal'
): void {
  void incrementKey(`click_${action}`);
}

/**
 * 관리자 전용 전체 통계 데이터 일괄 조회
 */
export async function fetchAllAnalytics(): Promise<AnalyticsSnapshot> {
  const platformIds = STREAMING_PLATFORMS.map((p) => p.id);

  const [
    totalViews,
    uniqueVisitors,
    instagramClicks,
    contactClicks,
    bookletModalClicks,
    ...platformCounts
  ] = await Promise.all([
    getKeyCount('total_views'),
    getKeyCount('unique_visitors'),
    getKeyCount('click_instagram'),
    getKeyCount('click_contact'),
    getKeyCount('click_booklet_modal'),
    ...platformIds.map((id) => getKeyCount(`click_${id}`)),
  ]);

  const platformClicks: Record<string, number> = {};
  platformIds.forEach((id, idx) => {
    platformClicks[id] = platformCounts[idx] ?? 0;
  });

  return {
    totalViews,
    uniqueVisitors,
    platformClicks,
    instagramClicks,
    contactClicks,
    bookletModalClicks,
    fetchedAt: new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}
