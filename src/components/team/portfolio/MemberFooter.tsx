import { ArrowLeft, ArrowUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { initials } from './shared';

export default function MemberFooter({ memberName }: { memberName: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-black text-black shadow-md"
            style={{ backgroundColor: 'var(--member-accent)' }}
          >
            {initials(memberName)}
          </span>
          <div>
            <p className="font-display text-sm font-black uppercase text-white">{memberName}</p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
              Personal Portfolio • LB CodeBase
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link
            to="/about#team-directory"
            className="group inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/70 transition-all hover:border-[var(--member-accent)]/50 hover:text-white"
          >
            <Users className="h-3.5 w-3.5 text-[var(--member-accent)]" />
            <span>View All Team Members</span>
          </Link>

          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>LB CodeBase Agency</span>
          </Link>

          <a
            href="#member-home"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 text-white/60 transition-all hover:-translate-y-0.5 hover:border-[var(--member-accent)] hover:text-white"
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1500px] flex-col justify-between gap-3 border-t border-white/8 pt-6 text-[9px] font-bold uppercase tracking-wider text-white/30 sm:flex-row sm:items-center">
        <p>© {currentYear} {memberName}. All rights reserved.</p>
        <p>Engineered & Powered by LB CodeBase</p>
      </div>
    </footer>
  );
}
