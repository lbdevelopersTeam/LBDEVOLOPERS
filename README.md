# LB CodeBase

LB CodeBase is a React/Vite portfolio with an Express API and one MariaDB database. The public portfolio, contact forms, admin accounts, sessions, media metadata, settings, and all editable content use the same `/api/v2` database contract. Production does not fall back to `db.json` or a second database.

## Local setup

Requirements: Node.js 22+ and MariaDB 10.6+.

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, the first-admin values, and `IP_HASH_SALT`.
2. Run `npm install`.
3. Run `npm run db:setup` to create the schema and seed the portfolio.
4. Run `npm run db:verify`.
5. Run `npm run dev` and open `http://localhost:3000`.
6. Sign in at `/admin/login`. After the first successful seed, remove `ADMIN_INITIAL_PASSWORD` and redeploy.

## Hostinger deployment

For Hostinger's Git-connected **Static frontend web app**, use the Vite configuration below.

- Repository root: the directory containing this `package.json`
- Framework preset: Vite
- Node.js build version: 22
- Build command: `npm run build`
- Output/publish directory: `dist`
- Start command: none
- Entry file: none

The build places `index.html` directly in `dist` and includes `public/.htaccess` for SPA route fallback on Apache-based hosting. Do not configure `dist/public`; that directory is only used by the optional Node build.

Create one database in **Websites → Dashboard → Databases → Management**. Copy the database name, user, password, and host. In the Node.js application's environment variables, add:

```env
DATABASE_URL=mysql://DATABASE_USER:URL_ENCODED_PASSWORD@localhost:3306/DATABASE_NAME
DATABASE_SSL=false
NODE_ENV=production
PUBLIC_SITE_URL=https://lbcodebase.com
COOKIE_SECURE=true
TRUST_PROXY=true
IP_HASH_SALT=use-a-long-random-secret
ADMIN_USERNAME=your-admin-username
ADMIN_EMAIL=your-admin-email
ADMIN_INITIAL_PASSWORD=your-temporary-strong-password
```

If hPanel shows a database host other than `localhost`, use the displayed host. URL-encode special characters in credentials. Never commit the real values.

### Database limitation of static Vite hosting

Vite runs in the visitor's browser and cannot safely connect directly to MariaDB/phpMyAdmin. The existing Express API requires a Node.js runtime. The static build uses bundled public content and opens contact submissions in the visitor's email app, so it does not make missing `/api/v2` requests. Database-backed form storage and the admin panel still require the Express API (or a compatible PHP API); never put database credentials in `VITE_*` variables or frontend code.

Leave `VITE_PUBLIC_API_ENABLED=false` and `VITE_API_BASE_URL=` for the static Hostinger build. Set `VITE_PUBLIC_API_ENABLED=true` only when `/api/v2` is actually served, or set `VITE_API_BASE_URL` to the HTTPS origin of a separate compatible API.

For a separate Node backend, run:

```bash
npm run db:setup
npm run db:verify
npm run build:node
```

phpMyAdmin method: select the new database, open **Import**, and import `server/db/mariadb-migrations/001_full_portfolio.sql`. Then run `npm run db:migrate`, `npm run db:seed`, and `npm run db:verify` from the app terminal. The migrate command safely records the imported schema in the migration ledger; importing the schema alone does not create the administrator or portfolio records.

After setup, remove `ADMIN_INITIAL_PASSWORD` from Hostinger's environment variables and redeploy. Test the contact form, admin login, a content edit, and `/api/v2/health`.

### Fix a Hostinger 403

A Hostinger-branded 403 occurs before Express receives the request. In hPanel:

1. Open the deployed **Static frontend web app** and confirm its temporary domain works.
2. In its domain/settings area, attach `lbcodebase.com` to this Vite app. Do not leave the domain attached to an old empty website.
3. Confirm the domain's A record points to the IP shown for this hosting plan. Remove conflicting A/AAAA records if hPanel identifies them.
4. Confirm the build/start settings above, then choose **Redeploy**. A redeploy regenerates the managed routing for the active build.
5. If the temporary domain works but the custom domain still returns 403, temporarily disable Hostinger CDN/security for the domain or review blocked requests, then contact Hostinger support to reattach the custom domain to the Node.js application.

DNS updates can take up to 24 hours. A database change cannot fix a CDN/web-server 403.

## Commands

- `npm run db:migrate` — apply checksummed MariaDB migrations.
- `npm run db:seed` — idempotently create/preserve the admin and import the portfolio.
- `npm run db:verify` — verify MariaDB, migrations, core records, and the bcrypt admin hash.
- `npm run db:backup` — create a SQL backup with `mariadb-dump` or `mysqldump`.
- `npm run hostinger:deploy` — build the Git-connected Hostinger Vite site.
- `npm run lint` — strict TypeScript check.
- `npm run test` — automated API and repository tests.
- `npm run build` — production static Vite build in `dist`.
- `npm run build:node` — optional Vite plus Express server build.

The admin console manages projects, team profiles, posts, services, testimonials, skills, technologies, contact messages, media, public settings, and role-scoped accounts.
