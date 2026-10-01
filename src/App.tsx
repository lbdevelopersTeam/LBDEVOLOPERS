/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useSyncExternalStore } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';
import { MotionConfig } from 'motion/react';
import { FloatingShapes } from './components/common/Animations';
import ScrollToTop from './components/common/ScrollToTop';
import { useSeo, type SeoOptions } from './lib/seo';
import Home from './pages/Home';
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Contact = lazy(() => import('./pages/Contact'));
const TechStack = lazy(() => import('./pages/TechStack'));
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

const constrainedDeviceQuery = '(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)';

function subscribeToConstrainedDevice(onStoreChange: () => void) {
  const media = window.matchMedia(constrainedDeviceQuery);
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onStoreChange);
    return () => media.removeEventListener('change', onStoreChange);
  }
  media.addListener(onStoreChange);
  return () => media.removeListener(onStoreChange);
}

function useConstrainedDevice() {
  return useSyncExternalStore(
    subscribeToConstrainedDevice,
    () => window.matchMedia(constrainedDeviceQuery).matches,
    () => true,
  );
}

const staticRouteSeo: Record<string, Omit<SeoOptions, 'canonicalPath'>> = {
  '/': {
    title: 'LB CodeBase | Design & Development',
    description: 'LB CodeBase designs, builds, improves, and supports websites, commerce stores, and digital products. Based in Swat, Pakistan.',
  },
  '/about': {
    title: 'About & Team | LB CodeBase',
    description: 'Learn about LB CodeBase and meet the engineering, design, automation, and strategy specialists behind the work.',
  },
  '/services': {
    title: 'Design & Development Services | LB CodeBase',
    description: 'Explore web development, product design, e-commerce, application development, digital audits, and growth services from LB CodeBase.',
  },
  '/portfolio': {
    title: 'Selected Work | LB CodeBase',
    description: 'Explore selected websites, commerce platforms, applications, and digital products engineered by LB CodeBase.',
  },
  '/blog': {
    title: 'Studio Notes | LB CodeBase',
    description: 'Read practical perspectives on product engineering, performance, design systems, commerce, and digital growth.',
  },
  '/contact': {
    title: 'Contact LB CodeBase | Start a Project',
    description: 'Tell LB CodeBase about your website, application, e-commerce, product design, or engineering project.',
  },
  '/booking': {
    title: 'Request a Strategy Call | LB CodeBase',
    description: 'Request a focused strategy call with LB CodeBase to discuss your goals, constraints, and next steps.',
  },
  '/planner': {
    title: 'Project Planner | LB CodeBase',
    description: 'Create a concise starting brief for your next website, application, e-commerce, or digital product project.',
  },
  '/tech': {
    title: 'Technology That Fits the Job | LB CodeBase',
    description: 'Review the technologies LB CodeBase uses to build reliable, secure, and high-performance digital products.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | LB CodeBase',
    description: 'Find answers about working with LB CodeBase, project delivery, technology choices, timelines, and support.',
  },
  '/careers': {
    title: 'Careers | LB CodeBase',
    description: 'Explore opportunities to join LB CodeBase and help build ambitious digital products.',
  },
  '/privacy': {
    title: 'Privacy Policy | LB CodeBase',
    description: 'Read how LB CodeBase handles personal information and website data.',
  },
  '/terms': {
    title: 'Terms of Service | LB CodeBase',
    description: 'Review the terms that apply when using the LB CodeBase website and services.',
  },
};

function SeoRoute({ options, canonicalPath }: { options: Omit<SeoOptions, 'canonicalPath'>; canonicalPath: string }) {
  useSeo({ ...options, image: options.image || '/images/home-hero-side-poster.webp', canonicalPath });
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
  const constrainedDevice = useConstrainedDevice();

  return (
    <MotionConfig reducedMotion={constrainedDevice ? 'always' : 'user'}>
      <Router useTransitions={false}>
        <AppShell />
      </Router>
    </MotionConfig>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  return (
    <>
      <ScrollToTop />
      <StaticRouteSeo />
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <div id="top" className="flex min-h-screen flex-col">
        {!isAdmin && !isHome && <FloatingShapes />}
        {!isAdmin && <Navbar />}
        <main id="main-content" tabIndex={-1} className={`flex-grow outline-none ${isAdmin ? '' : 'marketing-surface'}`}>
          <AnimatedRoutes />
        </main>
        {!isAdmin && <WhatsAppButton />}
        {!isAdmin && <Footer />}
      </div>
    </>
  );
}
