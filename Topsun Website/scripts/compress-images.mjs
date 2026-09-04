/**
 * compress-images.mjs
 * Converts all PNG/JPG images in src/imports to WebP and compressed PNG.
 * Run: node scripts/compress-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'src', 'imports');

let totalOriginalKB = 0;
let totalNewKB = 0;
let count = 0;

async function processDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDir(fullPath);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

      const originalStat = await stat(fullPath);
      const originalKB = originalStat.size / 1024;
      totalOriginalKB += originalKB;

      const nameNoExt = basename(entry.name, ext);
      const webpPath = join(dir, nameNoExt + '.webp');

      try {
        // Convert to WebP with quality 82 (great balance of quality vs size)
        await sharp(fullPath)
          .resize({ width: 1200, withoutEnlargement: true }) // cap at 1200px wide
          .webp({ quality: 82, effort: 6 })
          .toFile(webpPath);

        const newStat = await stat(webpPath);
        const newKB = newStat.size / 1024;
        totalNewKB += newKB;
        count++;

        const saving = Math.round((1 - newKB / originalKB) * 100);
        console.log(
          `✓ ${entry.name.padEnd(20)} ${Math.round(originalKB)}KB → ${Math.round(newKB)}KB  (-${saving}%)`
        );
      } catch (err) {
        console.error(`✗ ${entry.name}: ${err.message}`);
      }
    }
  }
}

console.log('🔧 TOPSUN Image Compressor — Converting to WebP...\n');
await processDir(ROOT);

console.log(`\n✅ Done! Converted ${count} images`);
console.log(`   Before: ${Math.round(totalOriginalKB)}KB (${Math.round(totalOriginalKB/1024)}MB)`);
console.log(`   After:  ${Math.round(totalNewKB)}KB (${Math.round(totalNewKB/1024)}MB)`);
console.log(`   Saved:  ${Math.round(totalOriginalKB - totalNewKB)}KB (${Math.round((1 - totalNewKB/totalOriginalKB)*100)}% reduction)`);
