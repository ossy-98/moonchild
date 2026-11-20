import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, X } from 'lucide-react';
import { ARTIST_CONFIG } from '../config/links';

export const AudioPreviewButton: React.FC = () => {
  const { src, startTime } = ARTIST_CONFIG.audioPreview;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [totalDuration, setTotalDuration] = useState(222); // moonchild_master.mp3 기본 길이(222초)
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  const updateLoop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;

    setCurrentTime(audio.currentTime);
    if (audio.duration && !Number.isNaN(audio.duration)) {
      setTotalDuration(audio.duration);
    }

    rafRef.current = requestAnimationFrame(updateLoop);
  }, []);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !Number.isNaN(audio.duration)) {
        setTotalDuration(audio.duration);
      }
      audio.currentTime = startTime;
      setCurrentTime(startTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src, startTime]);

  const startOrTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // 처음 원형 버튼을 누를 때: 시간 조절 UI를 펼치면서 재생 시작
    if (!isExpanded) {
      setIsExpanded(true);
      if (!isPlaying) {
        try {
          if (!hasStartedOnce) {
            audio.currentTime = startTime;
            setCurrentTime(startTime);
            setHasStartedOnce(true);
          }
          audio.volume = 1;
          await audio.play();
          setIsPlaying(true);
          rafRef.current = requestAnimationFrame(updateLoop);
        } catch (err) {
          console.error('Audio playback failed:', err);
        }
      }
      return;
    }

    // 이미 펼쳐진 상태에서 재생/일시정지 토글
    if (isPlaying) {
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIsPlaying(false);
    } else {
      try {
        audio.volume = 1;
        await audio.play();
        setIsPlaying(true);
        rafRef.current = requestAnimationFrame(updateLoop);
      } catch (err) {
        console.error('Audio playback failed:', err);
      }
    }
  };

  // 사용자가 슬라이더로 원하는 시간을 자유롭게 변경
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    setCurrentTime(nextTime);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = nextTime;
    }
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  const formatTime = (sec: number) => {
    const safeSec = Math.max(0, Math.floor(sec));
    const mins = Math.floor(safeSec / 60);
    const secs = safeSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressRatio = totalDuration > 0 ? Math.min(1, currentTime / totalDuration) : 0;

  // 1. 기본 상태: 원형 플레이 버튼
  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={startOrTogglePlay}
        aria-label={isPlaying ? '오디오 컨트롤러 열기' : '미리듣기 재생 및 시간 조절 열기'}
        title="재생 및 시간 자유 조절"
        className="group relative w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.16] active:scale-95 border border-white/20 backdrop-blur-xl flex items-center justify-center transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.45)]"
      >
        {/* 원형 진행률 링 */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 p-[2px]" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 16}
            strokeDashoffset={2 * Math.PI * 16 * (1 - progressRatio)}
          />
        </svg>

        {/* 미니 커버 디스크 + 플레이 아이콘 */}
        <div
          className={`w-7 h-7 rounded-full overflow-hidden relative flex items-center justify-center ${
            isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
          }`}
        >
          <img
            src={ARTIST_CONFIG.mainCoverImage}
            alt="moonchild preview"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/25 transition-colors">
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-white fill-white" />
            ) : (
              <Play className="w-3.5 h-3.5 text-white fill-white translate-x-[0.5px]" />
            )}
          </div>
        </div>
      </button>
    );
  }

  // 2. 플레이 버튼 클릭 후: 시간을 자유롭게 설정할 수 있는 컨트롤러 UI
  return (
    <div className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-full bg-black/75 border border-white/25 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.65)] transition-all duration-200">
      {/* 원형 재생/일시정지 토글 버튼 */}
      <button
        type="button"
        onClick={startOrTogglePlay}
        aria-label={isPlaying ? '일시정지' : '재생'}
        className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-white/25 active:scale-95 transition"
      >
        <img
          src={ARTIST_CONFIG.mainCoverImage}
          alt="moonchild"
          className={`w-full h-full object-cover brightness-75 ${
            isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
          }`}
        />
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-white fill-white" />
          ) : (
            <Play className="w-3.5 h-3.5 text-white fill-white translate-x-[0.5px]" />
          )}
        </div>
      </button>

      {/* 자유 시간 설정 슬라이더 & 타임스탬프 */}
      <div className="flex flex-col gap-1 w-32 sm:w-44">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/85 leading-none px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span className="text-white/45">{formatTime(totalDuration)}</span>
        </div>

        <input
          type="range"
          min={0}
          max={Math.floor(totalDuration)}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          aria-label="재생 위치 자유 설정"
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/20 accent-white focus:outline-none"
          style={{
            background: `linear-gradient(to right, #ffffff ${
              progressRatio * 100
            }%, rgba(255,255,255,0.2) ${progressRatio * 100}%)`,
          }}
        />
      </div>

      {/* 원형 버튼으로 접기 버튼 */}
      <button
        type="button"
        onClick={handleCollapse}
        aria-label="플레이어 접기"
        title="원형 버튼으로 접기"
        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
