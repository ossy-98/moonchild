import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RefreshCw,
  Eye,
  Users,
  MousePointerClick,
  Lock,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { STREAMING_PLATFORMS } from '../config/links';
import {
  AnalyticsPeriod,
  AnalyticsSnapshot,
  fetchAnalyticsByPeriod,
  getKstDateParts,
} from '../utils/analytics';
import { PlatformIcon } from './PlatformIcon';

interface AdminAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERIOD_TABS: { id: AnalyticsPeriod; label: string }[] = [
  { id: 'all', label: '전체 누적' },
  { id: 'day', label: '일별' },
  { id: 'month', label: '월별' },
  { id: 'year', label: '년별' },
];

function shiftDateYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function shiftMonthYm(ym: string, deltaMonths: number): string {
  const [y, m] = ym.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + deltaMonths, 1));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  return `${yy}-${mm}`;
}

export const AdminAnalyticsModal: React.FC<AdminAnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const todayKst = useMemo(() => getKstDateParts(), []);

  const [period, setPeriod] = useState<AnalyticsPeriod>('day');
  const [selectedDay, setSelectedDay] = useState<string>(todayKst.ymd);
  const [selectedMonth, setSelectedMonth] = useState<string>(todayKst.ym);
  const [selectedYear, setSelectedYear] = useState<number>(Number(todayKst.year));

  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentPeriodKey = useMemo(() => {
    switch (period) {
      case 'day':
        return selectedDay;
      case 'month':
        return selectedMonth;
      case 'year':
        return String(selectedYear);
      case 'all':
      default:
        return 'all';
    }
  }, [period, selectedDay, selectedMonth, selectedYear]);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const snapshot = await fetchAnalyticsByPeriod(period, currentPeriodKey);
      setData(snapshot);
    } finally {
      setIsLoading(false);
    }
  }, [period, currentPeriodKey]);

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

  const handlePrevPeriod = () => {
    if (period === 'day') {
      setSelectedDay((prev) => shiftDateYmd(prev, -1));
    } else if (period === 'month') {
      setSelectedMonth((prev) => shiftMonthYm(prev, -1));
    } else if (period === 'year') {
      setSelectedYear((prev) => prev - 1);
    }
  };

  const handleNextPeriod = () => {
    if (period === 'day') {
      setSelectedDay((prev) => shiftDateYmd(prev, 1));
    } else if (period === 'month') {
      setSelectedMonth((prev) => shiftMonthYm(prev, 1));
    } else if (period === 'year') {
      setSelectedYear((prev) => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = getKstDateParts();
    setSelectedDay(now.ymd);
    setSelectedMonth(now.ym);
    setSelectedYear(Number(now.year));
  };

  const formatPeriodLabel = () => {
    if (period === 'all') return '전체 누적 기간 (All-Time)';
    if (period === 'day') {
      const [y, m, d] = selectedDay.split('-');
      const isToday = selectedDay === todayKst.ymd;
      return `${y}년 ${Number(m)}월 ${Number(d)}일${isToday ? ' (오늘)' : ''}`;
    }
    if (period === 'month') {
      const [y, m] = selectedMonth.split('-');
      const isThisMonth = selectedMonth === todayKst.ym;
      return `${y}년 ${Number(m)}월${isThisMonth ? ' (이번 달)' : ''}`;
    }
    const isThisYear = String(selectedYear) === todayKst.year;
    return `${selectedYear}년${isThisYear ? ' (올해)' : ''}`;
  };

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
          className="fixed inset-0 z-50 flex flex-col bg-[#060609]/92 backdrop-blur-2xl p-3.5 sm:p-6 overflow-y-auto select-none"
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
            className="max-w-xl w-full mx-auto my-auto rounded-2xl bg-[#0D0D12] border border-white/15 p-4 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.9)] flex flex-col gap-4"
          >
            {/* 상단 헤더 */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-[15px] font-semibold tracking-tight text-white">
                      ossy — moonchild Analytics
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-[11px] text-white/45 mt-0.5">
                    {data
                      ? `한국시간(KST) 기준 · 업데이트 ${data.fetchedAt}`
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

            {/* 기간 단위 선택 탭 (전체 누적 / 일별 / 월별 / 년별) */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-white/[0.05] border border-white/10">
                {PERIOD_TABS.map((tab) => {
                  const active = period === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPeriod(tab.id)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        active
                          ? 'bg-white text-[#0A0A0E] shadow-sm'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* 일/월/년 날짜 이동 컨트롤 바 */}
              {period !== 'all' && (
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10">
                  <button
                    type="button"
                    onClick={handlePrevPeriod}
                    aria-label="이전 기간"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/75 hover:text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-white/45" />
                    <span className="text-xs sm:text-[13px] font-semibold text-white">
                      {formatPeriodLabel()}
                    </span>

                    {period === 'day' && (
                      <label className="relative cursor-pointer px-1.5 py-0.5 rounded bg-white/[0.07] hover:bg-white/[0.14] text-[10px] text-white/75 transition">
                        날짜선택
                        <input
                          type="date"
                          value={selectedDay}
                          onChange={(e) => {
                            if (e.target.value) setSelectedDay(e.target.value);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    )}

                    <button
                      type="button"
                      onClick={handleGoToday}
                      className="px-1.5 py-0.5 rounded bg-white/[0.07] hover:bg-white/[0.14] text-[10px] text-white/75 transition"
                    >
                      오늘
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextPeriod}
                    aria-label="다음 기간"
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/75 hover:text-white transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 1. 핵심 요약 지표 (총 조회수 / 순 방문자 / 총 음원 클릭) */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>링크 조회수</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {data ? data.totalViews.toLocaleString() : '—'}
                </span>
                <span className="text-[10px] text-white/35">Page Views</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-violet-400" />
                  <span>순 방문자 수</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {data ? data.uniqueVisitors.toLocaleString() : '—'}
                </span>
                <span className="text-[10px] text-white/35">Unique Visitors</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                  <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                  <span>음원 총 클릭</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {data ? totalPlatformClicks.toLocaleString() : '—'}
                  </span>
                  {data && (
                    <span className="text-[10.5px] font-medium text-emerald-400">
                      ({ctrPercent}%)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/35">Stream Clicks</span>
              </div>
            </div>

            {/* 2. 각 북클릿(음원 스트리밍 플랫폼)별 클릭 수 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  북클릿별 음원 링크 클릭 수 (6 Platforms)
                </h3>
                <span className="text-[11px] text-white/40">
                  총 {totalPlatformClicks.toLocaleString()}회 클릭
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
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
                      className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={platform.coverImage}
                            alt={platform.name}
                            className="w-7 h-7 rounded-md object-cover border border-white/15 shrink-0"
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
                          <span className="text-sm font-bold text-white">
                            {count.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-white/40">
                            회 ({sharePercent}%)
                          </span>
                        </div>
                      </div>

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
              <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07]">
                <span className="text-white/50">전체 북클릿</span>
                <span className="font-semibold text-white">
                  {data ? data.bookletModalClicks.toLocaleString() : '—'}회
                </span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07]">
                <span className="text-white/50">인스타그램</span>
                <span className="font-semibold text-white">
                  {data ? data.instagramClicks.toLocaleString() : '—'}회
                </span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.07]">
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
