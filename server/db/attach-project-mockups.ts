import 'dotenv/config';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { sql } from 'kysely';
import { createDatabase, databaseConfigFromEnv } from './client';

const mockups = [
  { projectId: 'project-pedro-clavero', fileName: 'pedroclaveromockup.jpeg', altText: 'Pedro Clavero Design website mockup' },
  { projectId: 'project-sparkalads', fileName: 'sparkleadsmockup.jpeg', altText: 'Sparkalads website mockup' },
  { projectId: 'project-vogue-decor', fileName: 'voguemockup.jpeg', altText: 'Vogue Decor website mockup' },
  { projectId: 'project-zeroma', fileName: 'zeromamockup.jpeg', altText: 'Zeroma marketplace website mockup' },
  { projectId: 'project-premium-wild-morels', fileName: 'premiumwildmorelsmockup.jpeg', altText: 'Premium Wild Morels website mockup' },
  { projectId: 'project-jugo', fileName: 'jugomockup.jpeg', altText: 'Jugo website mockup' },
  { projectId: 'project-gulf-legal-consultant', fileName: 'Strategiclegalcouncilmockup.jpeg', altText: 'Gulf Legal Consultant website mockup' },
  { projectId: 'project-noor-gemstone', fileName: 'Noorgemstoneslaptopmockup.jpeg', altText: 'Noor Gemstone website mockup' },
] as const;

interface PreparedMockup {
  projectId: string;
  fileName: string;
  publicUrl: string;
  altText: string;
  mediaId: string;
  objectKey: string;
  byteSize: number;
  checksum: string;
}

async function prepareMockups(): Promise<PreparedMockup[]> {
  return Promise.all(mockups.map(async (mockup) => {
    const publicUrl = `/images/${mockup.fileName}`;
    const filePath = path.resolve(process.cwd(), 'public', 'images', mockup.fileName);
    const content = await fs.readFile(filePath);

    if (content.length === 0 || content.length > 10 * 1024 * 1024) {
      throw new Error(`${mockup.fileName} must be between 1 byte and 10 MB.`);
    }
    if (content[0] !== 0xff || content[1] !== 0xd8 || content[2] !== 0xff) {
      throw new Error(`${mockup.fileName} is not a valid JPEG file.`);
    }

    const urlDigest = crypto.createHash('sha256').update(publicUrl).digest('hex');
    return {
      ...mockup,
      publicUrl,
      mediaId: `legacy-media-${urlDigest.slice(0, 24)}`,
      objectKey: `legacy/${urlDigest}`,
      byteSize: content.length,
      checksum: crypto.createHash('sha256').update(content).digest('hex'),
    };
  }));
}

async function main() {
  const config = databaseConfigFromEnv();
  if (!config) throw new Error('DATABASE_URL is required to attach project mockups.');

  const prepared = await prepareMockups();
  const projectIds = prepared.map((mockup) => mockup.projectId);
  const mediaIds = prepared.map((mockup) => mockup.mediaId);
  const db = createDatabase(config);

  try {
    const [target, projects, existingMedia, existingRelations, uploader] = await Promise.all([
      sql<{ database: string; schema: string }>`select current_database() as database, current_schema() as schema`.execute(db),
      db.selectFrom('projects').select(['id', 'title', 'slug']).where('id', 'in', projectIds).where('deleted_at', 'is', null).execute(),
      db.selectFrom('media_assets').selectAll().where('id', 'in', mediaIds).execute(),
      db.selectFrom('project_media').selectAll().where('project_id', 'in', projectIds).execute(),
      db.selectFrom('users').select('id').where('role', '=', 'super_admin').where('is_active', '=', true).where('deleted_at', 'is', null).orderBy('created_at').executeTakeFirst(),
    ]);

    const foundProjects = new Set(projects.map((project) => project.id));
    const missingProjects = projectIds.filter((id) => !foundProjects.has(id));
    if (missingProjects.length) throw new Error(`Missing active projects: ${missingProjects.join(', ')}`);

    const backupDirectory = path.resolve(process.cwd(), 'backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDirectory, `project-mockups-before-${timestamp}.json`);
    await fs.mkdir(backupDirectory, { recursive: true });
    await fs.writeFile(backupPath, `${JSON.stringify({
      target: target.rows[0],
      projects,
      mediaAssets: existingMedia,
      projectMedia: existingRelations,
    }, null, 2)}\n`, 'utf8');

    await db.transaction().execute(async (trx) => {
      for (const mockup of prepared) {
        await trx.insertInto('media_assets').values({
          id: mockup.mediaId,
          uploaded_by: uploader?.id || null,
          provider: 'local',
          object_key: mockup.objectKey,
          public_url: mockup.publicUrl,
          original_name: mockup.fileName,
          mime_type: 'image/jpeg',
          byte_size: mockup.byteSize,
          checksum_sha256: mockup.checksum,
          width: null,
          height: null,
          alt_text: mockup.altText,
          status: 'ready',
          deleted_at: null,
        }).onDuplicateKeyUpdate({
          public_url: mockup.publicUrl,
          original_name: mockup.fileName,
          mime_type: 'image/jpeg',
          byte_size: mockup.byteSize,
          checksum_sha256: mockup.checksum,
          alt_text: mockup.altText,
          status: 'ready',
          deleted_at: null,
        }).execute();

        const existingLink = await trx.selectFrom('project_media')
          .select('media_id')
          .where('project_id', '=', mockup.projectId)
          .where('media_id', '=', mockup.mediaId)
          .executeTakeFirst();

        if (!existingLink) {
          const currentOrder = await trx.selectFrom('project_media')
            .select((eb) => eb.fn.max<number>('display_order').as('maximum'))
            .where('project_id', '=', mockup.projectId)
            .executeTakeFirst();
          await trx.insertInto('project_media').values({
            project_id: mockup.projectId,
            media_id: mockup.mediaId,
            display_order: Number(currentOrder?.maximum ?? -1) + 1,
            caption: mockup.altText,
          }).execute();
        }
      }
    });

    const verified = await db.selectFrom('project_media')
      .innerJoin('projects', 'projects.id', 'project_media.project_id')
      .innerJoin('media_assets', 'media_assets.id', 'project_media.media_id')
      .select(['projects.id', 'projects.title', 'media_assets.public_url', 'media_assets.status'])
      .where('projects.id', 'in', projectIds)
      .where('media_assets.id', 'in', mediaIds)
      .where('projects.deleted_at', 'is', null)
      .where('media_assets.deleted_at', 'is', null)
      .orderBy('projects.sort_order')
      .execute();

    if (verified.length !== prepared.length || verified.some((item) => item.status !== 'ready')) {
      throw new Error(`Verification failed: expected ${prepared.length} ready gallery links, found ${verified.length}.`);
    }

    process.stdout.write(`Database target: ${target.rows[0]?.database}.${target.rows[0]?.schema}\n`);
    process.stdout.write(`Backup: ${backupPath}\n`);
    process.stdout.write(`${JSON.stringify(verified.map((item) => ({ project: item.title, mockup: item.public_url })), null, 2)}\n`);
  } finally {
    await db.destroy();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
