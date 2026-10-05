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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                <LetterReveal 
                  text="INSIGHTS" 
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60" 
                />
              </motion.div>

              <div className="overflow-hidden mb-12">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase tracking-tighter leading-[0.95]"
                >
                  THE DIGITAL <br />
                  <span className="text-white/20 italic block uppercase">JOURNAL.</span>
                </motion.h1>
              </div>

              <TextReveal 
                text="Deep dives into high-performance engineering, cinematic design trends, and the future of digital commerce ecosystems."
                className="text-white/60 text-xl md:text-3xl max-w-3xl leading-tight font-light"
              />
            </div>
          </div>

          <div className="absolute bottom-12 right-12 z-20 hidden lg:block">
             <div className="p-8 rounded-[3rem] glass border-white/5 relative overflow-hidden w-80">
                <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-6">Trending Topics</div>
                <div className="space-y-4">
                   {['#NextJS15', '#AIAgentic', '#FramerMotion', '#WebArchitecture'].map((tag, i) => (
                     <div key={i} className="text-lg font-display font-black text-white/40 hover:text-white transition-colors cursor-pointer uppercase">{tag}</div>
                   ))}
                </div>
             </div>
          </div>
        
          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20">Read</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-brand-primary/40 to-transparent" />
          </motion.div>
        </section>

        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {error && (
            <div className="col-span-full rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-100">
              {error}
              <button onClick={() => loadBlogs()} className="ml-4 font-bold text-white">Retry</button>
            </div>
          )}
          {loading && blogs.length === 0 ? (
             <div className="col-span-full py-32 flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
                <span className="text-[10px] uppercase font-black tracking-widest text-white/20">Syncing with Infrastructure...</span>
             </div>
          ) : blogs.length === 0 ? (
            <div className="col-span-full py-20 md:py-32 text-center border-2 border-dashed border-white/5 rounded-[1.5rem] md:rounded-[3rem] px-6">
               <p className="text-white/20 uppercase font-black tracking-[0.2em] sm:tracking-[0.4em]">No logs deployed in current sector.</p>
            </div>
          ) : (
            blogs.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`group flex h-full flex-col ${index === 0 ? 'md:col-span-2 lg:col-span-3 md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center md:gap-10 md:border-b md:border-white/10 md:pb-14' : ''}`}
              >
                <div className={`aspect-[16/10] overflow-hidden border border-white/10 relative ${index === 0 ? 'mb-7 md:mb-0' : 'mb-6'}`}>
                  <img 
                    src={post.image || post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-brand-dark/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-brand-primary border border-white/10">
                    {post.category}
                  </div>
                </div>
                <div className={index === 0 ? 'min-w-0' : 'contents'}>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {post.time || post.readingTime}</span>
                </div>
                <h3 className={`${index === 0 ? 'text-2xl md:text-4xl' : 'text-2xl'} font-display font-bold mb-4 group-hover:text-brand-primary transition-colors leading-tight`}>
                  {post.title}
                </h3>
                <p className="text-white/60 text-base mb-6 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.slug}`} className="text-sm font-bold flex items-center gap-2 group/link border-b border-brand-primary/20 pb-2 w-fit mt-auto">
                  Read full article
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {blogs.length > 6 && (
          <div className="mt-20 text-center">
            <Button variant="outline" size="lg">Load more articles</Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
