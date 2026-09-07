import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname);
  if (requestPath === '/health') {
    response.statusCode = 200;
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ ok: true, service: 'safe-future', environment: process.env.VERCEL_ENV || 'development', timestamp: new Date().toISOString() }));
    return;
  }
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const candidate = path.resolve(root, relativePath);
  const safePath = candidate.startsWith(root + path.sep) ? candidate : path.join(root, '404.html');
  const filePath = existsSync(safePath) && statSync(safePath).isFile() ? safePath : path.join(root, '404.html');
  const extension = path.extname(filePath).toLowerCase();

  response.statusCode = filePath.endsWith('404.html') && !existsSync(safePath) ? 404 : 200;
  response.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  createReadStream(filePath).on('error', () => {
    response.statusCode = 500;
    response.end('Internal server error');
  }).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Safe Future server running on http://${host}:${port}`);
});
