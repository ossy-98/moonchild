import React from 'react';

interface ScrawlTextProps {
  text: string;
  className?: string;
}

// 과하지 않게 살짝만 손맛이 살아있는 정돈된 손글씨 밸런스 테이블
const WOBBLE_PATTERNS = [
  { rotate: -1.6, y: 0.4, scale: 1.0 },
  { rotate: 1.2, y: -0.4, scale: 0.99 },
  { rotate: -0.8, y: 0.2, scale: 1.01 },
  { rotate: 1.8, y: -0.3, scale: 0.99 },
  { rotate: -1.4, y: 0.5, scale: 1.0 },
  { rotate: 0.9, y: -0.2, scale: 1.0 },
  { rotate: -1.8, y: 0.2, scale: 1.01 },
  { rotate: 1.4, y: 0.3, scale: 0.99 },
];

/**
 * 한 가지 서체("Gloria Hallelujah")로 통일하고 기울기·높낮이 편차를 은은하게 줄여,
 * 손글씨 특유의 매력은 살리면서도 정돈되어 읽히도록 다듬은 컴포넌트
 */
export const ScrawlText: React.FC<ScrawlTextProps> = ({
  text,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-baseline ${className}`} aria-label={text}>
      {Array.from(text).map((ch, idx) => {
        if (ch === ' ') {
          return (
            <span key={idx} className="inline-block w-[0.3em]">
              &nbsp;
            </span>
          );
        }
        const code = ch.charCodeAt(0) + idx * 5;
        const p = WOBBLE_PATTERNS[code % WOBBLE_PATTERNS.length];

        return (
          <span
            key={idx}
            aria-hidden="true"
            className="inline-block select-none"
            style={{
              fontFamily: '"Gloria Hallelujah", cursive',
              transform: `translateY(${p.y}px) rotate(${p.rotate}deg) scale(${p.scale})`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};
