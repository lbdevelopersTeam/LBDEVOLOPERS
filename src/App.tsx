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
const loadMemberCv = () => import('./pages/MemberCvPage');
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
const MemberCvPage = lazy(loadMemberCv);
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
    title: 'Web Development & AI Automation Agency in Pakistan | LB CodeBase',
    description: 'LB CodeBase is a Pakistan-based digital product studio building high-performance websites, Shopify stores, web apps, and practical AI automation systems.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': 'https://lbcodebase.com/#organization',
      name: 'LB CodeBase',
      url: 'https://lbcodebase.com/',
      logo: 'https://lbcodebase.com/favicon.svg',
      description: 'Digital product design, web development, commerce, and AI automation studio based in Pakistan.',
      email: 'mailto:lbdevelopers.agency@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mingora, Swat',
        addressCountry: 'PK',
      },
      areaServed: ['Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States'],
      serviceType: [
        'Web development',
        'Shopify development',
        'WordPress development',
        'AI automation',
        'Digital product design',
      ],
    },
  },
  '/about': {
    title: 'About LB CodeBase | Web Design, Engineering & AI Automation',
    description: 'Meet the Pakistan-based design, engineering, commerce, and automation team behind LB CodeBase digital products and websites.',
  },
  '/services': {
    title: 'Web Development, Shopify & AI Automation Services | LB CodeBase',
    description: 'Explore website development, React apps, Shopify and WordPress, portals, n8n workflows, AI agents, integrations, and ongoing digital support.',
  },
  '/portfolio': {
    title: 'Web Design, Shopify & Digital Product Case Studies | LB CodeBase',
    description: 'Explore LB CodeBase case studies across Shopify commerce, WordPress, React interfaces, web apps, brand platforms, and digital products.',
  },
  '/blog': {
    title: 'Web Development & AI Automation Insights | LB CodeBase',
    description: 'Read practical insights on website performance, Shopify commerce, WordPress, product design, web engineering, and AI automation.',
  },
  '/contact': {
    title: 'Start a Web Development or Automation Project | LB CodeBase',
    description: 'Tell LB CodeBase about your website, Shopify store, web app, digital product, or AI automation project and get a focused next step.',
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
    title: 'Technology Stack | LB CodeBase',
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

function MemberCvPageRoute() {
  const { slug = '' } = useParams();
  return <MemberCvPage key={slug} />;
}

function AnimatedRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Navigate to="/about#team-directory" replace />} />
        <Route path="/team/:slug/projects/:projectSlug" element={<MemberProjectDetailRoute />} />
        <Route path="/team/:slug/cv" element={<MemberCvPageRoute />} />
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
  const isMemberPortfolio = /^\/team\/[^/]+\/?$/.test(location.pathname);

  return (
    <>
      <ScrollToTop />
      <StaticRouteSeo />
      <a
        href="#main-content"
        className="skip-link fixed left-4 top-4 z-[200] -translate-y-24 rounded-full bg-white px-5 py-3 text-xs font-bold text-black transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <div id="top" className={`flex min-h-screen flex-col${isAdmin ? '' : ' studio-site'}`}>
        {!isAdmin && !isMemberPortfolio && <Navbar />}
        <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
          <AnimatedRoutes />
        </main>
        {!isAdmin && !isMemberPortfolio && <WhatsAppButton />}
        {!isAdmin && !isMemberPortfolio && <Footer />}
      </div>
    </>
  );
}
