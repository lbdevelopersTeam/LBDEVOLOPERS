import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Project } from '../../lib/content';

export default function MemberProjectCard({ project, memberSlug }: { project: Project; memberSlug: string }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.025]"
    >
      <Link to={`/team/${memberSlug}/projects/${project.slug}`} className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
        <img src={project.thumbnail} alt={`${project.title} project preview`} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" />
      </Link>
      <div className="p-6 md:p-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">{project.category}</span>
          {project.completionDate && <time className="text-[10px] font-bold text-white/30">{new Date(project.completionDate).getFullYear()}</time>}
        </div>
        <h3 className="font-display text-2xl font-black uppercase tracking-normal">{project.title}</h3>
        {project.memberRole && (
          <p className="mt-3 text-[10px] font-black uppercase leading-relaxed tracking-[0.14em] text-white/65">
            Contribution: <span className="text-brand-primary">{project.memberRole}</span>
          </p>
        )}
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/45">{project.shortDescription}</p>
        {project.technologies.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {project.technologies.slice(0, 5).map((technology) => <li key={technology} className="rounded-md bg-white/5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/45">{technology}</li>)}
          </ul>
        )}
        <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5">
          <Link to={`/team/${memberSlug}/projects/${project.slug}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white hover:text-brand-primary">
            Case study <ArrowUpRight className="h-4 w-4" />
          </Link>
          <span className="ml-auto flex gap-2">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" aria-label={`Open live ${project.title} project`} className="p-2 text-white/40 hover:text-white"><ExternalLink className="h-4 w-4" /></a>}
            {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} repository`} className="p-2 text-white/40 hover:text-white"><Github className="h-4 w-4" /></a>}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
