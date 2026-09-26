import type { ImgHTMLAttributes } from 'react';

const optimizedPortraits: Record<string, string> = {
  '/lbt/Wajid Hussain.png': '/lbt/Wajid-Hussain',
  '/lbt/Mohsin.png': '/lbt/Mohsin',
  '/lbt/Laiba.png': '/lbt/Laiba',
  '/lbt/Ibdullah.png': '/lbt/Ibdullah',
};

export function memberPortraitUrl(src: string, width: 440 | 800 = 800) {
  const base = optimizedPortraits[src];
  return base ? `${base}-${width}.webp` : src;
}

export default function MemberPortrait({ src, sizes, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const base = optimizedPortraits[src];
  if (!base) return <img src={src} sizes={sizes} {...props} />;

  return (
    <img
      src={`${base}-800.webp`}
      srcSet={`${base}-440.webp 440w, ${base}-800.webp 800w`}
      sizes={sizes || '(min-width: 768px) 220px, 55vw'}
      {...props}
    />
  );
}
