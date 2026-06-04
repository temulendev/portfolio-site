import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const partials = [
  'reset.css',
  'themes.css',
  'ambient-bg.css',
  'focus.css',
  'layout.css',
  'theme-toggle.css',
  'theme-picker.css',
  'card.css',
  'sidebar.css',
  'player.css',
  'animations.css',
  'now-card.css',
  'skills.css',
  'responsive.css',
  'reduced-motion.css',
];

const out = partials
  .map((name) => readFileSync(join(root, 'src/styles', name), 'utf8'))
  .join('\n');

writeFileSync(join(root, 'public/styles.css'), out);
