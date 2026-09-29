import type { ImgHTMLAttributes } from 'react';

const optimizedPortraits: Record<string, { base: string; version?: string }> = {
  '/lbt/Wajid Hussain.png': { base: '/lbt/Wajid-Hussain', version: '20260929' },
  '/lbt/Mohsin.png': { base: '/lbt/Mohsin' },
  '/lbt/Laiba.png': { base: '/lbt/Laiba' },
  '/lbt/Ibdullah.png': { base: '/lbt/Ibdullah', version: '20260929' },
};

function optimizedPortraitUrl(src: string, width: 440 | 800) {
  const portrait = optimizedPortraits[src];
  if (!portrait) return src;
  const version = portrait.version ? `?v=${portrait.version}` : '';
  return `${portrait.base}-${width}.webp${version}`;
}

export function memberPortraitUrl(src: string, width: 440 | 800 = 800) {
  return optimizedPortraitUrl(src, width);
}

export default function MemberPortrait({ src, sizes, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  if (!optimizedPortraits[src]) return <img src={src} sizes={sizes} {...props} />;

  return (
    <img
      src={optimizedPortraitUrl(src, 800)}
      srcSet={`${optimizedPortraitUrl(src, 440)} 440w, ${optimizedPortraitUrl(src, 800)} 800w`}
      sizes={sizes || '(min-width: 768px) 220px, 55vw'}
      {...props}
    />
  );
}
