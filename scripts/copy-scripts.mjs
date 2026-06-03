import { copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/scripts');
mkdirSync(outDir, { recursive: true });

for (const name of ['theme.js', 'landing.js', 'goat.js']) {
  copyFileSync(join(root, 'src/scripts', name), join(outDir, name));
}
