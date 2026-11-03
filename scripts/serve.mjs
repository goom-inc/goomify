import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const allowed = pathname === '/' || pathname === '/index.html' || pathname === '/icon.svg' || pathname === '/manifest.webmanifest' || /^\/src\/(app|engine)\.mjs$/.test(pathname) || pathname === '/src/styles.css';
    if (!allowed) { res.writeHead(404); return res.end('Not found'); }
    const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
    if (!(await stat(file)).isFile()) { res.writeHead(404); return res.end('Not found'); }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`WORLDS local demo: http://127.0.0.1:${port}`));
