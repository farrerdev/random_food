import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
await mkdir(resolve(root, 'dist/data'), { recursive: true });
for (const file of ['index.html', 'app.js', 'logic.js', 'styles.css', 'data/menu.json']) {
  await copyFile(resolve(root, file), resolve(root, 'dist', file));
}
console.log('Built static site in dist/');
