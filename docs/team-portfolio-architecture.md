# Team Portfolio Architecture

## Existing Application

- Runtime: React 19, Vite 6, TypeScript, React Router, and an Express server.
- Styling: Tailwind CSS v4 with shared LB CodeBase brand tokens and Motion animations.
- Content: one server-side `db.json` store accessed only through Express APIs.
- Admin: authenticated `/admin` SPA backed by httpOnly signed-cookie sessions.
- Deployment: one Node process serves API routes and Vite middleware in development, then the compiled SPA in production.

## Added Public Routes

- `/team` lists every active team member.
- `/team/:slug` resolves an active member dynamically.
- `/team/:memberSlug/projects/:projectSlug` resolves a published project that belongs to that member.
- `/sitemap.xml` includes active member and published member-project URLs.

Invalid or inactive member and project slugs return API 404 responses and render a branded not-found view.

## Data Relationships

The existing JSON database remains the only runtime datastore. Records use stable IDs and explicit references:

- Team members own profile, skill-group, experience, education, certification, and social-link content.
- Projects reference their owner through `projects.memberId -> team.id`.
- Project media is ordered through each project's `gallery` array.
- Contact messages reference their recipient through `messages.memberId -> team.id` and retain the member slug/name snapshot for administration.

The API validates project-member and inquiry-member references before writes. Slugs are unique within their resource collection and soft deletion preserves existing records.

For a future SQL migration, the nested member collections map directly to `team_members`, `skills`, `experience`, `education`, `certifications`, and `social_links` tables keyed by `member_id`; project galleries map to `project_media` keyed by `project_id`. This keeps the current deployment dependency-free without introducing a second database.

## Security

- Zod validates and bounds all new public and admin payloads server-side.
- External URLs and uploaded data URLs use allowlists; CV uploads accept PDF only and profile uploads accept images only.
- Admin cookies are httpOnly and SameSite Strict; state-changing admin requests reject cross-origin browser requests.
- Login and contact routes are rate-limited by IP.
- Admin credentials and signing secrets remain server-side environment variables.
- Rich project HTML is sanitized before rendering, while inquiries render as plain React text.

## SEO And Performance

- Member and case-study pages generate titles, descriptions, canonical URLs, Open Graph images, and JSON-LD.
- Public member APIs use short cache windows with stale-while-revalidate.
- Route components are lazy-loaded, project/gallery images are lazy-loaded, and hero images receive explicit priority.
- Animations use the existing Motion system and global reduced-motion rules.
