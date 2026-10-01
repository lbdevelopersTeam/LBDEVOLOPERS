import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { cn } from '../../lib/utils';

const desktopMotionQuery = '(hover: hover) and (pointer: fine) and (min-width: 768px)';
const magneticSpringConfig = { damping: 18, stiffness: 180, mass: 0.6 };
const revealTransition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };
const revealViewport = { once: true };
const readyVideoSources = new Set<string>();
let desktopMotionMedia: MediaQueryList | undefined;
const coarsePointerQuery = '(hover: none), (pointer: coarse)';

const isConstrainedConnection = () => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g');
};

const useConstrainedMedia = (allowCoarsePointer = false) => useSyncExternalStore(
  (onStoreChange) => {
    const media = window.matchMedia(coarsePointerQuery);
    media.addEventListener?.('change', onStoreChange);
    const connection = (navigator as Navigator & { connection?: EventTarget }).connection;
    connection?.addEventListener?.('change', onStoreChange);
    return () => {
      media.removeEventListener?.('change', onStoreChange);
      connection?.removeEventListener?.('change', onStoreChange);
    };
  },
  () => (!allowCoarsePointer && window.matchMedia(coarsePointerQuery).matches) || isConstrainedConnection(),
  () => true,
);

const getDesktopMotionMedia = () => {
  desktopMotionMedia ??= window.matchMedia(desktopMotionQuery);
  return desktopMotionMedia;
};

const subscribeToDesktopMotion = (onStoreChange: () => void) => {
  const media = getDesktopMotionMedia();
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onStoreChange);
    return () => media.removeEventListener('change', onStoreChange);
  }
  media.addListener(onStoreChange);
  return () => media.removeListener(onStoreChange);
};

const useDesktopMotion = () => {
  const shouldReduceMotion = useReducedMotion();
  const hasFinePointer = useSyncExternalStore(
    subscribeToDesktopMotion,
    () => getDesktopMotionMedia().matches,
    () => false,
  );

  return hasFinePointer && !shouldReduceMotion;
};

/**
 * Magnetic element animation
 */
export const Magnetic = ({ children, strength = 0.5 }: { children: React.ReactNode, strength?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const motionEnabled = useDesktopMotion();

  const springX = useSpring(x, magneticSpringConfig);
  const springY = useSpring(y, magneticSpringConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !motionEnabled) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Word by word reveal from mask - Simplified to clean block fade-up
 */
export const TextReveal = ({ text, className }: { text: string, className?: string }) => {
  const motionEnabled = useDesktopMotion();

  return (
    <motion.div
      className={className}
      initial={motionEnabled ? { opacity: 0, y: 15 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={revealTransition}
    >
      {text}
    </motion.div>
  );
};

/**
 * Letter by letter reveal - Simplified to clean block fade-up
 */
export const LetterReveal = ({ text, className }: { text: string, className?: string }) => {
  const motionEnabled = useDesktopMotion();

  return (
    <motion.div
      className={className}
      initial={motionEnabled ? { opacity: 0, y: 10 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={revealTransition}
    >
      {text}
    </motion.div>
  );
};

/**
 * Character reveal with 3D rotation - Simplified to clean block fade-in
 */
export const SplitTextReveal = ({
  text,
  className,
  as: Tag = 'h2',
}: {
  text: string;
  className?: string;
  as?: React.ElementType;
}) => {
  const Component = Tag as React.ElementType<{ className?: string; children?: React.ReactNode }>;
  const shouldReduceMotion = useReducedMotion();

  return (
    <Component className={className}>
      <motion.span
        className="inline-block"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={revealViewport}
        transition={revealTransition}
      >
        {text}
      </motion.span>
    </Component>
  );
};

/**
 * Global smooth scroll disabled - Restored native browser scrolling
 */
export const SmoothScroll = () => {
  return null;
};

/**
 * Section transitions disabled
 */
export const SectionTransitionEffects = () => {
  return null;
};

/**
 * Subtle Background Blob that follows mouse - only on desktop to prevent mobile GPU compositing lag
 */
export const MouseFollower = () => {
  return (
    <div className="fixed top-[20%] left-[10%] w-[450px] h-[450px] bg-brand-primary/[0.03] rounded-full blur-[120px] pointer-events-none z-0 hidden md:block" aria-hidden="true" />
  );
};

/**
 * Horizontal Scroll Wrapper
 */
export const HorizontalScroll = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="no-scrollbar [scrollbar-width:none] flex w-full snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden px-4 pb-10 scroll-px-4 sm:gap-8 sm:px-8 sm:scroll-px-8 md:gap-12 md:px-40 md:pb-16 md:scroll-px-40">
      {children}
    </div>
  );
};

/**
 * Image reveal with parallax overlay
 */
export const ImageReveal = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  return (
    <div className={cn("relative overflow-hidden group", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

/**
 * Parallax scroll container
 */
const ParallaxMotion = ({ children, offset }: { children: React.ReactNode; offset: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return <motion.div ref={ref} style={{ y }}>{children}</motion.div>;
};

export const ParallaxSection = ({ children, offset = 100 }: { children: React.ReactNode, offset?: number }) => {
  const motionEnabled = useDesktopMotion();

  return motionEnabled ? <ParallaxMotion offset={offset}>{children}</ParallaxMotion> : <div>{children}</div>;
};

/**
 * Animated background shapes for depth - Simplified to static gradients
 */
export const FloatingShapes = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] hidden overflow-hidden md:block" aria-hidden="true">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.08]",
            i === 0 ? "bg-brand-primary top-[-10%] left-[-10%]" : 
            i === 1 ? "bg-blue-500 bottom-[-10%] right-[-10%]" :
            "bg-purple-500 top-[40%] left-[40%]"
          )}
        />
      ))}
    </div>
  );
};

/**
 * Endless marquee for logos/partners - Hardware accelerated on all devices
 */
export const Marquee = ({ children, speed = 25, reverse = false }: { children: React.ReactNode, speed?: number, reverse?: boolean }) => {
  const shouldReduceMotion = useReducedMotion();
  const motionEnabled = !shouldReduceMotion;

  return (
    <div className={`flex select-none ${motionEnabled ? 'overflow-hidden' : 'no-scrollbar overflow-x-auto'}`}>
      <motion.div
        animate={motionEnabled ? { x: reverse ? ["0%", "50%"] : ["0%", "-50%"] } : undefined}
        transition={motionEnabled ? { duration: speed, repeat: Infinity, ease: "linear" } : undefined}
        className={`flex shrink-0 items-center gap-12 ${motionEnabled ? 'will-change-transform' : ''}`}
      >
        {children}
        {motionEnabled && children}
      </motion.div>
    </div>
  );
};

/**
 * Hero Background Media Container
 */
export const HeroBackground = ({ videoSrc, poster }: { videoSrc?: string, poster?: string | null }) => {
  const fallbackPoster = poster === undefined ? '/images/thesearchforabsolutesection.jpg' : poster;
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(() => Boolean(videoSrc && readyVideoSources.has(videoSrc)));
  const shouldReduceMotion = useReducedMotion();
  const canPlayVideo = Boolean(videoSrc) && !videoFailed && !shouldReduceMotion;
  const showPoster = !videoSrc || videoFailed || shouldReduceMotion || !videoReady;

  useEffect(() => {
    setVideoFailed(false);
    setVideoReady(Boolean(videoSrc && readyVideoSources.has(videoSrc)));
  }, [videoSrc]);

  const markVideoReady = (video: HTMLVideoElement) => {
    video.defaultMuted = true;
    video.muted = true;
    if (videoSrc) readyVideoSources.add(videoSrc);
    setVideoReady(true);
    void video.play().catch(() => undefined);
  };

  return (
    <div className="hero-background-media pointer-events-none absolute inset-0 z-0 overflow-hidden bg-brand-dark" aria-hidden="true">
      <div className="absolute inset-0 z-10 bg-brand-dark/20" />
      <div className="hero-background-vignette absolute inset-0 z-10" />
      {showPoster && fallbackPoster && (
        <img
          src={fallbackPoster}
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {canPlayVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          onLoadedData={(event) => markVideoReady(event.currentTarget)}
          onCanPlay={(event) => markVideoReady(event.currentTarget)}
          onError={() => {
            setVideoReady(false);
            setVideoFailed(true);
          }}
          className={`hero-background-video absolute inset-0 h-full w-full transform-gpu object-cover will-change-[opacity] transition-opacity duration-1000 ease-out ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

/**
 * Defers decorative video transfer and decoding until the media enters the viewport,
 * then pauses it again when it leaves.
 */
export const DeferredVideo = ({
  src,
  className,
  poster,
  allowCoarsePointer = false,
}: {
  src: string;
  className?: string;
  poster?: string;
  allowCoarsePointer?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const constrainedMedia = useConstrainedMedia(allowCoarsePointer);
  const shouldSkipVideo = shouldReduceMotion || constrainedMedia;

  useEffect(() => {
    if (shouldSkipVideo) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      setIsVisible(true);
      return undefined;
    }

    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setShouldLoad(true);
    }, { rootMargin: '800px 0px', threshold: 0.01 });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.01 });

    preloadObserver.observe(video);
    visibilityObserver.observe(video);
    return () => {
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [shouldSkipVideo]);

  useEffect(() => {
    if (shouldSkipVideo) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;
    video.defaultMuted = true;
    video.muted = true;
    if (!shouldLoad) {
      video.pause();
      return undefined;
    }
    setVideoReady(false);
    video.load();
    return () => video.pause();
  }, [shouldLoad, src, shouldSkipVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad || shouldSkipVideo) return;
    if (isVisible) void video.play().catch(() => undefined);
    else video.pause();
  }, [isVisible, shouldLoad, shouldSkipVideo]);

  if (shouldSkipVideo) {
    return poster ? (
      <img src={poster} alt="" width={720} height={900} decoding="async" className={className} aria-hidden="true" />
    ) : null;
  }

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      disablePictureInPicture
      aria-hidden="true"
      className={cn('transition-opacity duration-1000 ease-out', className)}
      style={videoReady ? undefined : { opacity: 0 }}
      onLoadedData={() => setVideoReady(true)}
      onCanPlay={() => setVideoReady(true)}
      onError={() => setVideoReady(Boolean(poster))}
      src={shouldLoad ? src : undefined}
    />
  );
};

/**
 * Custom cursor disabled for native performance and response
 */
export const CustomCursor = () => {
  return null;
};
