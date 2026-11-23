import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RefreshCw,
  Eye,
  Users,
  MousePointerClick,
  Lock,
} from 'lucide-react';
import { STREAMING_PLATFORMS } from '../config/links';
import {
  AnalyticsSnapshot,
  fetchAllAnalytics,
} from '../utils/analytics';
import { PlatformIcon } from './PlatformIcon';

interface AdminAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAnalyticsModal: React.FC<AdminAnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const snapshot = await fetchAllAnalytics();
      setData(snapshot);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void loadStats();
    }
  }, [isOpen, loadStats]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const totalPlatformClicks = data
    ? Object.values(data.platformClicks).reduce((acc, v) => acc + v, 0)
    : 0;

  const maxPlatformClick = data
    ? Math.max(1, ...Object.values(data.platformClicks))
    : 1;

  const ctrPercent =
    data && data.totalViews > 0
      ? Math.min(100, Math.round((totalPlatformClicks / data.totalViews) * 100))
      : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col bg-[#060609]/92 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto select-none"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl w-full mx-auto my-auto rounded-2xl bg-[#0D0D12] border border-white/15 p-4 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] flex flex-col gap-5"
          >
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-[15px] font-semibold tracking-tight text-white">
                      ossy — moonchild Private Analytics
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-[11px] text-white/45 mt-0.5">
                    {data
                      ? `마지막 업데이트: ${data.fetchedAt} (관리자 접속은 조회수에 포함되지 않음)`
                      : '실시간 통계 불러오는 중...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={loadStats}
                  disabled={isLoading}
                  title="새로고침"
                  className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-white/80 hover:text-white transition"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  title="닫기"
                  className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-white/80 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 1. 핵심 요약 지표 (총 조회수 / 순 방문자 / 총 음원 클릭) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>총 링크 조회수</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {data ? data.totalViews.toLocaleString() : '—'}
                </span>
                <span className="text-[10px] text-white/35">Total Page Views</span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-violet-400" />
                  <span>순 방문자 수</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {data ? data.uniqueVisitors.toLocaleString() : '—'}
                </span>
                <span className="text-[10px] text-white/35">Unique Visitors</span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                  <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                  <span>음원 총 클릭</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {data ? totalPlatformClicks.toLocaleString() : '—'}
                  </span>
                  {data && (
                    <span className="text-[11px] font-medium text-emerald-400">
                      ({ctrPercent}%)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/35">Stream Clicks</span>
              </div>
            </div>

            {/* 2. 각 북클릿(음원 스트리밍 플랫폼)별 클릭 수 */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  북클릿별 음원 링크 클릭 수 (6 Platforms)
                </h3>
                <span className="text-[11px] text-white/40">
                  총 {totalPlatformClicks.toLocaleString()}회 클릭
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {STREAMING_PLATFORMS.map((platform) => {
                  const count = data?.platformClicks[platform.id] ?? 0;
                  const barRatio =
                    totalPlatformClicks > 0
                      ? Math.max(4, Math.round((count / maxPlatformClick) * 100))
                      : 0;
                  const sharePercent =
                    totalPlatformClicks > 0
                      ? Math.round((count / totalPlatformClicks) * 100)
                      : 0;

                  return (
                    <div
                      key={platform.id}
                      className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/10 p-2.5 sm:px-3.5 sm:py-2.5 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={platform.coverImage}
                            alt={platform.name}
                            className="w-8 h-8 rounded-md object-cover border border-white/15 shrink-0"
                          />
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${platform.accentColor}22`,
                              color: platform.accentColor,
                            }}
                          >
                            <PlatformIcon
                              platformId={platform.id}
                              className="w-3.5 h-3.5"
                            />
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs sm:text-[13px] font-semibold text-white">
                              {platform.name}
                            </span>
                            <span className="text-[11px] text-white/40">
                              ({platform.nameKo})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-[15px] font-bold text-white">
                            {count.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-white/40">
                            회 ({sharePercent}%)
                          </span>
                        </div>
                      </div>

                      {/* 클릭 비율 막대그래프 */}
                      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${count > 0 ? barRatio : 0}%`,
                            backgroundColor: platform.accentColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. 기타 액션 (전체 북클릿 팝업 / 인스타그램 / 이메일) */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px]">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07]">
                <span className="text-white/50">전체 북클릿</span>
                <span className="font-semibold text-white">
                  {data ? data.bookletModalClicks.toLocaleString() : '—'}회
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07]">
                <span className="text-white/50">인스타그램</span>
                <span className="font-semibold text-white">
                  {data ? data.instagramClicks.toLocaleString() : '—'}회
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07]">
                <span className="text-white/50">이메일 문의</span>
                <span className="font-semibold text-white">
                  {data ? data.contactClicks.toLocaleString() : '—'}회
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
