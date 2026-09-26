-- Optional one-time demo data for 001_portfolio_schema.sql.
-- The owner account is deliberately disabled and its randomly generated password
-- was discarded. Reset its password through the application, then enable it.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION time_zone = '+00:00';
START TRANSACTION;

-- ============================
-- users (single disabled bootstrap owner)
-- ============================
INSERT INTO users (id, name, email, password_hash, role, avatar_url, is_active)
VALUES
    (1, 'Portfolio Owner', 'owner@example.com', '$2b$12$k90UVm67qOz08dRzqxGRC.m7ZZCNUGU54Pis347evGrG/DbVPKkCe', 'owner', '/images/avatar.webp', FALSE);

-- ============================
-- project_categories (5 rows)
-- ============================
INSERT INTO project_categories (id, name, slug, description, sort_order) VALUES
    (1, 'Web Applications', 'web-applications', 'Full-stack browser applications and business platforms.', 10),
    (2, 'E-commerce', 'e-commerce', 'Online retail, subscriptions, and payment experiences.', 20),
    (3, 'Mobile Applications', 'mobile-applications', 'Cross-platform and native mobile products.', 30),
    (4, 'Data & Analytics', 'data-analytics', 'Reporting, automation, and data-intensive systems.', 40),
    (5, 'Open Source', 'open-source', 'Libraries, developer tools, and community projects.', 50);

-- ============================
-- projects (8 rows)
-- ============================
INSERT INTO projects (
    id, category_id, created_by, updated_by, title, slug, short_description,
    full_description, thumbnail_url, cover_image_url, live_url, repo_url,
    status, is_featured, view_count, sort_order, published_at, meta_title, meta_description
) VALUES
    (1, 1, 1, 1, 'Atlas Client Portal', 'atlas-client-portal',
     'A secure project workspace for agencies and their clients.',
     'Atlas centralizes briefs, approvals, milestones, files, and stakeholder communication in a responsive dashboard.',
     '/images/projects/atlas-thumb.webp', '/images/projects/atlas-cover.webp', 'https://demo.example.com/atlas', 'https://github.com/example/atlas',
     'published', TRUE, 1842, 10, '2026-01-18 09:00:00', 'Atlas Client Portal Case Study', 'A secure client portal built for clear delivery, approvals, and collaboration.'),
    (2, 2, 1, 1, 'Northstar Commerce', 'northstar-commerce',
     'A conversion-focused storefront with inventory and order automation.',
     'Northstar combines a fast catalog, reliable checkout, order workflows, and an operations dashboard for a growing retailer.',
     '/images/projects/northstar-thumb.webp', '/images/projects/northstar-cover.webp', 'https://demo.example.com/northstar', NULL,
     'published', TRUE, 2310, 20, '2025-11-06 09:00:00', 'Northstar Commerce Platform', 'An e-commerce platform engineered for speed, merchandising, and reliable fulfillment.'),
    (3, 4, 1, 1, 'Pulse Metrics', 'pulse-metrics',
     'A product analytics dashboard with cohort and funnel reporting.',
     'Pulse turns event data into decision-ready acquisition, retention, cohort, and funnel views with scheduled summaries.',
     '/images/projects/pulse-thumb.webp', '/images/projects/pulse-cover.webp', 'https://demo.example.com/pulse', 'https://github.com/example/pulse-metrics',
     'published', TRUE, 1564, 30, '2025-08-14 09:00:00', 'Pulse Product Analytics', 'A practical analytics dashboard for cohorts, funnels, and product health.'),
    (4, 3, 1, 1, 'Fieldnote Mobile', 'fieldnote-mobile',
     'Offline-first field reporting for distributed service teams.',
     'Fieldnote lets technicians capture evidence, complete checklists, and synchronize work reliably in poor-connectivity environments.',
     '/images/projects/fieldnote-thumb.webp', '/images/projects/fieldnote-cover.webp', 'https://demo.example.com/fieldnote', NULL,
     'published', FALSE, 924, 40, '2025-05-22 09:00:00', 'Fieldnote Offline Mobile App', 'An offline-first mobile workflow for field teams and service operations.'),
    (5, 5, 1, 1, 'Schema Lens', 'schema-lens',
     'A CLI that documents relational schemas and highlights risky changes.',
     'Schema Lens compares database metadata, produces review-friendly reports, and flags destructive or lock-heavy migration patterns.',
     '/images/projects/schema-lens-thumb.webp', '/images/projects/schema-lens-cover.webp', NULL, 'https://github.com/example/schema-lens',
     'published', FALSE, 748, 50, '2025-02-11 09:00:00', 'Schema Lens Database CLI', 'An open-source CLI for safer relational database reviews and migrations.'),
    (6, 1, 1, 1, 'Civic Booking Hub', 'civic-booking-hub',
     'Accessible scheduling for public facilities and community programs.',
     'The platform supports availability rules, reservations, waitlists, reminders, and accessible self-service booking.',
     '/images/projects/civic-thumb.webp', '/images/projects/civic-cover.webp', 'https://demo.example.com/civic', NULL,
     'published', FALSE, 681, 60, '2024-10-02 09:00:00', 'Civic Booking Hub', 'Accessible online scheduling for community facilities and programs.'),
    (7, 2, 1, 1, 'Ember Subscriptions', 'ember-subscriptions',
     'A subscription commerce prototype with flexible billing plans.',
     'Ember explores plan changes, usage visibility, invoice history, and resilient webhook processing for subscription products.',
     '/images/projects/ember-thumb.webp', '/images/projects/ember-cover.webp', NULL, 'https://github.com/example/ember-subscriptions',
     'draft', FALSE, 0, 70, NULL, 'Ember Subscription Prototype', 'A subscription billing reference implementation for modern SaaS products.'),
    (8, 4, 1, 1, 'Release Radar', 'release-radar',
     'A deployment health monitor that joins release and incident signals.',
     'Release Radar is an archived experiment for correlating deployments, performance regressions, and operational incidents.',
     '/images/projects/release-radar-thumb.webp', '/images/projects/release-radar-cover.webp', NULL, 'https://github.com/example/release-radar',
     'archived', FALSE, 312, 80, NULL, NULL, NULL);

-- ============================
-- project_images (10 rows)
-- ============================
INSERT INTO project_images (id, project_id, image_url, alt_text, caption, width, height, sort_order) VALUES
    (1, 1, '/images/projects/atlas-dashboard.webp', 'Atlas project dashboard showing milestones and approvals', 'Project overview', 1600, 1000, 10),
    (2, 1, '/images/projects/atlas-files.webp', 'Atlas file review panel with threaded feedback', 'File review workflow', 1600, 1000, 20),
    (3, 2, '/images/projects/northstar-catalog.webp', 'Northstar responsive product catalog', 'Product discovery', 1600, 1000, 10),
    (4, 2, '/images/projects/northstar-checkout.webp', 'Northstar checkout summary and payment step', 'Streamlined checkout', 1600, 1000, 20),
    (5, 3, '/images/projects/pulse-cohorts.webp', 'Pulse retention cohort heatmap', 'Cohort analysis', 1600, 1000, 10),
    (6, 3, '/images/projects/pulse-funnel.webp', 'Pulse conversion funnel report', 'Funnel diagnostics', 1600, 1000, 20),
    (7, 4, '/images/projects/fieldnote-sync.webp', 'Fieldnote mobile synchronization status', 'Offline synchronization', 900, 1600, 10),
    (8, 5, '/images/projects/schema-lens-report.webp', 'Schema Lens migration risk report in a terminal', 'CLI risk report', 1600, 1000, 10),
    (9, 6, '/images/projects/civic-calendar.webp', 'Civic Booking Hub accessible calendar', 'Availability calendar', 1600, 1000, 10),
    (10, 7, '/images/projects/ember-billing.webp', 'Ember subscription plan and invoice screen', 'Billing workspace', 1600, 1000, 10);

-- ============================
-- skills (10 rows)
-- ============================
INSERT INTO skills (id, name, slug, category, proficiency_level, icon_url, sort_order, is_featured) VALUES
    (1, 'TypeScript', 'typescript', 'frontend', 92, '/icons/typescript.svg', 10, TRUE),
    (2, 'React', 'react', 'frontend', 90, '/icons/react.svg', 20, TRUE),
    (3, 'Node.js', 'node-js', 'backend', 91, '/icons/nodejs.svg', 30, TRUE),
    (4, 'Laravel', 'laravel', 'backend', 82, '/icons/laravel.svg', 40, FALSE),
    (5, 'MySQL', 'mysql', 'database', 93, '/icons/mysql.svg', 50, TRUE),
    (6, 'PostgreSQL', 'postgresql', 'database', 88, '/icons/postgresql.svg', 60, TRUE),
    (7, 'Docker', 'docker', 'devops', 86, '/icons/docker.svg', 70, FALSE),
    (8, 'GitHub Actions', 'github-actions', 'devops', 84, '/icons/github-actions.svg', 80, FALSE),
    (9, 'Figma', 'figma', 'tools', 78, '/icons/figma.svg', 90, FALSE),
    (10, 'Technical Communication', 'technical-communication', 'soft-skill', 90, '/icons/communication.svg', 100, TRUE);

-- ============================
-- project_skills (24 rows)
-- ============================
INSERT INTO project_skills (id, project_id, skill_id, sort_order) VALUES
    (1, 1, 1, 10), (2, 1, 2, 20), (3, 1, 3, 30), (4, 1, 5, 40),
    (5, 2, 1, 10), (6, 2, 2, 20), (7, 2, 3, 30), (8, 2, 6, 40),
    (9, 3, 1, 10), (10, 3, 2, 20), (11, 3, 3, 30), (12, 3, 5, 40),
    (13, 4, 1, 10), (14, 4, 2, 20), (15, 4, 3, 30),
    (16, 5, 1, 10), (17, 5, 3, 20), (18, 5, 5, 30),
    (19, 6, 4, 10), (20, 6, 5, 20), (21, 6, 9, 30),
    (22, 7, 1, 10), (23, 7, 3, 20), (24, 7, 6, 30);

-- ============================
-- experiences (5 rows)
-- ============================
INSERT INTO experiences (
    id, company, job_title, employment_type, description, location, is_remote,
    start_date, end_date, is_current, company_logo_url, sort_order
) VALUES
    (1, 'Independent Studio', 'Lead Full-Stack Developer', 'freelance', 'Lead discovery, architecture, delivery, and support for web products used by growing organizations.', 'Islamabad, Pakistan', TRUE, '2023-01-01', NULL, TRUE, '/images/companies/independent-studio.svg', 10),
    (2, 'Northwind Digital', 'Senior Backend Engineer', 'contract', 'Designed transactional APIs, background processing, and database migrations for high-volume commerce workflows.', 'Remote', TRUE, '2021-04-01', '2022-12-31', FALSE, '/images/companies/northwind.svg', 20),
    (3, 'Cedar Labs', 'Full-Stack Engineer', 'full-time', 'Built customer portals, internal tools, and reusable frontend systems with measurable performance improvements.', 'Lahore, Pakistan', FALSE, '2019-02-01', '2021-03-31', FALSE, '/images/companies/cedar-labs.svg', 30),
    (4, 'Brightline Systems', 'Web Developer', 'full-time', 'Delivered responsive websites and content-management integrations for service businesses.', 'Rawalpindi, Pakistan', FALSE, '2017-06-01', '2019-01-31', FALSE, '/images/companies/brightline.svg', 40),
    (5, 'Community Code Lab', 'Developer Mentor', 'volunteer', 'Mentored early-career developers through code reviews, architecture exercises, and portfolio projects.', 'Remote', TRUE, '2018-01-01', '2020-12-31', FALSE, '/images/companies/community-code-lab.svg', 50);

-- ============================
-- education_entries (5 rows)
-- ============================
INSERT INTO education_entries (id, institution, degree, field_of_study, grade, start_date, end_date, description, sort_order) VALUES
    (1, 'National University of Technology', 'Bachelor of Science', 'Computer Science', 'First Division', '2013-09-01', '2017-06-30', 'Coursework emphasized software engineering, databases, distributed systems, and human-computer interaction.', 10),
    (2, 'Open Learning Institute', 'Professional Diploma', 'Cloud Architecture', 'Distinction', '2020-01-01', '2020-10-31', 'Applied cloud design, observability, delivery automation, and reliability practices.', 20),
    (3, 'Interaction Design Foundation', 'Certificate Program', 'User Experience Design', 'Completed', '2021-03-01', '2021-08-31', 'Research, interaction design, accessibility, and usability evaluation.', 30),
    (4, 'Data Systems Academy', 'Advanced Program', 'Relational Database Engineering', 'Completed', '2022-02-01', '2022-07-31', 'Schema design, query optimization, locking, replication, and safe migrations.', 40),
    (5, 'Secure Software Guild', 'Continuing Education', 'Application Security', 'Completed', '2024-04-01', '2024-06-30', 'Threat modeling, secure coding, identity, secrets, and incident-ready logging.', 50);

-- ============================
-- certifications (5 rows)
-- ============================
INSERT INTO certifications (id, name, issuing_organization, issue_date, expiry_date, credential_id, credential_url, sort_order) VALUES
    (1, 'AWS Certified Developer – Associate', 'Amazon Web Services', '2024-05-15', '2027-05-15', 'DEMO-AWS-001', 'https://example.com/credentials/aws-demo', 10),
    (2, 'Professional Scrum Master I', 'Scrum.org', '2023-08-10', NULL, 'DEMO-PSM-001', 'https://example.com/credentials/psm-demo', 20),
    (3, 'MySQL 8.0 Database Developer', 'Oracle University', '2023-02-20', NULL, 'DEMO-MYSQL-001', 'https://example.com/credentials/mysql-demo', 30),
    (4, 'Google UX Design Certificate', 'Google', '2022-09-12', NULL, 'DEMO-UX-001', 'https://example.com/credentials/ux-demo', 40),
    (5, 'GitHub Actions Certification', 'GitHub', '2025-01-25', '2028-01-25', 'DEMO-GHA-001', 'https://example.com/credentials/gha-demo', 50);

-- ============================
-- blog_posts (6 rows)
-- ============================
INSERT INTO blog_posts (
    id, author_id, title, slug, excerpt, content, cover_image_url, status,
    published_at, reading_time_minutes, view_count, meta_title, meta_description
) VALUES
    (1, 1, 'Designing Portfolio Databases That Age Well', 'designing-portfolio-databases-that-age-well', 'Practical decisions that keep a small content database maintainable as a portfolio grows.', 'A portfolio begins small, but its data model should still make ownership, publishing, deletion, and analytics explicit. This article walks through the tradeoffs.', '/images/blog/portfolio-database.webp', 'published', '2026-02-18 08:00:00', 8, 1320, 'Portfolio Database Design', 'How to build a normalized, secure, and maintainable database for a developer portfolio.'),
    (2, 1, 'Zero-Downtime Thinking for Everyday Migrations', 'zero-downtime-thinking-for-everyday-migrations', 'Use expand, migrate, and contract to reduce risk even on modest production systems.', 'Safe evolution is a compatibility problem. Add new structures first, move data and traffic gradually, and remove old structures only after evidence says they are unused.', '/images/blog/safe-migrations.webp', 'published', '2026-01-12 08:00:00', 7, 1104, 'Safer MySQL Migrations', 'A practical expand-migrate-contract workflow for evolving production databases.'),
    (3, 1, 'What I Measure Before Optimizing a React Page', 'measure-before-optimizing-react', 'A measurement-first checklist for improving real user performance.', 'Start with user-visible outcomes, collect representative traces, identify the constrained resource, and verify each improvement against the original measurement.', '/images/blog/react-performance.webp', 'published', '2025-11-21 08:00:00', 6, 938, 'React Performance Measurement', 'A measurement-first approach to improving React application performance.'),
    (4, 1, 'Building Contact Forms That Survive the Internet', 'building-resilient-contact-forms', 'Validation, abuse controls, privacy, idempotency, and operational details for a deceptively simple feature.', 'A production contact form needs layered validation, rate limits, bot controls, safe storage, notification retries, and a clear retention policy.', '/images/blog/contact-forms.webp', 'published', '2025-09-04 08:00:00', 9, 1562, 'Secure Contact Form Design', 'How to build reliable, private, and abuse-resistant website contact forms.'),
    (5, 1, 'Choosing Between Cached Counters and Event Rows', 'cached-counters-vs-event-rows', 'When a fast counter and detailed event history should coexist.', 'Counters answer simple product queries cheaply while event rows preserve analytical flexibility. The key is to define which source is authoritative and how reconciliation works.', '/images/blog/counters-events.webp', 'published', '2025-06-16 08:00:00', 5, 704, 'Cached Counters vs Event Tables', 'Use cached counters and analytical event rows together without losing correctness.'),
    (6, 1, 'Notes on Accessible Dashboard Navigation', 'accessible-dashboard-navigation', 'A working draft on keyboard flow, landmarks, focus, and responsive navigation.', 'Draft notes covering skip links, landmark structure, focus restoration, compact navigation, and testable keyboard behavior.', NULL, 'draft', NULL, 4, 0, NULL, NULL);

-- ============================
-- blog_tags (8 rows)
-- ============================
INSERT INTO blog_tags (id, name, slug) VALUES
    (1, 'Database Design', 'database-design'),
    (2, 'MySQL', 'mysql'),
    (3, 'Backend', 'backend'),
    (4, 'React', 'react'),
    (5, 'Performance', 'performance'),
    (6, 'Security', 'security'),
    (7, 'DevOps', 'devops'),
    (8, 'Accessibility', 'accessibility');

-- ============================
-- blog_post_tags (15 rows)
-- ============================
INSERT INTO blog_post_tags (id, blog_post_id, blog_tag_id) VALUES
    (1, 1, 1), (2, 1, 2), (3, 1, 3),
    (4, 2, 1), (5, 2, 2), (6, 2, 7),
    (7, 3, 4), (8, 3, 5),
    (9, 4, 3), (10, 4, 6),
    (11, 5, 1), (12, 5, 3), (13, 5, 5),
    (14, 6, 4), (15, 6, 8);

-- ============================
-- testimonials (6 rows)
-- ============================
INSERT INTO testimonials (
    id, author_name, author_role, author_company, author_avatar_url, message,
    rating, is_approved, is_featured, approved_at, sort_order
) VALUES
    (1, 'Ayesha Khan', 'Operations Director', 'Harbor & Pine', '/images/testimonials/ayesha.webp', 'The delivery was thoughtful, transparent, and technically strong. Our team adopted the new workflow quickly.', 5, TRUE, TRUE, '2026-01-10 10:00:00', 10),
    (2, 'Daniel Reed', 'Product Lead', 'Northstar Retail', '/images/testimonials/daniel.webp', 'Performance improved immediately, but the biggest win was a codebase our internal team could confidently extend.', 5, TRUE, TRUE, '2025-11-12 10:00:00', 20),
    (3, 'Sara Ahmed', 'Founder', 'CivicWorks', '/images/testimonials/sara.webp', 'Complex scheduling rules were translated into a calm and accessible experience for both staff and residents.', 5, TRUE, TRUE, '2025-10-03 10:00:00', 30),
    (4, 'Omar Farooq', 'Engineering Manager', 'Cedar Labs', NULL, 'A dependable collaborator who communicates tradeoffs clearly and follows through on operational details.', 5, TRUE, FALSE, '2025-06-18 10:00:00', 40),
    (5, 'Mina Patel', 'Analytics Manager', 'Pulse Research', '/images/testimonials/mina.webp', 'The dashboard moved us from arguing about numbers to acting on the same trusted metrics.', 4, TRUE, FALSE, '2025-03-08 10:00:00', 50),
    (6, 'Prospective Client', 'Founder', 'Stealth Startup', NULL, 'Looking forward to sharing feedback after launch.', 5, FALSE, FALSE, NULL, 60);

-- ============================
-- contact_messages (6 rows)
-- ============================
INSERT INTO contact_messages (
    id, name, email, subject, message, ip_address, user_agent,
    is_read, is_replied, read_at, replied_at, submitted_at
) VALUES
    (1, 'Hamza Ali', 'hamza@example.com', 'E-commerce discovery call', 'We are planning a storefront rebuild and would like to discuss scope, timeline, and integrations.', INET6_ATON('203.0.113.10'), 'Demo Browser/1.0', FALSE, FALSE, NULL, NULL, '2026-08-30 09:15:00'),
    (2, 'Maya Chen', 'maya@example.com', 'Dashboard consultation', 'Could you review our analytics dashboard architecture and recommend a phased modernization plan?', INET6_ATON('2001:db8::20'), 'Demo Browser/1.0', FALSE, FALSE, NULL, NULL, '2026-08-29 14:30:00'),
    (3, 'Bilal Shah', 'bilal@example.com', 'API performance project', 'Our reporting endpoints slow down during monthly processing. We need profiling and a practical remediation plan.', INET6_ATON('203.0.113.30'), 'Demo Browser/1.0', TRUE, FALSE, '2026-08-29 10:00:00', NULL, '2026-08-28 16:45:00'),
    (4, 'Elena Rossi', 'elena@example.com', 'Accessibility audit', 'Please share availability for an accessibility review of our customer portal and design system.', INET6_ATON('2001:db8::40'), 'Demo Browser/1.0', TRUE, TRUE, '2026-08-27 09:00:00', '2026-08-27 11:20:00', '2026-08-26 18:10:00'),
    (5, 'Noah Williams', 'noah@example.com', 'Open-source collaboration', 'I would like to contribute a PostgreSQL adapter to Schema Lens and coordinate the interface design.', INET6_ATON('203.0.113.50'), 'Demo Browser/1.0', TRUE, TRUE, '2026-08-25 08:20:00', '2026-08-25 12:00:00', '2026-08-24 13:50:00'),
    (6, 'Zainab Malik', 'zainab@example.com', 'Portfolio website', 'We need a multilingual portfolio for a small architecture practice with an easy editorial workflow.', INET6_ATON('203.0.113.60'), 'Demo Browser/1.0', FALSE, FALSE, NULL, NULL, '2026-08-23 10:05:00');

-- ============================
-- social_links (6 rows)
-- ============================
INSERT INTO social_links (id, platform, url, icon, sort_order, is_active) VALUES
    (1, 'GitHub', 'https://github.com/example', 'lucide:github', 10, TRUE),
    (2, 'LinkedIn', 'https://www.linkedin.com/in/example', 'lucide:linkedin', 20, TRUE),
    (3, 'YouTube', 'https://www.youtube.com/@example', 'lucide:youtube', 30, TRUE),
    (4, 'Dev.to', 'https://dev.to/example', 'simple-icons:devdotto', 40, TRUE),
    (5, 'Stack Overflow', 'https://stackoverflow.com/users/000000/example', 'simple-icons:stackoverflow', 50, TRUE),
    (6, 'X', 'https://x.com/example', 'simple-icons:x', 60, FALSE);

-- ============================
-- site_settings (10 rows)
-- ============================
INSERT INTO site_settings (id, setting_key, setting_value, value_type, is_public, description) VALUES
    (1, 'site_title', 'LB Developers', 'string', TRUE, 'Primary site and browser title.'),
    (2, 'tagline', 'Thoughtful software, built for real work.', 'string', TRUE, 'Homepage positioning statement.'),
    (3, 'resume_url', '/documents/portfolio-owner-resume.pdf', 'url', TRUE, 'Public résumé download.'),
    (4, 'contact_email', 'hello@example.com', 'string', TRUE, 'Public inquiries address.'),
    (5, 'availability_status', 'Available for selected projects', 'string', TRUE, 'Short availability message.'),
    (6, 'default_meta_description', 'Full-stack engineering, database architecture, and product delivery for ambitious teams.', 'text', TRUE, 'Default SEO description.'),
    (7, 'show_blog', 'true', 'boolean', TRUE, 'Controls public blog navigation.'),
    (8, 'projects_per_page', '9', 'integer', FALSE, 'Default public project page size.'),
    (9, 'analytics_retention_days', '90', 'integer', FALSE, 'Retention window for raw page-view events.'),
    (10, 'business_hours', '{"timezone":"Asia/Karachi","days":[1,2,3,4,5],"start":"09:00","end":"17:00"}', 'json', TRUE, 'Structured availability for booking interfaces.');

-- ============================
-- page_views (10 rows)
-- ============================
INSERT INTO page_views (
    id, page_type, project_id, blog_post_id, page_path, ip_address, visitor_hash,
    user_agent, referrer, viewed_at
) VALUES
    (1, 'project', 1, NULL, NULL, INET6_ATON('203.0.113.101'), UNHEX(SHA2('demo-visitor-1', 256)), 'Demo Browser/1.0', 'https://www.google.com/', '2026-08-30 08:00:00'),
    (2, 'project', 1, NULL, NULL, INET6_ATON('203.0.113.102'), UNHEX(SHA2('demo-visitor-2', 256)), 'Demo Browser/1.0', 'https://www.linkedin.com/', '2026-08-30 08:05:00'),
    (3, 'project', 2, NULL, NULL, INET6_ATON('203.0.113.103'), UNHEX(SHA2('demo-visitor-3', 256)), 'Demo Browser/1.0', NULL, '2026-08-30 08:10:00'),
    (4, 'project', 3, NULL, NULL, INET6_ATON('203.0.113.104'), UNHEX(SHA2('demo-visitor-4', 256)), 'Demo Browser/1.0', 'https://github.com/', '2026-08-30 08:15:00'),
    (5, 'blog_post', NULL, 1, NULL, INET6_ATON('203.0.113.105'), UNHEX(SHA2('demo-visitor-5', 256)), 'Demo Browser/1.0', 'https://www.google.com/', '2026-08-30 08:20:00'),
    (6, 'blog_post', NULL, 2, NULL, INET6_ATON('203.0.113.106'), UNHEX(SHA2('demo-visitor-6', 256)), 'Demo Browser/1.0', 'https://dev.to/', '2026-08-30 08:25:00'),
    (7, 'blog_post', NULL, 4, NULL, INET6_ATON('203.0.113.107'), UNHEX(SHA2('demo-visitor-7', 256)), 'Demo Browser/1.0', 'https://www.google.com/', '2026-08-30 08:30:00'),
    (8, 'page', NULL, NULL, '/', INET6_ATON('203.0.113.108'), UNHEX(SHA2('demo-visitor-8', 256)), 'Demo Browser/1.0', NULL, '2026-08-30 08:35:00'),
    (9, 'page', NULL, NULL, '/contact', INET6_ATON('203.0.113.109'), UNHEX(SHA2('demo-visitor-9', 256)), 'Demo Browser/1.0', '/projects', '2026-08-30 08:40:00'),
    (10, 'page', NULL, NULL, '/about', INET6_ATON('203.0.113.110'), UNHEX(SHA2('demo-visitor-10', 256)), 'Demo Browser/1.0', '/', '2026-08-30 08:45:00');

-- ============================
-- activity_logs (5 rows)
-- ============================
INSERT INTO activity_logs (id, actor_user_id, action, subject_type, subject_id, request_id, ip_address, metadata, created_at) VALUES
    (1, 1, 'project.create', 'project', 1, '00000000-0000-4000-8000-000000000001', INET6_ATON('127.0.0.1'), JSON_OBJECT('slug', 'atlas-client-portal'), '2026-01-17 12:00:00'),
    (2, 1, 'project.publish', 'project', 1, '00000000-0000-4000-8000-000000000002', INET6_ATON('127.0.0.1'), JSON_OBJECT('published_at', '2026-01-18T09:00:00Z'), '2026-01-18 09:00:00'),
    (3, 1, 'blog_post.publish', 'blog_post', 1, '00000000-0000-4000-8000-000000000003', INET6_ATON('127.0.0.1'), JSON_OBJECT('slug', 'designing-portfolio-databases-that-age-well'), '2026-02-18 08:00:00'),
    (4, 1, 'testimonial.approve', 'testimonial', 1, '00000000-0000-4000-8000-000000000004', INET6_ATON('127.0.0.1'), JSON_OBJECT('featured', TRUE), '2026-01-10 10:00:00'),
    (5, 1, 'contact_message.reply', 'contact_message', 4, '00000000-0000-4000-8000-000000000005', INET6_ATON('127.0.0.1'), JSON_OBJECT('channel', 'email'), '2026-08-27 11:20:00');

COMMIT;
