export interface PlatformItem {
  id: string;
  index: number;
  name: string;
  nameKo: string;
  url: string;
  /** 3D 커버 플로우에 표시될 자켓 이미지 경로 */
  coverImage: string;
  /** 고해상도 원본 이미지 경로 */
  originalImage: string;
  /** 플랫폼 브랜드 포인트 컬러 (Hex) */
  accentColor: string;
  /** 플랫폼 서브 글로우 컬러 (RGBA/Hex) */
  glowColor: string;
  /** 북클릿 캡션 / 테마 문구 */
  subtitle: string;
}

export interface BookletArtwork {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  originalImage: string;
  aspect?: 'square' | 'wide';
}

/**
 * 아티스트 및 싱글 기본 설정
 */
export const ARTIST_CONFIG = {
  artistName: 'ossy',
  singleTitle: 'moonchild',
  tagline: 'Reality · Dream · Ideal',
  quote:
    'Standing at the final edge of youth, I hold on to the beliefs I have forged. I seek to restore a symbol that has been broken.',
  mainCoverImage: '/covers/moonchild_cover.jpg',
  mainCoverOriginal: '/moonchild_cover.png',
  instagramHandle: '@wtfossy',
  instagramUrl: 'https://www.instagram.com/wtfossy/',
  email: 'ossywtf@gmail.com',
  credits: [
    { role: 'Lyrics by', name: 'ossy' },
    { role: 'Composed by', name: 'ossy' },
    { role: 'Drums by', name: 'Unorthodox' },
    { role: 'Arranged by', name: 'ossy' },
    { role: 'Mix , Mastered by', name: 'ossy' },
    { role: 'Artwork by', name: 'Unorthodox' },
  ],
  audioPreview: {
    src: '/moonchild_master.mp3',
    startTime: 17,
    duration: 30,
    label: '0:17 — 0:47 PREVIEW',
  },
};

/**
 * 6개 음원 스트리밍 플랫폼 및 매칭 자켓 데이터
 * 1. 메인 앨범커버 (moonchild_cover) = Spotify
 * 2. booklet_1 = Apple Music
 * 3. booklet_2 = YouTube Music
 * 4. booklet_3 = Melon
 * 5. booklet_6 = Genie
 * 6. booklet_8 = FLO
 */
export const STREAMING_PLATFORMS: PlatformItem[] = [
  {
    id: 'spotify',
    index: 1,
    name: 'Spotify',
    nameKo: '스포티파이',
    url: 'https://open.spotify.com/intl-ko/track/00OvKyW0j4lLXCe48dErrM?',
    coverImage: '/covers/moonchild_cover.jpg',
    originalImage: '/moonchild_cover.png',
    accentColor: '#1ED760',
    glowColor: 'rgba(30, 215, 96, 0.35)',
    subtitle: 'Main Cover',
  },
  {
    id: 'apple-music',
    index: 2,
    name: 'Apple Music',
    nameKo: '애플 뮤직',
    url: 'https://music.apple.com/kr/song/moonchild/6833269316',
    coverImage: '/covers/booklet_1.jpg',
    originalImage: '/booklet/booklet_1.png',
    accentColor: '#FA243C',
    glowColor: 'rgba(250, 36, 60, 0.35)',
    subtitle: 'Booklet I',
  },
  {
    id: 'youtube-music',
    index: 3,
    name: 'YouTube Music',
    nameKo: '유튜브 뮤직',
    url: 'https://youtu.be/qtS_4DTP4gI?si=wfLnqPlWYuy4nhpq',
    coverImage: '/covers/booklet_2.jpg',
    originalImage: '/booklet/booklet_2.png',
    accentColor: '#FF0033',
    glowColor: 'rgba(255, 0, 51, 0.35)',
    subtitle: 'Booklet II',
  },
  {
    id: 'melon',
    index: 4,
    name: 'Melon',
    nameKo: '멜론',
    url: 'https://kko.to/M93EUtAMVd',
    coverImage: '/covers/booklet_3.jpg',
    originalImage: '/booklet/booklet_3.png',
    accentColor: '#00CD3C',
    glowColor: 'rgba(0, 205, 60, 0.35)',
    subtitle: 'Booklet III',
  },
  {
    id: 'genie',
    index: 5,
    name: 'Genie',
    nameKo: '지니뮤직',
    url: 'https://www.genie.co.kr/detail/songInfo?xgnm=117823502',
    coverImage: '/covers/booklet_6.jpg',
    originalImage: '/booklet/booklet_6.png',
    accentColor: '#0096FF',
    glowColor: 'rgba(0, 150, 255, 0.35)',
    subtitle: 'Booklet VI',
  },
  {
    id: 'flo',
    index: 6,
    name: 'FLO',
    nameKo: '플로',
    url: 'https://flomuz.io/s/b.PVVel',
    coverImage: '/covers/booklet_8.jpg',
    originalImage: '/booklet/booklet_8.png',
    accentColor: '#6C3BFF',
    glowColor: 'rgba(108, 59, 255, 0.38)',
    subtitle: 'Booklet VIII',
  },
];

/**
 * 전체 북클릿 모아보기 데이터 ('origin_booklet' 폴더 안의 사진 순서대로 배치)
 */
export const FULL_BOOKLET_ARCHIVE: BookletArtwork[] = [
  {
    id: 'origin-cover',
    title: '01. moonchild_cover',
    subtitle: 'Main Cover',
    image: '/origin_booklet_web/01.moonchild_cover.jpg',
    originalImage: '/origin_booklet/01.moonchild_cover.jpg',
  },
  {
    id: 'origin-booklet-1',
    title: 'booklet_1',
    subtitle: 'Booklet 01',
    image: '/origin_booklet_web/booklet_1.jpg',
    originalImage: '/origin_booklet/booklet_1.png',
    aspect: 'wide',
  },
  {
    id: 'origin-booklet-2',
    title: 'booklet_2',
    subtitle: 'Booklet 02',
    image: '/origin_booklet_web/booklet_2.jpg',
    originalImage: '/origin_booklet/booklet_2.png',
    aspect: 'wide',
  },
  {
    id: 'origin-booklet-3',
    title: 'booklet_3',
    subtitle: 'Booklet 03',
    image: '/origin_booklet_web/booklet_3.jpg',
    originalImage: '/origin_booklet/booklet_3.png',
    aspect: 'wide',
  },
  {
    id: 'origin-booklet-4',
    title: 'booklet_4',
    subtitle: 'Booklet 04',
    image: '/origin_booklet_web/booklet_4.jpg',
    originalImage: '/origin_booklet/booklet_4.png',
    aspect: 'wide',
  },
  {
    id: 'origin-booklet-5',
    title: 'booklet_5',
    subtitle: 'Booklet 05',
    image: '/origin_booklet_web/booklet_5.jpg',
    originalImage: '/origin_booklet/booklet_5.png',
    aspect: 'wide',
  },
  {
    id: 'origin-booklet-6',
    title: 'booklet_6',
    subtitle: 'Booklet 06',
    image: '/origin_booklet_web/booklet_6.jpg',
    originalImage: '/origin_booklet/booklet_6.png',
    aspect: 'wide',
  },
];
