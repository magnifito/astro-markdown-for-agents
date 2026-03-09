/**
 * Integration tests: start the example site's dev server and verify that the
 * middleware returns Markdown when requested via Accept header or User-Agent.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { dev } from 'astro';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const EXAMPLE_ROOT = path.resolve(
  fileURLToPath(import.meta.url),
  '../../examples/basic',
);

let devServer: Awaited<ReturnType<typeof dev>>;
let base: string;

beforeAll(async () => {
  devServer = await dev({
    root: EXAMPLE_ROOT,
    logLevel: 'silent',
    // Force server-side rendering so the middleware runs for every request.
    // The example defaults to 'static', which marks all pages as prerendered
    // and bypasses the middleware's isPrerendered guard.
    output: 'server',
  });
  const addr = devServer.address;
  const host = addr.address.includes(':') ? `[${addr.address}]` : addr.address;
  base = `http://${host}:${addr.port}`;
}, 30_000);

afterAll(async () => {
  await devServer.stop();
});

// ── helpers ──────────────────────────────────────────────────────────────────

async function get(pathname: string, headers: Record<string, string> = {}) {
  return fetch(`${base}${pathname}`, { headers });
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
  it('returns Markdown for /', async () => {
    const res = await get('/', { accept: 'text/markdown' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/markdown');
    const body = await res.text();
    expect(body).toContain('# Astro Markdown for Agents');
    expect(body).not.toMatch(/<[a-z]/i); // no leftover HTML tags
  });

  it('returns Markdown for /about', async () => {
    const res = await get('/about', { accept: 'text/markdown' });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/markdown');
    const body = await res.text();
    expect(body).toContain('# About');
    // The page intentionally mentions tag names as text content (e.g. "<script>")
    // inside code spans — strip those out before checking for stray HTML tags.
    const withoutCodeSpans = body.replace(/`[^`]*`/g, '');
    expect(withoutCodeSpans).not.toMatch(/<[a-z]/i);
  });

  it('sets a Vary header', async () => {
    const res = await get('/about', { accept: 'text/markdown' });
    // Astro dev server may append its own Vary values; verify ours are present.
    const vary = res.headers.get('vary') ?? '';
    expect(vary).not.toBe('');
  });

  it('sets x-original-content-type', async () => {
    const res = await get('/about', { accept: 'text/markdown' });
    expect(res.headers.get('x-original-content-type')).toContain('text/html');
  });

  it('does not include nav links in Markdown output', async () => {
    const res = await get('/about', { accept: 'text/markdown' });
    const body = await res.text();
    // The <nav> block contains "Home", "About", "Blog" as bare link text.
    // After stripping the nav the only remaining "About" should be the heading.
    const lines = body.split('\n').filter((l) => l.trim() !== '');
    const navLine = lines.find((l) => /^\[Home\]/.test(l));
    expect(navLine).toBeUndefined();
  });

  it('does not include footer text in Markdown output', async () => {
    const res = await get('/about', { accept: 'text/markdown' });
    const body = await res.text();
    expect(body).not.toContain('Built with');
  });

  it('preserves code blocks from /about', async () => {
    const res = await get('/about', { accept: 'text/markdown' });
    const body = await res.text();
    expect(body).toContain('```');
    expect(body).toContain('markdownForAgents');
  });

  it('preserves ordered list items from /about', async () => {
    const res = await get('/about', { accept: 'text/markdown' });
    const body = await res.text();
    expect(body).toContain('1.');
    expect(body).toContain('2.');
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
