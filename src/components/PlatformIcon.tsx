import React from 'react';
import { SiSpotify, SiApplemusic, SiYoutubemusic, SiInstagram } from 'react-icons/si';

interface PlatformIconProps {
  platformId: string;
  className?: string;
}

/**
 * 6개 음원 스트리밍 플랫폼 공식 스타일 벡터 아이콘 컴포넌트
 * - 글로벌 플랫폼(Spotify, Apple Music, YouTube Music)과
 *   국내 플랫폼(Melon, Genie, FLO) 전용 커스텀 SVG 심볼을 제공합니다.
 */
export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platformId,
  className = 'w-5 h-5',
}) => {
  switch (platformId) {
    case 'spotify':
      return <SiSpotify className={className} />;

    case 'apple-music':
      return <SiApplemusic className={className} />;

    case 'youtube-music':
      return <SiYoutubemusic className={className} />;

    case 'melon':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 멜론(Melon) 시그니처 서클 + 리프 포인트 */}
          <circle cx="12" cy="12.5" r="8.2" stroke="currentColor" strokeWidth="2.3" />
          <circle cx="12" cy="12.5" r="3.2" fill="currentColor" />
          <path
            d="M15.5 3.6C17.2 3.1 19.3 3.9 19.8 5.6C18.1 6.1 16 5.3 15.5 3.6Z"
            fill="currentColor"
          />
        </svg>
      );

    case 'genie':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 지니(Genie) 시그니처 'g' 음표 웨이브 심볼 */}
          <path
            d="M16.5 9.5C16.5 6.73858 14.2614 4.5 11.5 4.5C8.73858 4.5 6.5 6.73858 6.5 9.5C6.5 12.2614 8.73858 14.5 11.5 14.5C13.05 14.5 14.43 13.79 15.35 12.68M16.5 5V15.2C16.5 17.85 14.35 20 11.7 20C9.75 20 8.1 18.88 7.35 17.25"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <circle cx="18.5" cy="5.5" r="1.4" fill="currentColor" />
        </svg>
      );

    case 'flo':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* FLO(플로) 사운드 웨이브 & F 모티프 심볼 */}
          <path
            d="M5 7C5 5.89543 5.89543 5 7 5H17.5M5 7V19M5 7V12.5M5 12.5H14.5M18.5 9.5V15.5M14.5 15V18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'instagram':
      return <SiInstagram className={className} />;

    default:
      return null;
  }
};
