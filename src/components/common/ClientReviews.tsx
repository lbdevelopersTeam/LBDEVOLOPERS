import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cachedFetch, fallbackTestimonials, type Testimonial } from '../../lib/content';

interface TestimonialsResponse {
  items: Array<Testimonial & {
    featured?: boolean;
    active?: boolean;
    displayOrder?: number;
  }>;
}

const wajidProjectAliases = new Set([
  'zeroma',
  'zeromapk',
  'zaroofragrances',
  'zaroofragrancescom',
  'zaroofragrancespk',
  'noorgems',
  'noorgemstone',
  'noorgemstonecom',
  'premiumwildmorels',
  'premiumwildmorelscom',
]);

const creditsWajidHussain = (project?: string) => {
  const normalizedProject = project?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
  return wajidProjectAliases.has(normalizedProject);
};

const applyWajidCredit = (review: Testimonial): Testimonial => creditsWajidHussain(review.project)
  ? { ...review, quote: review.quote.replace(/\b(?:Ibad|Mohsin)\b/gi, 'Wajid') }
  : review;

function ReviewerAvatar({ review }: { review: Testimonial }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = review.author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'LB';

  if (!review.avatar || imageFailed) {
    return <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold tracking-wider text-white" aria-hidden="true">{initials}</span>;
  }

  return (
    <img
      src={review.avatar}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setImageFailed(true)}
      className="h-12 w-12 shrink-0 rounded-full border border-white/10 bg-white/[0.06] object-cover"
    />
  );
}

function ReviewCard({ review }: { review: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.quote.length > 260;
  const byline = [review.role, review.company].filter(Boolean).join(', ');
  const showWajidCredit = creditsWajidHussain(review.project);

  return (
    <article
      aria-label={`Client review from ${review.author}`}
      className="group relative flex min-w-[88%] snap-start flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.18)] transition-colors hover:border-brand-primary/35 sm:min-w-[420px] md:min-w-[calc(50%-0.75rem)] md:p-8 lg:min-w-[calc(33.333%-1rem)]"
    >
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      <div className="mb-8 flex items-center justify-between gap-4">
        <Quote className="h-7 w-7 fill-brand-primary/20 text-blue-300" aria-hidden="true" />
        {review.project && <span className="max-w-[65%] truncate text-xs font-black normal-case tracking-[0.08em] text-white/65">{review.project}</span>}
      </div>

      <div className="flex-1">
        <p className={`text-base font-normal leading-7 text-white/80 ${!expanded && isLong ? 'line-clamp-6' : ''}`}>&ldquo;{review.quote}&rdquo;</p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="mt-3 rounded text-xs font-bold text-white/70 underline decoration-white/40 underline-offset-4 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-expanded={expanded}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      <div className="mt-9 flex items-center gap-3 border-t border-white/10 pt-5">
        <ReviewerAvatar review={review} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{review.author}</p>
          {byline && <p className="mt-1 truncate text-xs font-black normal-case tracking-[0.08em] text-blue-300">{byline}</p>}
          {showWajidCredit && (
            <Link
              to="/team/wajid-hussain"
              className="mt-2 inline-flex text-xs font-black normal-case tracking-[0.08em] text-white/65 transition-colors hover:text-brand-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label={`View Wajid Hussain's profile for the ${review.project} project`}
            >
              Project credit · Wajid Hussain
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ClientReviews() {
  const [reviews, setReviews] = useState<Testimonial[]>(() => fallbackTestimonials.map(applyWajidCredit));
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void cachedFetch<TestimonialsResponse>('/api/v2/testimonials', 'public.testimonials.v2', { items: fallbackTestimonials })
      .then((payload) => {
        if (!active || !Array.isArray(payload.items)) return;
        const nextReviews = payload.items
          .filter((review) => review.active !== false && review.quote && review.author)
          .map(applyWajidCredit);
        setReviews(nextReviews.length ? nextReviews : fallbackTestimonials.map(applyWajidCredit));
      });
    return () => { active = false; };
  }, []);

  const updateNavigation = useCallback(() => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector<HTMLElement>('article');
    if (!scroller || !card) return;
    setHasPrevious(scroller.scrollLeft > 4);
    setHasNext(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4);
    setActiveIndex(Math.max(0, Math.min(reviews.length - 1, Math.round(scroller.scrollLeft / (card.offsetWidth + 24)))));
  }, [reviews.length]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateNavigation);
    window.addEventListener('resize', updateNavigation, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateNavigation);
    };
  }, [updateNavigation]);

  const move = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>('article');
    scroller.scrollBy({ left: direction * ((card?.offsetWidth || scroller.clientWidth) + 24), behavior: 'smooth' });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }
  };

  return (
    <section id="reviews" className="relative scroll-mt-24 overflow-hidden bg-brand-gray px-6 py-16 sm:px-8 md:px-12 md:py-24 lg:px-24" aria-labelledby="client-reviews-title">
      <div className="absolute -left-48 top-16 hidden h-96 w-96 rounded-full bg-brand-primary/10 blur-[120px] md:block" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-8 md:mb-14 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
              <span className="text-xs font-black normal-case tracking-[0.08em] text-blue-300">Client perspective</span>
            </div>
            <h2 id="client-reviews-title" className="max-w-3xl font-display text-4xl font-black normal-case leading-[0.95] tracking-tighter text-white sm:text-5xl md:text-6xl">
              Built together.<br /><span className="text-white/65 italic">Proven in practice.</span>
            </h2>
          </div>
          {reviews.length > 0 && (
            <div className="border-l border-white/10 pl-5">
              <strong className="font-display text-4xl font-black text-white">{String(reviews.length).padStart(2, '0')}</strong>
              <p className="mt-1 text-xs normal-case tracking-[0.18em] text-white/65">Published client stories</p>
            </div>
          )}
        </div>

        <div aria-live="polite">
          {reviews.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-6 py-10 text-center md:px-10">
              <p className="text-lg font-semibold text-white">Client stories are being prepared.</p>
              <p className="mt-2 text-sm text-white/70">Explore our shipped work in the meantime.</p>
              <Link to="/portfolio" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black normal-case tracking-widest text-white transition hover:border-white/35 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
                View our work <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div ref={scrollerRef} onScroll={updateNavigation} onKeyDown={onKeyDown} tabIndex={0} aria-label="Client reviews carousel. Use the left and right arrow keys to navigate." className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-brand-gray">
              {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="mt-8 flex flex-col justify-between gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3" aria-label={`Review ${activeIndex + 1} of ${reviews.length}`}>
              <button type="button" onClick={() => move(-1)} disabled={!hasPrevious} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/35 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-25" aria-label="Previous review">
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => move(1)} disabled={!hasNext} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-white/35 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-25" aria-label="Next review">
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="ml-2 text-xs font-bold tabular-nums text-white/65">{String(activeIndex + 1).padStart(2, '0')} / {String(reviews.length).padStart(2, '0')}</span>
            </div>
            <Link to="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-xs font-black normal-case tracking-widest text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-brand-gray">
              Start your project <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
