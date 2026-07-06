/**
 * Integration tests: start the example site's dev server and verify that the
 * middleware returns Markdown when requested via Accept header or User-Agent.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fork, type ChildProcess } from 'node:child_process';
import { request } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const EXAMPLE_ROOT = path.resolve(
  fileURLToPath(import.meta.url),
  '../../examples/basic',
);

let devServer: ChildProcess;
let base: string;

beforeAll(async () => {
  const helper = fileURLToPath(new URL('./fixtures/dev-server.mjs', import.meta.url));
  const env = {
    ...process.env,
    NODE_ENV: 'development',
  };
  for (const key of Object.keys(env)) {
    if (key.startsWith('VITEST') || key === 'TEST') {
      delete env[key];
    }
  }

  devServer = fork(helper, [EXAMPLE_ROOT], {
    cwd: EXAMPLE_ROOT,
    env,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });

  const errors: string[] = [];
  devServer.stderr?.on('data', (chunk) => errors.push(String(chunk)));

  const addr = await new Promise<{ address: string; port: number }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Astro dev server did not start: ${errors.join('')}`));
    }, 20_000);

    devServer.once('error', reject);
    devServer.on('message', (message) => {
      if (
        typeof message === 'object'
        && message !== null
        && 'type' in message
        && message.type === 'ready'
        && 'address' in message
      ) {
        clearTimeout(timeout);
        resolve(message.address as { address: string; port: number });
      }
    });
  });

  const host = addr.address.includes(':') ? `[${addr.address}]` : addr.address;
  base = `http://${host}:${addr.port}`;
}, 30_000);

afterAll(async () => {
  if (!devServer?.connected) return;
  await new Promise<void>((resolve) => {
    devServer.once('exit', () => resolve());
    devServer.send({ type: 'shutdown' });
  });
});

// ── helpers ──────────────────────────────────────────────────────────────────

async function get(pathname: string, headers: Record<string, string> = {}) {
  return new Promise<Response>((resolve, reject) => {
    const req = request(`${base}${pathname}`, { headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      res.on('end', () => {
        resolve(new Response(Buffer.concat(chunks), {
          status: res.statusCode,
          headers: res.headers as HeadersInit,
        }));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── tests ─────────────────────────────────────────────────────────────────────

describe('normal browser request', () => {
  it('returns HTML for /', async () => {
    const res = await get('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });

  it('returns HTML for /about', async () => {
    const res = await get('/about');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });
});

describe('Accept: text/markdown', () => {
  // Fetch shared responses once for all /about assertions.
  let rootRes: Response, aboutRes: Response;
  let rootBody: string, aboutBody: string;

  beforeAll(async () => {
    [rootRes, aboutRes] = await Promise.all([
      get('/', { accept: 'text/markdown' }),
      get('/about', { accept: 'text/markdown' }),
    ]);
    [rootBody, aboutBody] = await Promise.all([rootRes.text(), aboutRes.text()]);
  });

  it('returns Markdown for /', () => {
    expect(rootRes.status).toBe(200);
    expect(rootRes.headers.get('content-type')).toContain('text/markdown');
    expect(rootBody).toContain('# Astro Markdown for Agents');
    expect(rootBody).not.toMatch(/<[a-z]/i); // no leftover HTML tags
  });

  it('returns Markdown for /about', () => {
    expect(aboutRes.status).toBe(200);
    expect(aboutRes.headers.get('content-type')).toContain('text/markdown');
    expect(aboutBody).toContain('# About');
    // The page intentionally mentions tag names as text content (e.g. "<script>")
    // inside code spans — strip those out before checking for stray HTML tags.
    const withoutCodeSpans = aboutBody.replace(/`[^`]*`/g, '');
    expect(withoutCodeSpans).not.toMatch(/<[a-z]/i);
  });

  it('sets a Vary header', () => {
    // Astro dev server may append its own Vary values; verify ours are present.
    expect(aboutRes.headers.get('vary') ?? '').not.toBe('');
  });

  it('sets x-original-content-type', () => {
    expect(aboutRes.headers.get('x-original-content-type')).toContain('text/html');
  });

  it('does not include nav links in Markdown output', () => {
    const lines = aboutBody.split('\n').filter((l) => l.trim() !== '');
    expect(lines.find((l) => /^\[Home\]/.test(l))).toBeUndefined();
  });

  it('does not include footer text in Markdown output', () => {
    expect(aboutBody).not.toContain('Built with');
  });

  it('preserves code blocks from /about', () => {
    expect(aboutBody).toContain('```');
    expect(aboutBody).toContain('markdownForAgents');
  });

  it('preserves ordered list items from /about', () => {
    expect(aboutBody).toContain('1.');
    expect(aboutBody).toContain('2.');
  });
});

describe('User-Agent: GPTBot', () => {
  it('returns Markdown for / when UA is GPTBot', async () => {
    const res = await get('/', { 'user-agent': 'Mozilla/5.0 (compatible; GPTBot/1.1)' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/markdown');
  });

  it('returns Markdown for /about when UA is ClaudeBot', async () => {
    const res = await get('/about', { 'user-agent': 'ClaudeBot/1.0' });
    expect(res.headers.get('content-type')).toContain('text/markdown');
  });
});

describe('non-HTML resources are passed through unchanged', () => {
  it('serves a static CSS file as text/css even with Accept: text/markdown', async () => {
    const res = await get('/style.css', { accept: 'text/markdown' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/css');
    const body = await res.text();
    expect(body).toContain('margin');
  });
});
