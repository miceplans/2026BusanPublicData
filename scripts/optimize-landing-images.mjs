import sharp from 'sharp';
import { stat } from 'node:fs/promises';

// Keep the source artwork untouched; serve these smaller derivatives instead.
const variants = [
  { source: 'bg.webp', output: 'bg-desktop.webp', width: 1920, quality: 80 },
  { source: 'bg.webp', output: 'bg-mobile.webp', width: 960, quality: 80 },
  { source: 'ai.svg', output: 'ai.webp', width: 2400, quality: 85 },
];

for (const { source, output, width, quality } of variants) {
  const input = `public/assets/${source}`;
  const target = `public/assets/${output}`;
  await sharp(input, source.endsWith('.svg') ? { density: 160 } : {})
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, alphaQuality: 100, effort: 6 })
    .toFile(target);
  const metadata = await sharp(target).metadata();
  console.log(`${target}: ${metadata.width}×${metadata.height}, ${(await stat(target)).size} bytes`);
}
