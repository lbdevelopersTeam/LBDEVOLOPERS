import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TeamMember } from '../../../lib/content';

export default function MemberPageHeader({ member, pageLabel }: { member: TeamMember; pageLabel: string }) {
  return (
    <nav className="member-nav member-subpage-nav print:hidden" aria-label={`${member.name} ${pageLabel} navigation`}>
      <div className="member-nav-inner">
        <div className="member-nav-brand-group">
          <Link to="/" className="member-nav-brand" aria-label="LB CodeBase home">
            <img src="/images/LB CodeBase Logo.webp" alt="LB CodeBase" width="144" height="32" decoding="async" />
          </Link>
          <span className="member-nav-context" title={`${member.name} / ${pageLabel}`}>{member.name} <span aria-hidden="true">/</span> {pageLabel}</span>
        </div>
        <div className="member-nav-actions">
          <Link to="/about#team-directory" className="member-nav-back">All team</Link>
          <Link to={`/team/${member.slug}`} className="member-subpage-link">
            <ArrowLeft size={17} aria-hidden="true" /> Back to portfolio
          </Link>
        </div>
      </div>
    </nav>
  );
}
