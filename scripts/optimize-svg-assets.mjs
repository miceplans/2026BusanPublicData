import { mkdir, readFile, writeFile, copyFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';
import { optimize } from 'svgo';

const files = [
  'assets/bridge.svg',
  'assets/title.svg',
  'assets/qr.svg',
  'figma-assets/dropdown.svg',
  'figma-assets/requirement-dot.svg',
  'figma-assets/status-dot.svg',
  'figma-assets/search.svg',
];

for (const file of files) {
  const target = `public/${file}`;
  const original = `design-originals/${file}`;
  await mkdir(dirname(original), { recursive: true });
  try {
    await access(original);
  } catch {
    await copyFile(target, original);
  }
  const source = await readFile(original, 'utf8');
  let input = source;
  if (file === 'assets/bridge.svg') {
    // Trusted local artwork only: its embedded PNG exceeds libxml's text limit.
    const bitmap = await sharp(original, { unlimited: true })
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
    // Keep the existing SVG URL and aspect ratio, with a self-contained PNG.
    input = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1537.97 2004.34"><image width="1537.97" height="2004.34" preserveAspectRatio="none" xlink:href="data:image/png;base64,${bitmap.toString('base64')}"/></svg>`;
  }
  const result = optimize(input, {
    multipass: true,
    plugins: [{ name: 'preset-default', params: { overrides: { cleanupIds: false } } }],
  });
  // Retain the original if minification would increase the size.
  const output = Buffer.byteLength(result.data) < Buffer.byteLength(source) ? result.data : source;
  await writeFile(target, output);
  console.log(`${file}: ${Buffer.byteLength(source)} -> ${Buffer.byteLength(output)} bytes`);
}
