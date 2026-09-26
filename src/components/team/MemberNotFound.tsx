import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MemberNotFound({ project = false }: { project?: boolean }) {
  return (
    <main className="flex min-h-[75vh] items-center justify-center px-6 pb-20 pt-36 text-center">
      <div className="max-w-xl">
        <SearchX className="mx-auto mb-8 h-12 w-12 text-brand-primary" />
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">404 / Not found</p>
        <h1 className="font-display text-4xl font-black uppercase tracking-normal md:text-6xl">
          {project ? 'Project unavailable.' : 'Team member unavailable.'}
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/45">
          The requested {project ? 'case study' : 'profile'} may be unpublished, inactive, or no longer available.
        </p>
        <Link to="/about#team-directory" className="mx-auto mt-10 inline-flex items-center gap-3 rounded-full bg-brand-primary px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Team
        </Link>
      </div>
    </main>
  );
}
