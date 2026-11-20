import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Disc3 } from 'lucide-react';
import { ARTIST_CONFIG, FULL_BOOKLET_ARCHIVE } from '../config/links';

interface BookletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookletModal: React.FC<BookletModalProps> = ({ isOpen, onClose }) => {
  const total = FULL_BOOKLET_ARCHIVE.length;
  const [selectedIdx, setSelectedIdx] = useState(0);

  // 연속 드래그 오프셋 (px)
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // 트랙패드/휠 스크롤 정밀 제어용 Ref
  const wheelAccumRef = useRef<number>(0);
  const wheelLockedDirRef = useRef<-1 | 0 | 1>(0);
  const wheelHasDecayedRef = useRef<boolean>(false);
  const wheelLastTriggerTimeRef = useRef<number>(0);
  const wheelIdleTimerRef = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : prev));
    setDragOffsetPx(0);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIdx((prev) => (prev < total - 1 ? prev + 1 : prev));
    setDragOffsetPx(0);
  }, [total]);

  // 키보드 좌우 방향키 및 ESC 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  useEffect(() => {
    return () => {
      if (wheelIdleTimerRef.current) {
        window.clearTimeout(wheelIdleTimerRef.current);
      }
    };
  }, []);

  /**
   * 정밀 1스와이프 = 1장 트랙패드/휠 핸들러
   */
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();

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
    }, 140);

    if (wheelLockedDirRef.current !== 0 && dir !== wheelLockedDirRef.current) {
      wheelLockedDirRef.current = 0;
      wheelAccumRef.current = 0;
      wheelHasDecayedRef.current = false;
    }

    if (wheelLockedDirRef.current !== 0) {
      if (absDelta <= 4) {
        wheelHasDecayedRef.current = true;
      }
      if (
        wheelHasDecayedRef.current &&
        absDelta >= 14 &&
        now - wheelLastTriggerTimeRef.current > 240
      ) {
        wheelLockedDirRef.current = 0;
        wheelAccumRef.current = 0;
        wheelHasDecayedRef.current = false;
      } else {
        return;
      }
    }

    wheelAccumRef.current += delta;

    if (Math.abs(wheelAccumRef.current) >= 18) {
      const triggerDir: -1 | 1 = wheelAccumRef.current > 0 ? 1 : -1;
      wheelLockedDirRef.current = triggerDir;
      wheelAccumRef.current = 0;
      wheelHasDecayedRef.current = false;
      wheelLastTriggerTimeRef.current = now;

      if (triggerDir > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !pointerStartRef.current) return;
    const rawDx = e.clientX - pointerStartRef.current.x;
    const stageWidth = stageRef.current?.clientWidth || 380;
    const clampedDx = Math.max(-stageWidth * 0.75, Math.min(stageWidth * 0.75, rawDx));
    setDragOffsetPx(clampedDx);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    setIsDragging(false);
    pointerStartRef.current = null;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // 1) 드래그 스와이프인 경우
    if (Math.abs(dx) > 28) {
      if (dx < -28 && selectedIdx < total - 1) {
        setSelectedIdx((prev) => Math.min(total - 1, prev + 1));
      } else if (dx > 28 && selectedIdx > 0) {
        setSelectedIdx((prev) => Math.max(0, prev - 1));
      }
      setDragOffsetPx(0);
      return;
    }

    // 2) 단순 클릭/터치인 경우: 사진의 좌측 영역을 누르면 이전, 우측 영역을 누르면 다음 북클릿으로 이동
    setDragOffsetPx(0);
    if (Math.abs(dx) <= 8 && Math.abs(dy) <= 8 && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width * 0.5) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#060609]/92 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          }}
          onClick={onClose}
        >
          <div
            className="max-w-2xl w-full mx-auto my-auto flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. 상단 모달 바 (메인 화면과 통일된 미니멀 다크 UI) */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Disc3 className="w-4 h-4 text-white/70 animate-[spin_10s_linear_infinite]" />
                <div>
                  <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-white/95">
                    Digital Booklet &amp; Credits
                  </h2>
                  <p className="text-[11px] font-medium tracking-[-0.01em] text-white/45">
                    {ARTIST_CONFIG.artistName} — {ARTIST_CONFIG.singleTitle} (
                    {selectedIdx + 1} / {total})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/[0.07] hover:bg-white/[0.15] border border-white/15 text-white/80 hover:text-white transition"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. 메인 뷰어 (사진 좌/우 클릭, 드래그, 휠 스크롤로 이전/다음 이동) */}
            <div
              ref={stageRef}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="relative aspect-[5/4] max-h-[54vh] w-full mx-auto bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden select-none touch-none cursor-pointer"
            >
              <div
                className="flex w-full h-full"
                style={{
                  transform: `translate3d(calc(${-selectedIdx * 100}% + ${dragOffsetPx}px), 0, 0)`,
                  transition: isDragging
                    ? 'none'
                    : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                {FULL_BOOKLET_ARCHIVE.map((art) => (
                  <div
                    key={art.id}
                    className="w-full h-full shrink-0 flex items-center justify-center p-2"
                  >
                    <img
                      src={art.image}
                      alt=""
                      draggable={false}
                      className="w-full h-full object-contain select-none pointer-events-none"
                    />
                  </div>
                ))}
              </div>

              {/* 좌/우 보조 화살표 버튼 */}
              <button
                type="button"
                onClick={handlePrev}
                disabled={selectedIdx === 0}
                className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 hover:bg-white/15 border border-white/15 backdrop-blur-md text-white transition ${
                  selectedIdx === 0 ? 'opacity-20 pointer-events-none' : 'opacity-90'
                }`}
                aria-label="이전 북클릿"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedIdx === total - 1}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/55 hover:bg-white/15 border border-white/15 backdrop-blur-md text-white transition ${
                  selectedIdx === total - 1
                    ? 'opacity-20 pointer-events-none'
                    : 'opacity-90'
                }`}
                aria-label="다음 북클릿"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 3. 썸네일 스트립 */}
            <div
              onWheel={handleWheel}
              className="flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar"
            >
              {FULL_BOOKLET_ARCHIVE.map((art, i) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  aria-label={`북클릿 ${i + 1}`}
                  className={`relative w-12 h-10 sm:w-14 sm:h-11 rounded-lg overflow-hidden shrink-0 border transition-all ${
                    i === selectedIdx
                      ? 'border-white scale-105 opacity-100 ring-2 ring-white/30'
                      : 'border-white/15 opacity-45 hover:opacity-80'
                  }`}
                >
                  <img
                    src={art.image}
                    alt=""
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* 4. 크레딧 섹션 (메인 화면과 통일된 다크 미니멀 카드) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11.5px] tracking-[-0.01em]">
              {ARTIST_CONFIG.credits.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]"
                >
                  <span className="font-normal text-white/50">{item.role}</span>
                  <span className="font-semibold text-white/95">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
