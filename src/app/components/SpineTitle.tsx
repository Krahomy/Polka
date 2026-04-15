import { useRef, useEffect, useState } from 'react';

interface SpineTitleProps {
  title: string;
  containerHeight: number;
}

export function SpineTitle({ title, containerHeight }: SpineTitleProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(9);

  useEffect(() => {
    if (!textRef.current) return;

    const maxWidth = containerHeight * 0.88;
    if (maxWidth <= 0) return;

    let lo = 5;
    let hi = 32;
    const span = textRef.current;

    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      span.style.fontSize = `${mid}px`;
      if (span.scrollWidth <= maxWidth) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    setFontSize(lo);
  }, [title, containerHeight]);

  return (
    <span
      ref={textRef}
      className="font-serif tracking-widest uppercase"
      style={{
        fontSize: `${fontSize}px`,
        color: 'rgba(255,255,255,0.9)',
        transform: 'rotate(-90deg)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: `${containerHeight * 0.9}px`,
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        display: 'inline-block',
      }}
    >
      {title}
    </span>
  );
}
