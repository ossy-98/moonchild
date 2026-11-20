import React from 'react';

interface CollageCharSpec {
  id: string;
  char: string;
  bg: string;
  fg: string;
  fontFamily: string;
  rotate: number;
  clipPath: string;
  fontWeight?: number | string;
  fontStyle?: 'normal' | 'italic';
  padding: string;
  offsetY?: number;
}

/**
 * 빈티지 레터프레스 & 올드 매거진 스크랩북 콜라주 신규 재배치:
 * 현재의 빈티지 활판 잉크 마모·에이징 질감을 그대로 유지하면서
 * 13개 조각('ossy' 4글자 + 'moonchild' 9글자)의 색상, 서체, 대소문자, 오려낸 모양, 각도를 새롭게 재배치
 */
const OSSY_CHARS: CollageCharSpec[] = [
  {
    id: 'ossy-o',
    char: 'O',
    bg: '#A2352A', // 워시드 브릭 레드
    fg: '#E9C158', // 에이지드 머스타드 옐로우
    fontFamily: '"Cinzel Decorative", serif',
    fontWeight: 900,
    rotate: 4,
    clipPath: 'polygon(0% 6%, 94% 0%, 100% 89%, 88% 100%, 5% 95%)',
    padding: '2px 6px 2px 6px',
    offsetY: 0,
  },
  {
    id: 'ossy-s1',
    char: 's',
    bg: '#DCD4C0', // 빛바랜 엽서 베이지
    fg: '#232025', // 먹물 차콜 블랙
    fontFamily: '"Abril Fatface", serif',
    rotate: -4.5,
    clipPath: 'polygon(6% 0%, 100% 5%, 93% 98%, 0% 93%)',
    padding: '1px 7px 3px 6px',
    offsetY: -1,
  },
  {
    id: 'ossy-s2',
    char: 'S',
    bg: '#2A252C', // 다크 에스프레소 슬레이트
    fg: '#EAA68E', // 바랜 살몬 피치
    fontFamily: '"Cormorant Garamond", serif',
    fontStyle: 'italic',
    fontWeight: 700,
    rotate: 3.5,
    clipPath: 'polygon(2% 4%, 97% 0%, 100% 94%, 7% 100%)',
    padding: '0px 7px 3px 6px',
    offsetY: 1,
  },
  {
    id: 'ossy-y',
    char: 'y',
    bg: '#C8AC7B', // 올드 크라프트 보드지
    fg: '#7A2320', // 딥 버건디 와인
    fontFamily: '"Special Elite", monospace',
    fontWeight: 700,
    rotate: -4,
    clipPath: 'polygon(5% 0%, 96% 6%, 100% 92%, 10% 100%, 0% 78%)',
    padding: '2px 6px 2px 6px',
    offsetY: 0,
  },
];

const MOONCHILD_CHARS: CollageCharSpec[] = [
  {
    id: 'mc-m',
    char: 'M',
    bg: '#232127', // 낡은 인쇄소 차콜 블랙
    fg: '#E6DEC8', // 바랜 뉴스프린트 크림
    fontFamily: '"Anton", sans-serif',
    rotate: 3.5,
    clipPath: 'polygon(0% 5%, 96% 0%, 100% 95%, 6% 100%)',
    padding: '2px 7px 2px 7px',
    offsetY: 0,
  },
  {
    id: 'mc-o1',
    char: 'o',
    bg: '#D43E67', // 페이디드 스탬프 마젠타
    fg: '#ECD068', // 빈티지 버터 옐로우
    fontFamily: '"Abril Fatface", serif',
    rotate: -4.5,
    clipPath: 'polygon(6% 0%, 100% 7%, 92% 98%, 0% 92%)',
    padding: '1px 7px 3px 6px',
    offsetY: 1,
  },
  {
    id: 'mc-o2',
    char: 'O',
    bg: '#E8E0CC', // 바랜 양피지 오프화이트
    fg: '#86A9BD', // 더스티 데님 블루
    fontFamily: '"Playfair Display", serif',
    fontWeight: 900,
    rotate: 4.5,
    clipPath: 'polygon(0% 4%, 93% 0%, 100% 91%, 86% 100%, 4% 96%)',
    padding: '1px 6px 3px 6px',
    offsetY: -1,
  },
  {
    id: 'mc-n',
    char: 'n',
    bg: '#353823', // 빈티지 다크 올리브 모스
    fg: '#E5DFCA', // 리넨 크림
    fontFamily: '"UnifrakturMaguntia", serif',
    rotate: -3,
    clipPath: 'polygon(3% 2%, 98% 0%, 94% 100%, 0% 95%)',
    padding: '2px 7px 2px 6px',
    offsetY: 1,
  },
  {
    id: 'mc-c',
    char: 'C',
    bg: '#8E2F2A', // 러스트 브릭 크림슨
    fg: '#EFE5CE', // 웜 코튼 아이보리
    fontFamily: '"Instrument Serif", serif',
    fontStyle: 'italic',
    rotate: 4,
    clipPath: 'polygon(0% 7%, 95% 0%, 100% 94%, 8% 100%)',
    padding: '1px 7px 2px 6px',
    offsetY: -1,
  },
  {
    id: 'mc-h',
    char: 'h',
    bg: '#CEB281', // 에이지드 탄 크라프트
    fg: '#201D22', // 잉크 블랙
    fontFamily: '"Rubik Mono One", sans-serif',
    rotate: -4.5,
    clipPath: 'polygon(4% 0%, 100% 4%, 96% 97%, 0% 100%)',
    padding: '3px 6px 3px 6px',
    offsetY: 0,
  },
  {
    id: 'mc-i',
    char: 'I',
    bg: '#4A302A', // 세피아 에스프레소 브라운
    fg: '#D8DEC8', // 세이지 크림
    fontFamily: '"JetBrains Mono", monospace',
    fontWeight: 700,
    rotate: 3,
    clipPath: 'polygon(0% 3%, 95% 0%, 100% 98%, 7% 95%)',
    padding: '2px 6px 3px 6px',
    offsetY: -1,
  },
  {
    id: 'mc-l',
    char: 'l',
    bg: '#E9A68E', // 빈티지 애프리콧 살몬
    fg: '#262127', // 다크 그라파이트
    fontFamily: '"Permanent Marker", cursive',
    rotate: -5,
    clipPath: 'polygon(6% 0%, 97% 6%, 92% 100%, 0% 93%)',
    padding: '1px 7px 3px 6px',
    offsetY: 1,
  },
  {
    id: 'mc-d',
    char: 'D',
    bg: '#191719', // 딥 레터프레스 블랙
    fg: '#A83B34', // 바랜 테라코타 레드
    fontFamily: '"Bebas Neue", sans-serif',
    rotate: 4,
    clipPath: 'polygon(0% 5%, 94% 0%, 100% 88%, 88% 100%, 5% 96%)',
    padding: '2px 7px 1px 7px',
    offsetY: 0,
  },
];

const CollagePiece: React.FC<{
  spec: CollageCharSpec;
  sizeClass: string;
}> = ({ spec, sizeClass }) => {
  return (
    <span
      className="relative inline-flex items-center justify-center select-none transition-transform duration-200 hover:scale-110 hover:z-20"
      style={{
        backgroundColor: spec.bg,
        color: spec.fg,
        fontFamily: spec.fontFamily,
        fontStyle: spec.fontStyle ?? 'normal',
        fontWeight: spec.fontWeight ?? 700,
        clipPath: spec.clipPath,
        padding: spec.padding,
        transform: `rotate(${spec.rotate}deg) translateY(${spec.offsetY ?? 0}px)`,
        boxShadow:
          'inset 0 0 7px rgba(25, 15, 8, 0.38), 0 3px 9px rgba(0, 0, 0, 0.7)',
        filter: 'sepia(0.12) contrast(1.04)',
      }}
    >
      {/* 1) 낡은 종이 섬유 & 빛바랜 인쇄 얼룩 레이어 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(rgba(30,20,10,0.45) 0.75px, transparent 0.75px), radial-gradient(rgba(60,40,20,0.3) 1.1px, transparent 1.1px)',
          backgroundSize: '4px 4px, 9px 9px',
          backgroundPosition: '0 0, 3px 4px',
        }}
      />

      {/* 2) 빈티지 활판 인쇄 잉크 마모(Distressed Screen-Print Scratches) 레이어 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          backgroundImage:
            'radial-gradient(rgba(238,228,208,0.55) 0.65px, transparent 0.65px), linear-gradient(125deg, transparent 42%, rgba(235,225,205,0.22) 48%, transparent 54%)',
          backgroundSize: '6px 6px, 100% 100%',
          backgroundPosition: '1px 2px, 0 0',
        }}
      />

      {/* 철자 텍스트 (SVG 빈티지 잉크 마모 필터 적용) */}
      <span
        className={`relative z-10 leading-none ${sizeClass}`}
        style={{
          filter: 'url(#vintage-letterpress-wear)',
        }}
      >
        {spec.char}
      </span>
    </span>
  );
};

export const CollageTitle: React.FC = () => {
  return (
    <div className="relative flex flex-col items-start gap-1.5">
      {/* 빈티지 활판 잉크 마모 & 거친 엣지 효과를 위한 숨김 SVG 필터 */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute w-0 h-0 overflow-hidden"
      >
        <defs>
          <filter
            id="vintage-letterpress-wear"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              seed="21"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.15"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 1행: ossy */}
      <div className="flex items-center gap-[2px]" aria-label="ossy">
        {OSSY_CHARS.map((spec) => (
          <CollagePiece
            key={spec.id}
            spec={{ ...spec, padding: '1px 4.5px 1.5px 4.5px' }}
            sizeClass="text-[11px] sm:text-[12.5px]"
          />
        ))}
      </div>

      {/* 2행: moonchild */}
      <div className="flex items-center">
        <h1
          className="flex items-center gap-[2px] sm:gap-[2.5px]"
          aria-label="moonchild"
        >
          {MOONCHILD_CHARS.map((spec) => (
            <CollagePiece
              key={spec.id}
              spec={{ ...spec, padding: '1px 5px 1.5px 5px' }}
              sizeClass="text-[15px] sm:text-[18px]"
            />
          ))}
        </h1>
      </div>
    </div>
  );
};
