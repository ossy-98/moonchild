import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import {
  ARTIST_CONFIG,
  STREAMING_PLATFORMS,
  PlatformItem,
} from './config/links';
import { CoverFlow3D } from './components/CoverFlow3D';
import { PlatformIcon } from './components/PlatformIcon';
import { CollageTitle } from './components/CollageTitle';
import { BookletModal } from './components/BookletModal';
import { ZoomImageModal } from './components/ZoomImageModal';
import { ScrawlText } from './components/ScrawlText';
import { AdminAnalyticsModal } from './components/AdminAnalyticsModal';
import {
  checkAdminUrlAccess,
  clearAdminQueryFromUrl,
  trackPageView,
  trackPlatformClick,
  trackExtraClick,
} from './utils/analytics';

/**
 * 실제 인스타그램 공식 앱 아이콘 (iOS/macOS 풀컬러 스쿼클 그라데이션 아이콘)
 */
const InstagramAppIcon: React.FC<{ className?: string }> = ({
  className = 'w-8 h-8',
}) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <radialGradient
        id="ig-grad-1"
        cx="30%"
        cy="107%"
        r="135%"
        fx="30%"
        fy="107%"
      >
        <stop offset="0%" stopColor="#FDF497" />
        <stop offset="8%" stopColor="#FDF497" />
        <stop offset="45%" stopColor="#FD5949" />
        <stop offset="62%" stopColor="#D6249F" />
        <stop offset="92%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect
      x="10"
      y="10"
      width="100"
      height="100"
      rx="23"
      fill="url(#ig-grad-1)"
    />
    <rect
      x="28"
      y="28"
      width="64"
      height="64"
      rx="16"
      stroke="white"
      strokeWidth="6.5"
    />
    <circle
      cx="60"
      cy="60"
      r="14.5"
      stroke="white"
      strokeWidth="6.5"
    />
    <circle cx="77" cy="43" r="4.2" fill="white" />
  </svg>
);

/**
 * 선이 하나로 이어져 있으면서도 손으로 삐뚤게 그린 듯한 화살표 아이콘
 */
const ConnectedArrowIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-3.5',
}) => (
  <svg
    viewBox="0 0 24 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M1.5 8.1C6.4 6.2 13.8 7.6 21 6.7M21 6.7C18.4 4.8 16.5 3.1 14.8 1.6M21 6.7C18.5 8.6 16.4 10.6 14.9 12.4"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const App: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isBookletOpen, setIsBookletOpen] = useState<boolean>(false);
  const [zoomedBooklet, setZoomedBooklet] = useState<PlatformItem | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  const didInitAnalyticsRef = useRef<boolean>(false);

  const activePlatform =
    STREAMING_PLATFORMS[activeIndex] ?? STREAMING_PLATFORMS[0];

  // 페이지 진입 시: ?admin=비밀번호 접속이면 비밀 통계창을 열고, 일반 방문자면 조회수 트래킹
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const isAdmin = await checkAdminUrlAccess();
      if (cancelled) return;

      if (isAdmin) {
        setIsAdminOpen(true);
        // 모달이 열린 뒤 주소창에서 ?admin=... 제거
        clearAdminQueryFromUrl();
        return;
      }

      if (!didInitAnalyticsRef.current) {
        didInitAnalyticsRef.current = true;
        await trackPageView();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 이메일 버튼 클릭 시 사용 중인 맥북 '메일' 앱(또는 기본 메일 클라이언트)으로 즉시 이동
  const handleEmailClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      trackExtraClick('contact');
      const mailtoUrl = `mailto:${ARTIST_CONFIG.email}`;

      if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      ) {
        e.preventDefault();
        try {
          const res = await fetch('/__open_mail', { method: 'POST' });
          if (res.ok) return;
        } catch {
          // 폴백
        }
        window.location.href = mailtoUrl;
      }
    },
    []
  );

  return (
    <div className="relative w-full h-[100dvh] bg-[#060609] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* 다이나믹 앰비언트 백그라운드 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] rounded-full blur-[110px] transition-colors duration-300 opacity-30"
          style={{ backgroundColor: activePlatform.accentColor }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 44%, rgba(6,6,9,0.25) 0%, rgba(6,6,9,0.82) 65%, rgba(6,6,9,0.98) 100%)',
          }}
        />
      </div>

      {/* 1. 상단 헤더 */}
      <header className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-8 pt-3.5 sm:pt-6 pb-1 flex flex-col shrink-0">
        <div className="flex items-start justify-between gap-2">
          {/* 좌측: 메인 커버 썸네일 & 빈티지 콜라주 타이포그래피 */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-white/25 shadow-lg shrink-0">
              <img
                src={ARTIST_CONFIG.mainCoverImage}
                alt="moonchild main cover"
                draggable={false}
                className="w-full h-full object-cover"
              />
            </div>

            <CollageTitle />
          </div>

          {/* 우측: 정돈된 손글씨 ('instagram →', 'contact →') + 아이콘 */}
          <div className="flex flex-col items-end gap-1">
            {/* 인스타그램 행 */}
            <a
              href={ARTIST_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackExtraClick('instagram')}
              aria-label={`Instagram ${ARTIST_CONFIG.instagramHandle}`}
              title={`Instagram (${ARTIST_CONFIG.instagramHandle})`}
              className="group flex items-center gap-2 transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-1.5 text-[13px] sm:text-[14px] text-white/95 group-hover:text-white whitespace-nowrap leading-none">
                <ScrawlText text="instagram" />
                <ConnectedArrowIcon className="w-4 h-3.5 text-white/90 -rotate-2 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="flex items-center justify-center w-8 h-8 drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)]">
                <InstagramAppIcon className="w-7 h-7 sm:w-8 sm:h-8" />
              </span>
            </a>

            {/* 메일(contact) 행 */}
            <a
              href={`mailto:${ARTIST_CONFIG.email}`}
              onClick={handleEmailClick}
              aria-label={`Send Email to ${ARTIST_CONFIG.email}`}
              title={`메일 보내기 (${ARTIST_CONFIG.email})`}
              className="group flex items-center gap-2 transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-1.5 text-[13px] sm:text-[14px] text-white/95 group-hover:text-white whitespace-nowrap leading-none">
                <ScrawlText text="contact" />
                <ConnectedArrowIcon className="w-4 h-3.5 text-white/90 rotate-2 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="flex items-center justify-center w-8 h-8 drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)]">
                <img
                  src="/icons/macos-mail.png"
                  alt="Mac Mail"
                  draggable={false}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain select-none"
                />
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. 메인 3D Cover Flow 영역 */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center min-h-0">
        <CoverFlow3D
          items={STREAMING_PLATFORMS}
          activeIndex={activeIndex}
          onSelectIndex={setActiveIndex}
          onZoomBooklet={setZoomedBooklet}
          onOpenAllBooklets={() => {
            trackExtraClick('booklet_modal');
            setIsBookletOpen(true);
          }}
        />
      </main>

      {/* 3. 자켓 하단 UI: 현재 중앙 자켓과 실시간 일치하는 캡슐 버튼 + 6개 미니 아이콘 인디케이터 */}
      <footer className="relative z-20 w-full max-w-xl mx-auto px-4 pb-4 sm:pb-7 pt-1 flex flex-col items-center gap-3 sm:gap-3.5 shrink-0">
        {/* 중앙 자켓 매칭 플랫폼 캡슐(Pill) 버튼 (클릭 시 해당 북클릿/플랫폼 클릭 수 트래킹) */}
        <a
          href={activePlatform.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackPlatformClick(activePlatform.id)}
          className="group relative flex items-center justify-between gap-4 min-w-[244px] sm:min-w-[274px] pl-4 pr-3.5 py-2.5 sm:py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] active:scale-[0.98] border border-white/20 backdrop-blur-2xl transition-all duration-150"
          style={{
            boxShadow: `0 10px 35px -5px ${activePlatform.glowColor}, inset 0 1px 0 0 rgba(255,255,255,0.22)`,
          }}
        >
          <div className="flex items-center gap-3.5">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-inner transition-all duration-150 group-hover:scale-110"
              style={{
                backgroundColor: `${activePlatform.accentColor}28`,
                color: activePlatform.accentColor,
                border: `1px solid ${activePlatform.accentColor}66`,
              }}
            >
              <PlatformIcon
                platformId={activePlatform.id}
                className="w-4 h-4"
              />
            </span>
            <div
              className="flex flex-col text-left leading-tight"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
              }}
            >
              <span className="text-[11px] font-medium tracking-[-0.01em] text-white/55">
                Stream Single on
              </span>
              <span className="text-[15px] sm:text-[16px] font-semibold tracking-[-0.02em] text-white">
                {activePlatform.name}
              </span>
            </div>
          </div>

          <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white/85 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </a>

        {/* 최하단 6개 플랫폼 미니 아이콘 인디케이터 도크 */}
        <nav
          aria-label="음원 스트리밍 플랫폼 선택"
          className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl"
        >
          {STREAMING_PLATFORMS.map((platform, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`${platform.name} 자켓으로 이동`}
                aria-current={isSelected ? 'true' : undefined}
                title={`${platform.name} (${platform.nameKo})`}
                className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 ${
                  isSelected
                    ? 'text-white scale-110'
                    : 'text-white/40 hover:text-white/75 hover:bg-white/[0.05]'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="activePlatformIndicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="absolute inset-0 rounded-full border border-white/25"
                    style={{
                      backgroundColor: `${platform.accentColor}26`,
                      boxShadow: `0 0 16px ${platform.glowColor}`,
                    }}
                  />
                )}
                <span
                  className="relative z-10"
                  style={{
                    color: isSelected ? platform.accentColor : undefined,
                  }}
                >
                  <PlatformIcon
                    platformId={platform.id}
                    className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                  />
                </span>
              </button>
            );
          })}
        </nav>
      </footer>

      {/* 메인 북클릿 사진 클릭 시 열리는 1단 확대 모달 */}
      <ZoomImageModal
        item={zoomedBooklet}
        onClose={() => setZoomedBooklet(null)}
      />

      {/* 북클릿 정가운데 위 갤러리 버튼 클릭 시 열리는 전체 북클릿 & 크레딧 팝업 */}
      <BookletModal
        isOpen={isBookletOpen}
        onClose={() => setIsBookletOpen(false)}
      />

      {/* ?admin=980115Kra! 로 접속했을 때만 열리는 아티스트 전용 비공개 조회수 & 클릭 통계창 */}
      <AdminAnalyticsModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
};

export default App;
