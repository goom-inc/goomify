/** Create a self-contained, local demo. Hash-based CSP permits only this exact embedded script. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
let html = await readFile('index.html', 'utf8');
const css = await readFile('src/styles.css', 'utf8');
const engine = await readFile('src/engine.mjs', 'utf8');
const app = (await readFile('src/app.mjs', 'utf8')).replace(/^import .*?;\n/, '');
const script = `${engine}\n${app}`;
const hash = createHash('sha256').update(script).digest('base64');
html = html.replace("script-src 'self'", `script-src 'sha256-${hash}'`)
  .replace(/<link rel="(?:icon|manifest)"[^>]+>\n/g, '')
  .replace('<link rel="stylesheet" href="./src/styles.css">', `<style>${css}</style>`)
  .replace('<script type="module" src="./src/app.mjs"></script>', `<script type="module">${script}</script>`);
await mkdir('dist', { recursive: true });
await writeFile('dist/worlds-playable.html', html);
console.log('Self-contained demo built: dist/worlds-playable.html');
