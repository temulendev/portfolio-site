import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const posts = JSON.parse(
  readFileSync(join(root, 'data/blog-posts.json'), 'utf8')
);

for (const post of posts) {
  const nestedDir = join(root, 'dist/blog/posts', `${post.slug}.html`);
  const nestedIndex = join(nestedDir, 'index.html');
  const flatFile = join(root, 'dist/blog/posts', `${post.slug}.html`);

  if (!existsSync(nestedIndex)) {
    console.warn(`Skip flatten (missing): ${nestedIndex}`);
    continue;
  }

  const html = readFileSync(nestedIndex, 'utf8');
  const tempFile = `${flatFile}.tmp`;
  writeFileSync(tempFile, html);
  rmSync(nestedDir, { recursive: true, force: true });
  writeFileSync(flatFile, readFileSync(tempFile, 'utf8'));
  rmSync(tempFile, { force: true });
}
