import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlatformItem } from '../config/links';
import { PlatformIcon } from './PlatformIcon';
import { ScrawlText } from './ScrawlText';

interface CoverFlow3DProps {
  items: PlatformItem[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onZoomBooklet: (item: PlatformItem) => void;
  onOpenAllBooklets: () => void;
}

/**
 * iPhone(iOS) 스타일 고무줄 저항 함수:
 * 양 끝단 밖 빈 공간으로 당길 때 최대 0.11칸까지만 짧고 단단하게 당겨지도록 제한
 */
function applyIosRubberBand(rawPos: number, maxIndex: number): number {
  const maxOverscroll = 0.11;
  if (rawPos < 0) {
    const d = -rawPos;
    return -maxOverscroll * (1 - 1 / (d * 4 + 1));
  }
  if (rawPos > maxIndex) {
    const d = rawPos - maxIndex;
    return maxIndex + maxOverscroll * (1 - 1 / (d * 4 + 1));
  }
  return rawPos;
}

/**
 * "사진을 전체보기(북클릿 갤러리 모아보기) 할 수 있구나!" 하고 직관적으로 느껴지는
 * 커스텀 멀티 포토 스택 & 갤러리 그리드 아이콘
 */
const AllPhotosGalleryIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 뒤에 겹쳐진 북클릿 사진 카드들 */}
    <path
      d="M7 3.5H18.5C19.6046 3.5 20.5 4.39543 20.5 5.5V17"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeOpacity="0.65"
    />
    {/* 전면 메인 사진 액자 */}
    <rect
      x="3.5"
      y="6.5"
      width="14"
      height="14"
      rx="2.6"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    {/* 액자 내부 미니 태양(원) & 산/아트워크 실루엣 */}
    <circle cx="7.8" cy="10.8" r="1.4" fill="currentColor" />
    <path
      d="M4.5 18L8.4 13.8L11.4 16.6L13.8 14.3L16.5 18"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CoverFlow3D: React.FC<CoverFlow3DProps> = ({
  items,
  activeIndex,
  onSelectIndex,
  onZoomBooklet,
  onOpenAllBooklets,
}) => {
  const maxIndex = items.length - 1;

  const [scrollPos, setScrollPos] = useState<number>(activeIndex);
  const scrollPosRef = useRef<number>(activeIndex);
  const liveIndexRef = useRef<number>(activeIndex);

  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const animRafRef = useRef<number | null>(null);
  const isTouchingRef = useRef<boolean>(false);
  const didMoveRef = useRef<boolean>(false);

  // 트랙패드/마우스 휠: 1번 스크롤할 때 무조건 1장씩만 넘어가도록 제어하는 Ref
  const wheelAccumRef = useRef<number>(0);
  const wheelLockedDirRef = useRef<-1 | 0 | 1>(0);
  const wheelHasDecayedRef = useRef<boolean>(false);
  const wheelLastTriggerTimeRef = useRef<number>(0);
  const wheelIdleTimerRef = useRef<number | null>(null);

  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startCardIndex: number;
    hasCaptured: boolean;
  } | null>(null);

  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLandscapeShort = viewport.height < 560;
  const isMobile = viewport.width < 640;

  const cardSize = isLandscapeShort
    ? Math.min(viewport.height * 0.42, 200)
    : isMobile
    ? Math.min(viewport.width * 0.6, viewport.height * 0.35, 268)
    : Math.min(viewport.width * 0.35, viewport.height * 0.4, 330);

  const baseSpread = cardSize * 0.56;
  const stackStep = cardSize * 0.24;
  // 드래그 감도를 훨씬 차분하고 묵직하게 조정 (카드 폭의 약 75%를 밀어야 1칸 이동)
  const dragUnitPx = Math.max(150, cardSize * 0.75);

  const clampIndex = useCallback(
    (idx: number) => Math.max(0, Math.min(maxIndex, Math.round(idx))),
    [maxIndex]
  );

  const syncLiveIndex = useCallback(
    (pos: number) => {
      const nearest = clampIndex(pos);
      if (nearest !== liveIndexRef.current) {
        liveIndexRef.current = nearest;
        onSelectIndex(nearest);
      }
    },
    [clampIndex, onSelectIndex]
  );

  /**
   * 목표 북클릿으로 부드럽게 스냅 이동
   */
  const snapToCard = useCallback(
    (targetIdx: number, isEdgeBounce = false) => {
      const clampedTarget = clampIndex(targetIdx);
      liveIndexRef.current = clampedTarget;
      onSelectIndex(clampedTarget);

      if (animRafRef.current) {
        cancelAnimationFrame(animRafRef.current);
        animRafRef.current = null;
      }

      let lastFrameTime = performance.now();
      const decayBase = isEdgeBounce ? 0.6 : 0.74;

      const step = (now: number) => {
        if (isTouchingRef.current) {
          animRafRef.current = null;
          return;
        }

        const dt = Math.min(2.2, Math.max(0.5, (now - lastFrameTime) / 16.67));
        lastFrameTime = now;

        const current = scrollPosRef.current;
        const diff = clampedTarget - current;

        if (Math.abs(diff) < 0.0015) {
          scrollPosRef.current = clampedTarget;
          setScrollPos(clampedTarget);
          animRafRef.current = null;
          return;
        }

        const next = current + diff * (1 - Math.pow(decayBase, dt));
        scrollPosRef.current = next;
        setScrollPos(next);

        animRafRef.current = requestAnimationFrame(step);
      };

      animRafRef.current = requestAnimationFrame(step);
    },
    [clampIndex, onSelectIndex]
  );

  /**
   * 양 끝(첫 번째 또는 마지막 북클릿)에서 빈 공간으로 휠 스크롤했을 때
   * 아이폰처럼 짧고 간결하게('톡') 밀렸다가 즉시 돌아오는 모션
   */
  const triggerShortEdgeNudge = useCallback(
    (edgeIdx: number, dir: -1 | 1) => {
      const nudgePos = edgeIdx + dir * 0.095;
      scrollPosRef.current = nudgePos;
      setScrollPos(nudgePos);
      snapToCard(edgeIdx, true);
    },
    [snapToCard]
  );

  // 하단 인디케이터 아이콘 클릭 동기화
  useEffect(() => {
    if (!isTouchingRef.current && activeIndex !== liveIndexRef.current) {
      snapToCard(activeIndex, false);
    }
  }, [activeIndex, snapToCard]);

  useEffect(() => {
    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      if (wheelIdleTimerRef.current) window.clearTimeout(wheelIdleTimerRef.current);
    };
  }, []);

  const goPrev = useCallback(() => {
    if (liveIndexRef.current <= 0) {
      triggerShortEdgeNudge(0, -1);
    } else {
      snapToCard(liveIndexRef.current - 1);
    }
  }, [snapToCard, triggerShortEdgeNudge]);

  const goNext = useCallback(() => {
    if (liveIndexRef.current >= maxIndex) {
      triggerShortEdgeNudge(maxIndex, 1);
    } else {
      snapToCard(liveIndexRef.current + 1);
    }
  }, [maxIndex, snapToCard, triggerShortEdgeNudge]);

  // 키보드 좌우 화살표 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goPrev, goNext]);

  /**
   * 1) 화면 터치/클릭 시작:
   *    - pointerdown 시점에는 setPointerCapture를 호출하지 않아 좌/우 북클릿 클릭이 정상 작동하도록 보장
   *    - 터치하는 동안には 스냅 없이 손가락 위치를 그대로 유지
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;

    if (animRafRef.current) {
      cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
    }

    isTouchingRef.current = true;
    didMoveRef.current = false;

    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startCardIndex: clampIndex(scrollPosRef.current),
      hasCaptured: false,
    };
  };

  /**
   * 2) 화면을 터치한 채 드래그 중:
   *    - 손가락을 따라 부드럽게 움직이고 중간에 멈추면 멈춘 그대로 유지
   *    - 한 번의 드래그에서 최대 ±1장 범위 안에서만 이동하도록 제한하여 너무 빠르게 여러 장 넘어가는 현상 방지
   */
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTouchingRef.current || !dragStateRef.current) return;

    const state = dragStateRef.current;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    if (!didMoveRef.current && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      didMoveRef.current = true;
      if (!state.hasCaptured) {
        state.hasCaptured = true;
        try {
          e.currentTarget.setPointerCapture(state.pointerId);
        } catch {
          // ignore
        }
      }
    }

    if (!didMoveRef.current) return;

    // 한 번의 스와이프에서 시작 카드 기준 최대 ±1장까지만 이동하도록 클램핑
    const deltaCards = Math.max(-1.05, Math.min(1.05, -dx / dragUnitPx));
    const rawNext = state.startCardIndex + deltaCards;
    const displayPos = applyIosRubberBand(rawNext, maxIndex);

    scrollPosRef.current = displayPos;
    setScrollPos(displayPos);
    syncLiveIndex(displayPos);
  };

  /**
   * 3) 화면에서 손가락을 뗐을 때:
   *    - 드래그였다면: 최대 ±1장(또는 현재 가장 가까운 북클릿)으로 스냅
   *    - 단순 터치/클릭이었다면:
   *      * 좌측/우측 옆 북클릿을 터치한 경우 -> 해당 북클릿으로 즉시 이동
   *      * 정중앙 북클릿을 터치한 경우 -> 해당 북클릿 사진 확대(Zoom) 모달 열기
   */
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTouchingRef.current || !dragStateRef.current) return;

    const state = dragStateRef.current;
    const dx = e.clientX - state.startX;
    const wasDrag = didMoveRef.current;

    isTouchingRef.current = false;
    didMoveRef.current = false;
    dragStateRef.current = null;

    if (state.hasCaptured) {
      try {
        e.currentTarget.releasePointerCapture(state.pointerId);
      } catch {
        // ignore
      }
    }

    if (wasDrag) {
      // 드래그 후 손을 뗐을 때: 42px 이상 밀었으면 시작 카드에서 정확히 ±1장만 이동, 아니면 원래 카드로 스냅
      const swipeThresholdPx = 42;
      let targetIdx = state.startCardIndex;
      if (dx < -swipeThresholdPx) {
        targetIdx = Math.min(maxIndex, state.startCardIndex + 1);
      } else if (dx > swipeThresholdPx) {
        targetIdx = Math.max(0, state.startCardIndex - 1);
      }

      const isOutOfBounds =
        scrollPosRef.current < -0.005 || scrollPosRef.current > maxIndex + 0.005;
      snapToCard(targetIdx, isOutOfBounds);
      return;
    }

    // 단순 터치/클릭인 경우: 어떤 북클릿을 터치했는지 판별
    const cardEl = (e.target as HTMLElement).closest('[data-card-index]');
    if (cardEl) {
      const clickedIdx = Number(cardEl.getAttribute('data-card-index'));
      if (!Number.isNaN(clickedIdx)) {
        if (clickedIdx === liveIndexRef.current) {
          onZoomBooklet(items[clickedIdx]);
        } else {
          snapToCard(clickedIdx, false);
        }
        return;
      }
    }

    // 3D 원근 회전 때문에 카드 외곽 여백이 터치된 경우에도 좌/우 영역 판별로 자연스럽게 넘김
    if (stageContainerRef.current) {
      const rect = stageContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const offsetX = e.clientX - centerX;

      if (offsetX < -cardSize * 0.42 && liveIndexRef.current > 0) {
        snapToCard(liveIndexRef.current - 1, false);
      } else if (offsetX > cardSize * 0.42 && liveIndexRef.current < maxIndex) {
        snapToCard(liveIndexRef.current + 1, false);
      } else if (Math.abs(offsetX) <= cardSize * 0.42) {
        onZoomBooklet(items[liveIndexRef.current]);
      }
    }
  };

  /**
   * 트랙패드 / 마우스 휠:
   * - 한 번 스크롤할 때 무조건 한 장씩만 깔끔하게 넘어가도록 제어
   */
  const handleWheel = (e: React.WheelEvent) => {
    if (isTouchingRef.current) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const absDelta = Math.abs(delta);
    if (absDelta < 0.2) return;

    const dir: -1 | 1 = delta > 0 ? 1 : -1;
    const now = performance.now();

    if (wheelIdleTimerRef.current) {
      window.clearTimeout(wheelIdleTimerRef.current);
    }
    wheelIdleTimerRef.current = window.setTimeout(() => {
      wheelLockedDirRef.current = 0;
      wheelAccumRef.current = 0;
      wheelHasDecayedRef.current = false;
    }, 150);

    // 반대 방향으로 스크롤하면 즉시 잠금 해제
    if (wheelLockedDirRef.current !== 0 && dir !== wheelLockedDirRef.current) {
      wheelLockedDirRef.current = 0;
      wheelAccumRef.current = 0;
      wheelHasDecayedRef.current = false;
    }

    // 이미 이번 스크롤에서 1장이 넘어간 상태라면 관성이 멈출 때까지 대기
    if (wheelLockedDirRef.current !== 0) {
      if (absDelta <= 4) {
        wheelHasDecayedRef.current = true;
      }
      if (
        wheelHasDecayedRef.current &&
        absDelta >= 15 &&
        now - wheelLastTriggerTimeRef.current > 250
      ) {
        wheelLockedDirRef.current = 0;
        wheelAccumRef.current = 0;
        wheelHasDecayedRef.current = false;
      } else {
        return;
      }
    }

    wheelAccumRef.current += delta;

    // 22px 이상 누적되면 정확히 1장만 전환
    if (Math.abs(wheelAccumRef.current) >= 22) {
      const triggerDir: -1 | 1 = wheelAccumRef.current > 0 ? 1 : -1;
      wheelLockedDirRef.current = triggerDir;
      wheelAccumRef.current = 0;
      wheelHasDecayedRef.current = false;
      wheelLastTriggerTimeRef.current = now;

      if (triggerDir > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  return (
    <div
      ref={stageContainerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full flex-1 flex flex-col items-center justify-center select-none touch-none overflow-visible cursor-grab active:cursor-grabbing"
      style={{
        perspective: '1200px',
      }}
    >
      {/* 메인 화면 북클릿들 정가운데 위: 전체 북클릿 사진 모아보기 버튼 */}
      <div className="relative z-30 mb-2.5 sm:mb-3.5 flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAllBooklets();
          }}
          aria-label="전체 북클릿 사진 보기"
          title="전체 북클릿 사진 모아보기"
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 border border-white/20 hover:border-white/40 backdrop-blur-xl text-white/90 hover:text-white transition-all duration-200 shadow-[0_6px_24px_rgba(0,0,0,0.55)]"
        >
          <AllPhotosGalleryIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* 좌/우 보조 네비게이션 화살표 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        disabled={activeIndex === 0}
        aria-label="이전 자켓"
        className={`absolute left-3 sm:left-8 z-30 p-2.5 rounded-full border border-white/10 bg-black/45 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/10 hover:border-white/25 transition-all duration-200 ${
          activeIndex === 0 ? 'opacity-20 pointer-events-none' : 'opacity-85'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        disabled={activeIndex === maxIndex}
        aria-label="다음 자켓"
        className={`absolute right-3 sm:right-8 z-30 p-2.5 rounded-full border border-white/10 bg-black/45 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/10 hover:border-white/25 transition-all duration-200 ${
          activeIndex === maxIndex ? 'opacity-20 pointer-events-none' : 'opacity-85'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 3D 스테이지 컨테이너 */}
      <div
        className="relative flex items-center justify-center w-full"
        style={{
          height: cardSize * 1.28,
          transformStyle: 'preserve-3d',
        }}
      >
        {items.map((item, index) => {
          const offset = index - scrollPos;
          const absOffset = Math.abs(offset);
          const isCenterActive = index === activeIndex;

          let translateX = 0;
          let translateZ = 75;
          let rotateY = 0;
          let scale = 1;
          let opacity = 1;

          if (absOffset <= 1) {
            const t = absOffset;
            translateX = offset * baseSpread;
            translateZ = 75 * (1 - t) + -90 * t;
            rotateY = -offset * 48;
            scale = 1 - t * 0.12;
            opacity = 1 - t * 0.18;
          } else {
            const extra = absOffset - 1;
            translateX = Math.sign(offset) * (baseSpread + extra * stackStep);
            translateZ = -90 - extra * 48;
            rotateY = offset < 0 ? 48 : -48;
            scale = Math.max(0.72, 0.88 - extra * 0.05);
            opacity = Math.max(0.22, 0.82 - extra * 0.2);
          }

          const zIndex = 20 - Math.round(absOffset);
          const dimOverlayOpacity = Math.min(0.45, Math.min(1, absOffset) * 0.42);

          return (
            <div
              key={item.id}
              data-card-index={index}
              style={{
                width: cardSize,
                height: cardSize,
                zIndex,
                opacity,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: `translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                willChange: 'transform, opacity',
              }}
              className="absolute group cursor-pointer"
            >
              {/* 메인 앨범 자켓 슬리브 */}
              <div
                className={`relative w-full h-full rounded-[10px] overflow-hidden ${
                  isCenterActive
                    ? 'ring-1 ring-white/35'
                    : 'ring-1 ring-white/15'
                }`}
                style={{
                  boxShadow: isCenterActive
                    ? `0 24px 60px -12px rgba(0,0,0,0.9), 0 0 38px -8px ${item.glowColor}`
                    : '0 14px 34px rgba(0,0,0,0.78)',
                }}
              >
                {/* 북클릿 아트워크 이미지 */}
                <img
                  src={item.coverImage}
                  alt={item.name}
                  draggable={false}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />

                {/* 옆면 카드 어두워짐(Dimming) 오버레이 */}
                <div
                  className="pointer-events-none absolute inset-0 bg-black"
                  style={{ opacity: dimOverlayOpacity }}
                />

                {/* CD/바이닐 자켓 플라스틱 슬리브 광택(Gloss) 레이어 */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 36%, rgba(0,0,0,0.12) 65%, rgba(0,0,0,0.45) 100%)',
                  }}
                />

                {/* 자켓 우측 상단 플랫폼 미니 뱃지 (좌측 상단 숫자 01, 02... 삭제됨) */}
                <div className="pointer-events-none absolute top-2.5 right-2.5 flex items-center justify-end">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-black/65 border border-white/20 text-white shadow-md"
                    style={{
                      color: isCenterActive
                        ? item.accentColor
                        : 'rgba(255,255,255,0.75)',
                    }}
                  >
                    <PlatformIcon platformId={item.id} className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* 중앙(Active) 카드 하단 오버레이: 클릭 시 사진 확대 안내 (삐뚤빼뚤한 손글씨 적용) */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between"
                  style={{
                    opacity: Math.max(0, 1 - absOffset * 1.6),
                  }}
                >
                  <ScrawlText
                    text="Tap to Zoom Artwork"
                    className="text-[12.5px] sm:text-[13.5px] text-white/95 tracking-wide leading-none"
                  />
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-white/15 border border-white/25 text-white group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${item.accentColor}33` }}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* 바닥 거울 반사 효과 */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 rounded-[10px] overflow-hidden select-none"
                style={{
                  top: '100%',
                  marginTop: '8px',
                  height: cardSize * 0.4,
                  transform: 'scaleY(-1)',
                  opacity: Math.max(0.12, 0.32 - absOffset * 0.11),
                  WebkitMaskImage:
                    'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0) 90%)',
                  maskImage:
                    'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0) 90%)',
                }}
              >
                <img
                  src={item.coverImage}
                  alt=""
                  draggable={false}
                  className="w-full object-cover object-bottom"
                  style={{ height: cardSize }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
