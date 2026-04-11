// `burnd serve` — local HTTP server that exposes the snapshot as JSON
// and serves the static dashboard build from disk.
//
// Architecture:
//   GET /api/snapshot       → JSON of the latest scan (cached for 30s)
//   GET /api/refresh        → forces a re-scan, returns the new snapshot
//   GET /                   → dashboard index.html
//   GET /<asset>            → dashboard static asset
//
// Uses Node's built-in http + fs modules — zero runtime dependencies.

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { walkJsonlFiles, defaultClaudeProjectsRoot } from './walker.js';
import { streamRecords, type ParseStats } from './parser.js';
import { newEmptyStats, ingestRecord, type SessionStats } from './session.js';
import { buildSnapshot, type Snapshot } from './snapshot.js';
import { basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Where to find the static dashboard build. The dashboard lives in
// src/web/dist/ after running `npm run build` in src/web/. The CLI's
// own dist/ is at src/cli/dist/, so the relative path from a built
// CLI module is ../../web/dist/.
const DASHBOARD_DIST_DEFAULT = resolve(__dirname, '..', '..', 'web', 'dist');

const SNAPSHOT_CACHE_MS = 30_000;

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

interface ServeOptions {
  root: string;
  port: number;
  burndVersion: string;
  dashboardDist: string;
}

export async function startServer(opts: ServeOptions): Promise<void> {
  let cached: { at: number; snapshot: Snapshot } | null = null;

  async function buildLatestSnapshot(): Promise<Snapshot> {
    const allStats: SessionStats[] = [];
    let filesScanned = 0;
    const parseStats: ParseStats = {
      recordsTotal: 0,
      recordsParsed: 0,
      recordsSkipped: 0,
      bytesRead: 0,
    };
    for await (const file of walkJsonlFiles(opts.root)) {
      filesScanned += 1;
      const sessionId = basename(file.absPath, '.jsonl');
      const stats = newEmptyStats(sessionId, file.absPath, file.projectDir, file.isSubagent);
      for await (const record of streamRecords(file.absPath, parseStats)) {
        ingestRecord(stats, record);
      }
      allStats.push(stats);
    }
    return buildSnapshot(allStats, {
      burndVersion: opts.burndVersion,
      filesScanned,
      recordsParsed: parseStats.recordsParsed,
      recordsSkipped: parseStats.recordsSkipped,
    });
  }

  async function getSnapshot(forceRefresh: boolean): Promise<Snapshot> {
    if (!forceRefresh && cached && Date.now() - cached.at < SNAPSHOT_CACHE_MS) {
      return cached.snapshot;
    }
    const snapshot = await buildLatestSnapshot();
    cached = { at: Date.now(), snapshot };
    return snapshot;
  }

  const server = createServer(async (req, res) => {
    try {
      await handleRequest(req, res, opts.dashboardDist, getSnapshot);
    } catch (err: unknown) {
      res.writeHead(500, { 'content-type': 'text/plain' });
      res.end(`burnd serve: ${(err as Error).message ?? String(err)}`);
    }
  });

  await new Promise<void>((resolveListen) => {
    server.listen(opts.port, () => resolveListen());
  });

  // Pre-warm the cache so the first dashboard load is instant.
  await getSnapshot(true);

  process.stdout.write(`\n  burnd dashboard running at http://localhost:${opts.port}\n`);
  process.stdout.write(`  press Ctrl+C to stop\n\n`);
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  dashboardDist: string,
  getSnapshot: (forceRefresh: boolean) => Promise<Snapshot>,
): Promise<void> {
  const url = req.url ?? '/';

  // CORS for local dev — the dashboard might be running on a different
  // port (Vite dev server) and need to fetch from this server.
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url === '/api/snapshot') {
    const snapshot = await getSnapshot(false);
    sendJson(res, 200, snapshot);
    return;
  }
  if (url === '/api/refresh') {
    const snapshot = await getSnapshot(true);
    sendJson(res, 200, snapshot);
    return;
  }
  if (url === '/api/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  // Static file serving from the dashboard dist directory.
  await serveStaticFile(req, res, dashboardDist);
}

async function serveStaticFile(
  req: IncomingMessage,
  res: ServerResponse,
  dashboardDist: string,
): Promise<void> {
  const url = req.url ?? '/';
  const cleanPath = url.split('?')[0] ?? '/';
  const requestedPath = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\//, '');

  // Path traversal protection — resolve absolute paths and ensure they
  // stay inside the dashboard dist directory.
  const safeAbsPath = resolve(dashboardDist, normalize(requestedPath));
  if (!safeAbsPath.startsWith(dashboardDist + sep) && safeAbsPath !== dashboardDist) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('forbidden');
    return;
  }

  let filePath = safeAbsPath;
  let fileStat;
  try {
    fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = join(filePath, 'index.html');
      fileStat = await stat(filePath);
    }
  } catch {
    // SPA fallback: any unknown path serves the dashboard index.html so
    // client-side routing works.
    filePath = join(dashboardDist, 'index.html');
    try {
      fileStat = await stat(filePath);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end(
        `burnd: dashboard build not found at ${dashboardDist}.\n` +
          `Run 'npm run build' in src/web/ first, or run 'burnd' (without 'serve') for the CLI output.`,
      );
      return;
    }
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME[ext] ?? 'application/octet-stream';
  const body = await readFile(filePath);
  res.writeHead(200, {
    'content-type': contentType,
    'content-length': body.length,
    'cache-control': 'no-cache',
  });
  res.end(body);
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(json),
    'cache-control': 'no-cache',
  });
  res.end(json);
}

export const DEFAULT_DASHBOARD_DIST = DASHBOARD_DIST_DEFAULT;
export const DEFAULT_PORT = 4711;
export const DEFAULT_ROOT = defaultClaudeProjectsRoot();
