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

Use a **Node.js Web App**, not a static site or PHP site.

- Repository root: the directory containing this `package.json`
- Node.js version: 22
- Build command: `npm run hostinger:deploy`
- Start command: `npm start`
- Entry file, if Hostinger asks: `dist/server.mjs`
- Port: `3000` (the app also reads Hostinger's `PORT` value)

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

### Create the schema

Preferred method: set Hostinger's build command to `npm run hostinger:deploy`. It automatically runs these steps before every build:

```bash
npm run db:setup
npm run db:verify
npm run build
```

phpMyAdmin method: select the new database, open **Import**, and import `server/db/mariadb-migrations/001_full_portfolio.sql`. Then run `npm run db:migrate`, `npm run db:seed`, and `npm run db:verify` from the app terminal. The migrate command safely records the imported schema in the migration ledger; importing the schema alone does not create the administrator or portfolio records.

After setup, remove `ADMIN_INITIAL_PASSWORD` from Hostinger's environment variables and redeploy. Test the contact form, admin login, a content edit, and `/api/v2/health`.

### Fix a Hostinger 403

A Hostinger-branded 403 occurs before Express receives the request. In hPanel:

1. Open the deployed **Node.js Web App** and confirm its temporary domain works.
2. In its domain/settings area, attach `lbcodebase.com` to this Node.js app. Do not leave the domain attached to an empty PHP/static website.
3. Confirm the domain's A record points to the IP shown for this hosting plan. Remove conflicting A/AAAA records if hPanel identifies them.
4. Confirm the build/start settings above, then choose **Redeploy**. A redeploy regenerates the managed routing for the active build.
5. If the temporary domain works but the custom domain still returns 403, temporarily disable Hostinger CDN/security for the domain or review blocked requests, then contact Hostinger support to reattach the custom domain to the Node.js application.

DNS updates can take up to 24 hours. A database change cannot fix a CDN/web-server 403.

## Commands

- `npm run db:migrate` — apply checksummed MariaDB migrations.
- `npm run db:seed` — idempotently create/preserve the admin and import the portfolio.
- `npm run db:verify` — verify MariaDB, migrations, core records, and the bcrypt admin hash.
- `npm run db:backup` — create a SQL backup with `mariadb-dump` or `mysqldump`.
- `npm run hostinger:deploy` — migrate, seed, verify, and build for Hostinger.
- `npm run lint` — strict TypeScript check.
- `npm run test` — automated API and repository tests.
- `npm run build` — production frontend and Express server build.

The admin console manages projects, team profiles, posts, services, testimonials, skills, technologies, contact messages, media, public settings, and role-scoped accounts.
