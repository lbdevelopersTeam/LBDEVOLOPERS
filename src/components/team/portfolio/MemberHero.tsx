import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, FileText, Mail, MapPin } from 'lucide-react';
import MemberPortrait from '../MemberPortrait';
import { MemberProfile, initials, socialPlatforms, usableLink } from './shared';

export default function MemberHero({ member }: { member: MemberProfile }) {
  const socialLinks = socialPlatforms.filter(({ key }) => usableLink(member.socialLinks[key])).slice(0, 4);

  return (
    <section id="member-home" className="member-hero">
      <div className="member-hero-inner">
        <div className="member-hero-copy">
          <p className="member-eyebrow">LB CodeBase <span aria-hidden="true">/</span> Team portfolio</p>
          <h1 className="member-hero-name">{member.name}</h1>
          <p className="member-hero-role">{member.role}</p>
          <p className="member-hero-summary">{member.tagline || member.bio}</p>

          <div className="member-hero-actions">
            <a href="#projects" className="member-action member-action-primary">
              Explore selected work <ArrowDownRight size={19} aria-hidden="true" />
            </a>
            <a href="#contact" className="member-action member-action-secondary">
              Start a conversation <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </div>

          <div className="member-hero-details">
            {member.email && (
              <a href={`mailto:${member.email}`} className="member-hero-detail">
                <Mail size={17} aria-hidden="true" /> <span>{member.email}</span>
              </a>
            )}
            <Link to={`/team/${member.slug}/cv`} className="member-hero-detail">
              <FileText size={17} aria-hidden="true" /> <span>View curriculum vitae</span>
            </Link>
          </div>

          {socialLinks.length > 0 && (
            <div className="member-hero-social" aria-label="Social profiles">
              {socialLinks.map(({ key, label, icon: Icon }) => (
                <a key={key} href={member.socialLinks[key]} target="_blank" rel="noreferrer" aria-label={`${member.name} on ${label}`}>
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <figure className="member-hero-figure">
          <div className="member-hero-image">
            {member.avatar ? (
              <MemberPortrait
                src={member.avatar}
                alt={`${member.name}, ${member.role}`}
                sizes="(min-width: 1024px) 480px, (min-width: 640px) 600px, 100vw"
                fetchPriority="high"
                className="member-hero-portrait"
              />
            ) : (
              <div className="member-hero-placeholder" aria-hidden="true">{initials(member.name)}</div>
            )}
          </div>
          <figcaption className="member-hero-caption">
            <span>{member.specialization || member.role}</span>
            {member.location && <span><MapPin size={15} aria-hidden="true" /> {member.location}</span>}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
