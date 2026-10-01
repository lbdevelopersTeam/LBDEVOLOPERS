import { ArrowUpRight, Github, Linkedin } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { TeamMember } from '../../lib/content';
import MemberPortrait from './MemberPortrait';

const validLink = (value?: string) => Boolean(value && value !== '#');

export default function TeamMemberCard({ member, index = 0 }: { member: TeamMember; index?: number }) {
  return (
    <motion.article
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.06, duration: 0.65 }}
      className="group border-t border-white/10 py-8 md:py-10"
    >
      <div className="grid items-center gap-7 md:grid-cols-[180px_minmax(0,1fr)_auto] lg:gap-12">
        <Link
          to={`/team/${member.slug}`}
          className="relative block aspect-[4/5] w-full max-w-[220px] overflow-hidden rounded-lg bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          aria-label={`View ${member.name}'s portfolio`}
        >
          {member.avatar ? (
            <MemberPortrait
              src={member.avatar}
              alt={`${member.name}, ${member.role}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-display text-4xl font-black text-white/75">
              {member.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </span>
          )}
        </Link>

        <div>
          <p className="mb-3 text-xs font-black normal-case tracking-[0.1em] text-brand-primary">{member.role}</p>
          <h2 className="mb-4 font-display text-3xl font-black normal-case tracking-normal text-white md:text-4xl">{member.name}</h2>
          <p className="max-w-2xl text-base leading-relaxed text-white/75">{member.specialization || member.bio}</p>
          {member.skills.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${member.name}'s skills`}>
              {member.skills.slice(0, 6).map((skill) => (
                <li key={skill} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold normal-case tracking-[0.12em] text-white/75">
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3 md:flex-col md:items-end">
          <Link
            to={`/team/${member.slug}`}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-primary px-6 text-xs font-black normal-case tracking-[0.1em] text-white transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            View Portfolio <ArrowUpRight className="h-4 w-4" />
          </Link>
          <div className="flex gap-2">
            {validLink(member.socialLinks.linkedin) && (
              <a href={member.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`} className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-white/75 hover:border-white/30 hover:text-white">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {validLink(member.socialLinks.github) && (
              <a href={member.socialLinks.github} target="_blank" rel="noreferrer" aria-label={`${member.name} on GitHub`} className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-white/75 hover:border-white/30 hover:text-white">
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
