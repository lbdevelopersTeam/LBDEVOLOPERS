import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { SectionHeader, Button } from '../components/common/UI';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Linkedin, Loader2 } from 'lucide-react';
import { LetterReveal, TextReveal, HeroBackground } from '../components/common/Animations';
import { BlogPost as BlogPostType, fallbackBlogs, fetchJson } from '../lib/content';
import { sanitizeHtml } from '../lib/sanitize';
import { useSeo } from '../lib/seo';

export default function BlogPost() {
  const { id = '' } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(() => (
    fallbackBlogs.find((item) => item.slug === id || item.id === id) || null
  ));
  const [loading, setLoading] = useState(() => !fallbackBlogs.some((item) => item.slug === id || item.id === id));
  const [shareNotice, setShareNotice] = useState('');
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fallback = fallbackBlogs.find((item) => item.slug === id || item.id === id) || null;
    setPost(fallback);
    setLoading(!fallback);

    fetchJson<BlogPostType>(`/api/v2/blog/${id}`, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setPost(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setPost(fallback);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  useSeo({
    title: post?.metaTitle || (post ? `${post.title} | LB CodeBase` : loading ? 'Loading Article | LB CodeBase' : 'Article Not Found | LB CodeBase'),
    description: post?.metaDescription || post?.excerpt || 'Read engineering and product insights from LB CodeBase.',
    image: post?.image || post?.coverImage,
    canonicalPath: post ? `/blog/${post.slug}` : `/blog/${id}`,
  });

  const handleNativeShare = async () => {
    if (!post) return;
    const shareData = { title: post.title, text: post.excerpt, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        if (mounted.current) setShareNotice('Share menu opened.');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        if (mounted.current) setShareNotice('Article link copied.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (mounted.current) setShareNotice('Unable to share automatically. Copy the address from your browser.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-300 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-300 animate-pulse">01</div>
        </div>
        <span className="text-xs font-semibold normal-case tracking-[0.1em] text-white/75">Loading the note…</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-display font-semibold normal-case mb-6 tracking-tighter">Note not found</h1>
        <p className="text-white/75 mb-10 max-w-md normal-case tracking-widest text-xs">The requested log ID does not exist in our historical archive.</p>
        <Link to="/blog">
          <Button variant="outline">Return to Repository</Button>
        </Link>
      </div>
    );
  }

  const encodedUrl = encodeURIComponent(window.location.href);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 pb-16 md:pb-20 px-6 sm:px-8 md:px-12 lg:px-20"
    >
      <div className="max-w-[1600px] mx-auto">
        <section className="relative min-h-[70vh] flex flex-col justify-center pt-12 pb-12 overflow-hidden mb-14 md:mb-20">
          <HeroBackground poster={post.image || post.coverImage || '/images/thesearchforabsolutesection.jpg'} />

          <Link to="/blog" className="inline-flex items-center gap-2 text-white/75 hover:text-blue-300 mb-12 transition-colors group z-10 w-fit text-sm font-bold normal-case tracking-widest">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to blog
          </Link>

          <div className="max-w-4xl relative z-10">
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
              <LetterReveal
                text={post.category?.toUpperCase() || 'INSIGHT'}
                className="text-xs font-semibold normal-case tracking-[0.1em] text-white/75"
              />
            </motion.div>

            <div className="overflow-hidden mb-10">
              <motion.h1
                initial={false}
                animate={{ y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="fluid-display font-display font-semibold normal-case leading-[1.1] tracking-tight"
              >
                {post.title}
              </motion.h1>
            </div>

            <div className="flex flex-wrap items-center gap-8 text-white/75 text-sm">
              <div className="flex items-center gap-2 normal-case tracking-widest font-semibold text-xs">
                <Calendar className="w-4 h-4 text-blue-300" />
                {post.date}
              </div>
              <div className="flex items-center gap-2 normal-case tracking-widest font-semibold text-xs">
                <Clock className="w-4 h-4 text-blue-300" />
                {post.time || post.readingTime}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-20">
          <div className="space-y-12">
            <div className="rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
              <img src={post.image || post.coverImage} alt={post.title} className="w-full h-auto grayscale transition-all duration-1000 hover:grayscale-0 scale-105 hover:scale-100" referrerPolicy="no-referrer" />
            </div>

            <div
              className="blog-content prose prose-invert prose-lg max-w-none text-white/75 space-y-8 font-normal leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />
          </div>

          <aside className="space-y-12 lg:sticky lg:top-32 h-fit">
            <div className="p-6 md:p-8 premium-card glass rounded-[1.5rem] md:rounded-[2rem] border border-white/5">
              <div className="text-xs font-semibold text-blue-300 normal-case tracking-widest mb-6">Author Brief</div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-semibold text-blue-300">
                  {post.author?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">{post.author}</div>
                  <div className="text-xs text-white/75 normal-case tracking-widest mt-1">Lead Architect</div>
                </div>
              </div>
              <p className="text-xs text-white/75 leading-relaxed italic mb-8">
                "We don't build websites. We engineer high-velocity digital ecosystems that command market authority."
              </p>
              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share this article on X"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:text-blue-300"
                >
                  <Twitter aria-hidden="true" className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share this article on LinkedIn"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:text-blue-300"
                >
                  <Linkedin aria-hidden="true" className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => void handleNativeShare()}
                  aria-label="Share or copy this article link"
                  className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:text-blue-300 transition-all"
                >
                  <Share2 aria-hidden="true" className="w-4 h-4" />
                </button>
              </div>
              <p aria-live="polite" className="mt-3 min-h-4 text-xs text-white/75">{shareNotice}</p>
            </div>

            <div className="p-6 md:p-8 bg-brand-primary/10 border border-brand-primary/20 rounded-[1.5rem] md:rounded-[2rem]">
               <h4 className="text-sm font-semibold normal-case tracking-tighter mb-4 text-white">Discuss a project</h4>
               <p className="text-xs text-white/75 mb-6 leading-relaxed">Have a related challenge? Tell us what you’re trying to improve.</p>
               <Link to="/contact">
                 <Button className="w-full text-xs">Start a conversation</Button>
               </Link>
            </div>
          </aside>
        </div>

        <div className="mt-20 md:mt-32 p-6 sm:p-10 md:p-20 bg-brand-primary rounded-[1.5rem] md:rounded-[3.5rem] text-center relative overflow-hidden group">
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,1)_0%,transparent_80%)] group-hover:scale-110 transition-transform duration-1000" />
           <div className="relative z-10">
              <h3 className="text-3xl md:text-6xl font-display font-semibold normal-case mb-6 tracking-tighter">Continue the conversation.</h3>
              <p className="text-white/80 max-w-xl mx-auto mb-12 text-sm leading-relaxed">Bring us your goals, constraints, and current stack. We will respond with a practical next step.</p>
              <Link to="/contact" className="inline-flex">
                <Button variant="secondary" className="normal-case font-semibold text-xs tracking-widest px-8">Start a Project Brief</Button>
              </Link>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
