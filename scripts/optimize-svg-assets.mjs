import { mkdir, readFile, writeFile, copyFile, access } from 'node:fs/promises';
import { dirname } from 'node:path';
import { optimize } from 'svgo';

const files = [
  'assets/title.svg',
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
  const result = optimize(source, {
    multipass: true,
    plugins: [
      { name: 'preset-default', params: { overrides: { cleanupIds: false } } },
    ],
  });
  // Retain the original if minification would increase the size.
  const output =
    Buffer.byteLength(result.data) < Buffer.byteLength(source)
      ? result.data
      : source;
  await writeFile(target, output);
  console.log(
    `${file}: ${Buffer.byteLength(source)} -> ${Buffer.byteLength(output)} bytes`,
  );
}
