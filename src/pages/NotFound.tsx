import { ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';

export default function NotFound() {
  useSeo({
    title: 'Page Not Found | LB Developers',
    description: 'The requested page could not be found.',
    canonicalPath: window.location.pathname,
  });

  return (
    <section className="relative flex min-h-[75svh] items-center justify-center overflow-hidden px-6 pb-20 pt-36 text-center sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(61,90,254,0.14),transparent_42%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-brand-primary">Error 404</p>
        <h1 className="mt-5 font-display text-5xl font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-7xl">
          This route went off-grid.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
          The page may have moved, or the address may be incomplete. Return home or browse our latest work.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-primary px-7 text-xs font-black uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Return home
          </Link>
          <Link
            to="/portfolio"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-7 text-xs font-black uppercase tracking-[0.18em] text-white/75 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            View portfolio
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
