/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';
import { MotionConfig } from 'motion/react';
import { FloatingShapes, CustomCursor, SectionTransitionEffects, SmoothScroll } from './components/common/Animations';
import ScrollToTop from './components/common/ScrollToTop';
import { useSeo, type SeoOptions } from './lib/seo';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import TechStack from './pages/TechStack';

const loadProjectDetail = () => import('./pages/ProjectDetail');
const loadBlog = () => import('./pages/Blog');
const loadBlogPost = () => import('./pages/BlogPost');
const loadBooking = () => import('./pages/Booking');
const loadProjectPlanner = () => import('./pages/ProjectPlanner');
const loadFAQ = () => import('./pages/FAQ');
const loadCareers = () => import('./pages/Careers');
const loadLegal = () => import('./pages/Legal');
const loadMemberPortfolio = () => import('./pages/MemberPortfolio');
const loadMemberProjectDetail = () => import('./pages/MemberProjectDetail');
const loadNotFound = () => import('./pages/NotFound');

const publicRouteLoaders = [
  loadProjectDetail,
  loadBlog,
  loadBlogPost,
  loadBooking,
  loadProjectPlanner,
  loadFAQ,
  loadCareers,
  loadLegal,
  loadMemberPortfolio,
  loadMemberProjectDetail,
  loadNotFound,
];

const ProjectDetail = lazy(loadProjectDetail);
const Blog = lazy(loadBlog);
const BlogPost = lazy(loadBlogPost);
const Booking = lazy(loadBooking);
const ProjectPlanner = lazy(loadProjectPlanner);
const Admin = lazy(() => import('./pages/Admin'));
const FAQ = lazy(loadFAQ);
const Careers = lazy(loadCareers);
const Legal = lazy(loadLegal);
const MemberPortfolio = lazy(loadMemberPortfolio);
const MemberProjectDetail = lazy(loadMemberProjectDetail);
const NotFound = lazy(loadNotFound);

const staticRouteSeo: Record<string, Omit<SeoOptions, 'canonicalPath'>> = {
  '/': {
    title: 'LB Developers | Premium Digital Agency',
    description: 'LB Developers designs and engineers high-performance websites, applications, e-commerce platforms, and digital products.',
  },
  '/about': {
    title: 'About & Team | LB Developers',
    description: 'Learn about LB Developers and meet the engineering, design, automation, and strategy specialists behind the work.',
  },
  '/services': {
    title: 'Digital Engineering Services | LB Developers',
    description: 'Explore web development, product design, e-commerce, application development, digital audits, and growth services from LB Developers.',
  },
  '/portfolio': {
    title: 'Selected Work | LB Developers',
    description: 'Explore selected websites, commerce platforms, applications, and digital products engineered by LB Developers.',
  },
  '/blog': {
    title: 'Engineering Journal | LB Developers',
    description: 'Read practical perspectives on product engineering, performance, design systems, commerce, and digital growth.',
  },
  '/contact': {
    title: 'Contact LB Developers | Start a Project',
    description: 'Tell LB Developers about your website, application, e-commerce, product design, or engineering project.',
  },
  '/booking': {
    title: 'Request a Strategy Call | LB Developers',
    description: 'Request a focused strategy call with LB Developers to discuss your goals, constraints, and next steps.',
  },
  '/planner': {
    title: 'Project Planner | LB Developers',
    description: 'Create a concise starting brief for your next website, application, e-commerce, or digital product project.',
  },
  '/tech': {
    title: 'Technology Stack | LB Developers',
    description: 'Review the technologies LB Developers uses to build reliable, secure, and high-performance digital products.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | LB Developers',
    description: 'Find answers about working with LB Developers, project delivery, technology choices, timelines, and support.',
  },
  '/careers': {
    title: 'Careers | LB Developers',
    description: 'Explore opportunities to join LB Developers and help build ambitious digital products.',
  },
  '/privacy': {
    title: 'Privacy Policy | LB Developers',
    description: 'Read how LB Developers handles personal information and website data.',
  },
  '/terms': {
    title: 'Terms of Service | LB Developers',
    description: 'Review the terms that apply when using the LB Developers website and services.',
  },
};

function SeoRoute({ options, canonicalPath }: { options: Omit<SeoOptions, 'canonicalPath'>; canonicalPath: string }) {
  useSeo({ ...options, canonicalPath });
  return null;
}

function StaticRouteSeo() {
  const { pathname } = useLocation();
  const options = staticRouteSeo[pathname];
  return options ? <SeoRoute options={options} canonicalPath={pathname} /> : null;
}

function RouteLoader() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center bg-brand-dark" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border border-white/10 border-t-brand-primary" aria-hidden="true" />
      <span className="sr-only">Loading page</span>
    </div>
  );
}

function ProjectDetailRoute() {
  const { id = '' } = useParams();
  return <ProjectDetail key={id} />;
}

function BlogPostRoute() {
  const { id = '' } = useParams();
  return <BlogPost key={id} />;
}

function MemberPortfolioRoute() {
  const { slug = '' } = useParams();
  return <MemberPortfolio key={slug} />;
}

function MemberProjectDetailRoute() {
  const { slug = '', projectSlug = '' } = useParams();
  return <MemberProjectDetail key={`${slug}/${projectSlug}`} />;
}

function AnimatedRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Navigate to="/about#team-directory" replace />} />
        <Route path="/team/:slug/projects/:projectSlug" element={<MemberProjectDetailRoute />} />
        <Route path="/team/:slug" element={<MemberPortfolioRoute />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:id" element={<ProjectDetailRoute />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPostRoute />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/planner" element={<ProjectPlanner />} />
        <Route path="/tech" element={<TechStack />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router useTransitions={false}>
        <AppShell />
      </Router>
    </MotionConfig>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return undefined;

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return undefined;

    const preloadRoutes = () => {
      void Promise.allSettled(publicRouteLoaders.map((loadRoute) => loadRoute()));
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(preloadRoutes, { timeout: 2_000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(preloadRoutes, 1_000);
    return () => window.clearTimeout(timeoutId);
  }, [isAdmin]);

  return (
    <>
      <ScrollToTop />
      <StaticRouteSeo />
      <SmoothScroll />
      <SectionTransitionEffects />
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <div id="top" className="flex min-h-screen flex-col">
        {!isAdmin && <CustomCursor />}
        {!isAdmin && <FloatingShapes />}
        {!isAdmin && <Navbar />}
        <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
          <AnimatedRoutes />
        </main>
        {!isAdmin && <WhatsAppButton />}
        {!isAdmin && <Footer />}
      </div>
    </>
  );
}
