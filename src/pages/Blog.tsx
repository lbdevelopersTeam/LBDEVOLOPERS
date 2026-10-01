import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { SectionHeader, Button } from '../components/common/UI';
import { Calendar, User, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TextReveal, LetterReveal, HeroBackground } from '../components/common/Animations';
import { BlogPost, cachedFetch, fallbackBlogs, Paginated } from '../lib/content';

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>(fallbackBlogs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(false);

  const loadBlogs = (isActive: () => boolean = () => mounted.current) => {
    setLoading(true);
    setError('');
    cachedFetch<Paginated<BlogPost>>('/api/v2/blog?limit=20', 'public.blog.v2', {
      items: fallbackBlogs,
      nextCursor: null,
      total: fallbackBlogs.length,
    })
      .then((data) => {
        if (isActive()) setBlogs(data.items.length ? data.items : fallbackBlogs);
      })
      .catch(() => {
        if (isActive()) setError('Unable to load journal entries.');
      })
      .finally(() => {
        if (isActive()) setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    mounted.current = true;
    loadBlogs(() => active);
    return () => {
      active = false;
      mounted.current = false;
    };
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      {/* Proper Blog Hero */}
      <section className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden">
        <HeroBackground videoSrc="/videos/other-pages-hero.mp4" />

          <div className="max-w-[1600px] mx-auto w-full px-6 relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                <LetterReveal
                  text="INSIGHTS"
                  className="text-xs font-semibold normal-case tracking-[0.1em] text-white/75"
                />
              </motion.div>

              <div className="overflow-hidden mb-12">
                <motion.h1
                  initial={false}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold normal-case tracking-tighter leading-[0.95]"
                >
                  From the <br />
                  <span className="text-white/75 italic block normal-case">studio.</span>
                </motion.h1>
              </div>

              <TextReveal
                text="A small collection of notes on design decisions, engineering, and the lessons behind the work."
                className="text-white/75 text-xl md:text-3xl max-w-3xl leading-tight font-normal"
              />
            </div>
          </div>
          {/* Studio notes */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs normal-case tracking-[0.1em] text-white/75">Read</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-brand-primary/40 to-transparent" />
          </motion.div>
        </section>

        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {error && (
            <div className="col-span-full rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-100">
              {error}
              <button onClick={() => loadBlogs()} className="ml-4 font-bold text-white">Retry</button>
            </div>
          )}
          {loading && blogs.length === 0 ? (
             <div className="col-span-full py-32 flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-300 animate-spin" />
                <span className="text-xs normal-case font-semibold tracking-widest text-white/75">Loading studio notes…</span>
             </div>
          ) : blogs.length === 0 ? (
            <div className="col-span-full py-20 md:py-32 text-center border-2 border-dashed border-white/5 rounded-[1.5rem] md:rounded-[3rem] px-6">
               <p className="text-white/75 normal-case font-semibold tracking-[0.1em]">New notes are on their way. Explore our work in the meantime.</p>
            </div>
          ) : (
            Array.from(new Map(blogs.map((post) => [post.slug, post])).values()).map((post) => (
              <motion.article
                key={post.id}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group flex flex-col h-full"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-lg md:rounded-2xl mb-8 border border-white/5 relative">
                  <img
                    loading="lazy" decoding="async" width={800} height={500} src={post.image || post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-brand-dark/80 backdrop-blur-md rounded-full text-xs font-semibold normal-case tracking-widest text-blue-300 border border-white/10">
                    {post.category}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs normal-case tracking-widest text-white/75 font-bold mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {post.author}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {post.time || post.readingTime}</span>
                </div>
                <h2 className="text-2xl font-display font-semibold mb-4 flex-grow group-hover:text-blue-300 transition-colors leading-tight normal-case">
                  {post.title}
                </h2>
                <p className="text-white/75 text-base mb-8 leading-relaxed font-normal line-clamp-3">
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.slug}`} className="text-sm font-bold flex items-center gap-2 group/link border-b border-brand-primary/20 pb-2 w-fit mt-auto">
                  Read full article
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
