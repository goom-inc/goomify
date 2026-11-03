import { mkdir, rm, copyFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
for (const file of ['index.html', 'icon.svg', 'manifest.webmanifest', 'src/app.mjs', 'src/engine.mjs', 'src/styles.css']) await copyFile(file, `dist/${file}`);
console.log('Static preview built in dist/ (6 files). No secrets or database scripts are included.');
