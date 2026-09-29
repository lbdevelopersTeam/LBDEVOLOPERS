import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const imagesDir = path.resolve('public/images');
const backupDir = path.resolve('backups/images-original');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const files = fs.readdirSync(imagesDir);
const responsiveWidths = [480, 800, 1200];

let totalOriginal = 0;
let totalOptimized = 0;

for (const file of files) {
  const filePath = path.join(imagesDir, file);
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) continue;

  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

  // Don't optimize small poster or tiny files
  if (stat.size < 35000 && !file.endsWith('.png')) {
    totalOriginal += stat.size;
    totalOptimized += stat.size;
    continue;
  }

  // Backup original if not already backed up
  const backupPath = path.join(backupDir, file);
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  totalOriginal += stat.size;

  try {
    const image = sharp(backupPath);
    const metadata = await image.metadata();
    const maxWidth = 1600;

    let pipeline = sharp(backupPath);
    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    let buffer;
    if (ext === '.jpg' || ext === '.jpeg') {
      buffer = await pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true }).toBuffer();
    } else if (ext === '.png') {
      if (file.toLowerCase().includes('logo')) {
        buffer = await pipeline.png({ compressionLevel: 9, effort: 7 }).toBuffer();
      } else {
        buffer = await pipeline.png({ quality: 80, compressionLevel: 9, effort: 8 }).toBuffer();
      }
    } else if (ext === '.webp') {
      buffer = await pipeline.webp({ quality: 80, effort: 6 }).toBuffer();
    }

    // Only overwrite if optimized is smaller
    if (buffer && buffer.length < stat.size) {
      fs.writeFileSync(filePath, buffer);
      totalOptimized += buffer.length;
      console.log(`✓ ${file}: ${(stat.size / 1024).toFixed(0)}KB -> ${(buffer.length / 1024).toFixed(0)}KB (-${Math.round((1 - buffer.length / stat.size) * 100)}%)`);
    } else {
      totalOptimized += stat.size;
      console.log(`- ${file}: kept original (${(stat.size / 1024).toFixed(0)}KB)`);
    }

    // Also produce modern .webp companion for png and jpeg
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const baseName = path.basename(file, ext);
      const webpPath = path.join(imagesDir, `${baseName}.webp`);
      const webpBuffer = await sharp(backupPath)
        .resize(metadata.width && metadata.width > maxWidth ? { width: maxWidth, withoutEnlargement: true } : undefined)
        .webp({ quality: 80, effort: 6 })
        .toBuffer();
      fs.writeFileSync(webpPath, webpBuffer);
      console.log(`  + WebP: ${baseName}.webp (${(webpBuffer.length / 1024).toFixed(0)}KB)`);
    }

    // Keep archival originals and generate card-friendly WebP widths alongside
    // the canonical asset. Existing variants are replaced deterministically.
    if (metadata.width && metadata.width > responsiveWidths[0]) {
      const baseName = path.basename(file, ext);
      for (const width of responsiveWidths.filter((candidate) => candidate < metadata.width)) {
        const responsivePath = path.join(imagesDir, `${baseName}-${width}.webp`);
        await sharp(backupPath)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 78, effort: 6 })
          .toFile(responsivePath);
        console.log(`  + Responsive: ${baseName}-${width}.webp`);
      }
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
    totalOptimized += stat.size;
  }
}

console.log('\n=============================================');
console.log(`Total Original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Total Optimized: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
console.log(`Saved: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)} MB (-${Math.round((1 - totalOptimized / totalOriginal) * 100)}%)`);
console.log('=============================================');

const recordFiles = ['db.json', 'src/lib/content.ts'];
const inefficientReferences = [];
for (const recordFile of recordFiles) {
  if (!fs.existsSync(recordFile)) continue;
  const contents = fs.readFileSync(recordFile, 'utf8');
  for (const match of contents.matchAll(/(?:\/images\/|\/lbt\/)[^'"\s]+\.(?:png|jpe?g)/gi)) {
    inefficientReferences.push(`${recordFile}: ${match[0]}`);
  }
}
if (inefficientReferences.length) {
  console.log('\nSource records still referencing PNG/JPEG:');
  for (const reference of inefficientReferences) console.log(`  - ${reference}`);
}
