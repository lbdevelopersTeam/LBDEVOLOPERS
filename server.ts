import compression from 'compression';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createUnavailableV2Router, createV2Router } from './server/api/v2/router';
import { authenticate } from './server/api/v2/security';
import { localUploadRoot } from './server/api/v2/storage';
import { createDatabase, databaseConfigFromEnv } from './server/db/client';

dotenv.config();

const directory = path.dirname(fileURLToPath(import.meta.url));

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
})[character] || character);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);
  const isProduction = process.env.NODE_ENV === 'production';
  const contentSecurityPolicy = [
    "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'", "form-action 'self'",
    `script-src 'self'${isProduction ? '' : " 'unsafe-inline'"}`,
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https:",
    "font-src 'self' data:", "media-src 'self' blob: https:",
    "connect-src 'self' https: ws: wss:", "worker-src 'self' blob:", "manifest-src 'self'",
    ...(isProduction ? ['upgrade-insecure-requests'] : []),
  ].join('; ');

  if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(compression());
  app.use((_req, res, next) => {
    res.set({
      'Content-Security-Policy': contentSecurityPolicy,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });
    if (isProduction) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  const databaseConfig = databaseConfigFromEnv();
  let database = databaseConfig ? createDatabase(databaseConfig) : null;
  if (database) {
    try {
      await database.selectFrom('users').select('id').limit(0).execute();
      process.stdout.write(`${JSON.stringify({ level: 'info', event: 'mariadb_ready' })}\n`);
    } catch (error) {
      process.stderr.write(`${JSON.stringify({ level: 'error', event: 'mariadb_startup_check_failed', message: error instanceof Error ? error.message : String(error) })}\n`);
      await database.destroy();
      database = null;
      if (isProduction) throw new Error('MariaDB is unavailable or has not been migrated.');
    }
  }

  if (isProduction && !database) throw new Error('DATABASE_URL is required in production.');
  if (isProduction && !process.env.IP_HASH_SALT) throw new Error('IP_HASH_SALT is required in production.');
  app.use('/api/v2', database ? createV2Router(database) : createUnavailableV2Router());

  const uploadRoot = localUploadRoot();
  await fs.mkdir(uploadRoot, { recursive: true });
  app.use('/uploads', express.static(uploadRoot, {
    dotfiles: 'deny', index: false, immutable: true, maxAge: '1y',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    },
  }));
  app.use('/uploads', (_req, res) => res.status(404).json({ success: false, error: { code: 'MEDIA_NOT_FOUND', message: 'Media asset not found.' } }));

  app.get('/sitemap.xml', async (req, res, next) => {
    if (!database) return res.status(503).end();
    try {
      const baseUrl = (process.env.PUBLIC_SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
      const urls = ['', '/about', '/services', '/portfolio', '/blog', '/contact'].map((route) => `${baseUrl}${route}`);
      const [members, projects, blogs, memberProjects] = await Promise.all([
        database.selectFrom('team_members').select(['id', 'slug']).where('deleted_at', 'is', null).where('active', '=', true).execute(),
        database.selectFrom('projects').select(['id', 'slug']).where('deleted_at', 'is', null).where('status', '=', 'published').execute(),
        database.selectFrom('blog_posts').select('slug').where('deleted_at', 'is', null).where('status', '=', 'published').execute(),
        database.selectFrom('project_team_members').select(['project_id', 'team_member_id']).execute(),
      ]);
      for (const project of projects) urls.push(`${baseUrl}/portfolio/${project.slug}`);
      for (const post of blogs) urls.push(`${baseUrl}/blog/${post.slug}`);
      for (const member of members) {
        urls.push(`${baseUrl}/team/${member.slug}`);
        for (const relation of memberProjects.filter((item) => item.team_member_id === member.id)) {
          const project = projects.find((item) => item.id === relation.project_id);
          if (project) urls.push(`${baseUrl}/team/${member.slug}/projects/${project.slug}`);
        }
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}\n</urlset>`;
      return res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(xml);
    } catch (error) {
      return next(error);
    }
  });

  const authenticateAdminPage = database ? authenticate(database) : null;
  app.use('/admin', (req, res, next) => {
    if (/^\/login\/?$/.test(req.path)) return next();
    if (!authenticateAdminPage) return res.redirect(302, '/admin/login');
    return authenticateAdminPage(req, res, (error?: unknown) => error ? res.redirect(302, '/admin/login') : next());
  });

  app.use(['/api/v3', '/api/admin', '/api/messages', '/api/projects', '/api/team', '/api/blog', '/api/blogs'], (_req, res) => {
    res.status(410).json({ success: false, error: { code: 'LEGACY_API_DISABLED', message: 'Use /api/v2.' } });
  });

  if (!isProduction && process.env.SERVE_STATIC !== 'true') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ configLoader: 'runner', server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(directory, 'public');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        const normalizedPath = filePath.replace(/\\/g, '/');
        if (normalizedPath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (/\.(?:png|jpe?g|webp|avif|gif|svg|mp4|woff2?)$/i.test(normalizedPath)) {
          res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
        } else if (normalizedPath.endsWith('/index.html') || normalizedPath.endsWith('/sw.js')) {
          res.setHeader('Cache-Control', 'no-cache');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        }
      },
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(port, '0.0.0.0', () => process.stdout.write(`Server running on http://0.0.0.0:${port}\n`));
  const shutdown = async () => {
    server.close();
    await database?.destroy();
  };
  process.once('SIGTERM', () => void shutdown());
  process.once('SIGINT', () => void shutdown());
}

startServer().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
  process.exitCode = 1;
});
