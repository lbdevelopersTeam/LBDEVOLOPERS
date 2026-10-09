import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TeamMember } from '../../../lib/content';
import MemberPortrait from '../MemberPortrait';
import { initials } from './shared';

export default function MemberPageHeader({ member, pageLabel }: { member: TeamMember; pageLabel: string }) {
  return (
    <nav className="member-nav member-subpage-nav print:hidden" aria-label={`${member.name} ${pageLabel} navigation`}>
      <div className="member-nav-inner">
        <Link to={`/team/${member.slug}`} className="member-nav-identity">
          {member.avatar ? (
            <MemberPortrait src={member.avatar} alt="" sizes="42px" className="member-nav-avatar" />
          ) : (
            <span className="member-nav-avatar member-nav-initials">{initials(member.name)}</span>
          )}
          <span className="member-nav-person">
            <strong>{member.name}</strong>
            <small>{pageLabel}</small>
          </span>
        </Link>
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
