/**
 * Converts an HTML string to Markdown.
 *
 * Uses regex-based transformations so it is compatible with edge runtimes
 * (Cloudflare Workers, Deno Deploy, etc.) — no DOM or Node.js APIs required.
 */
export function htmlToMarkdown(html: string): string {
  let md = html;

  // ── 1. Strip unwanted block-level elements entirely ──────────────────────
  md = stripElement(md, 'script');
  md = stripElement(md, 'style');
  md = stripElement(md, 'nav');
  md = stripElement(md, 'header');
  md = stripElement(md, 'footer');
  md = stripElement(md, 'aside');
  md = stripElement(md, 'noscript');

  // ── 2. Try to isolate the main content area ───────────────────────────────
  const main = extractMainContent(md);
  if (main) md = main;

  // ── 3. Fenced code blocks BEFORE inline code (order matters) ─────────────
  md = md.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_m, code) => '```\n' + decodeEntities(code) + '\n```\n\n',
  );

  // ── 4. Headings ───────────────────────────────────────────────────────────
  for (let level = 1; level <= 6; level++) {
    const hashes = '#'.repeat(level);
    md = md.replace(
      new RegExp(`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi'),
      (_m, inner) => `\n\n${hashes} ${stripTags(inner).trim()}\n\n`,
    );
  }

  // ── 5. Block elements ─────────────────────────────────────────────────────
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, inner) => `\n\n${inner}\n\n`);
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, inner) => {
    return inner
      .split('\n')
      .map((line: string) => `> ${line}`)
      .join('\n') + '\n\n';
  });
  md = md.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  // ── 6. Lists ──────────────────────────────────────────────────────────────
  // Ordered lists: wrap each <li> with index
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, inner) => {
    let i = 0;
    const items = inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m2: string, item: string) => {
      i++;
      return `${i}. ${stripTags(item).trim()}\n`;
    });
    return '\n' + items + '\n';
  });

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, inner) => {
    const items = inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m2: string, item: string) => {
      return `- ${stripTags(item).trim()}\n`;
    });
    return '\n' + items + '\n';
  });

  // Remaining stray <li> not inside a list wrapper
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner) => `- ${stripTags(inner).trim()}\n`);

  // ── 7. Inline elements ────────────────────────────────────────────────────
  md = md.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  md = md.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
  md = md.replace(/<(?:s|del|strike)[^>]*>([\s\S]*?)<\/(?:s|del|strike)>/gi, '~~$1~~');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_m, inner) => '`' + decodeEntities(inner) + '`');

  // ── 8. Links and images ───────────────────────────────────────────────────
  md = md.replace(
    /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_m, href, text) => `[${stripTags(text).trim()}](${href})`,
  );
  md = md.replace(
    /<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi,
    '![$1]($2)',
  );
  md = md.replace(
    /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    '![$2]($1)',
  );
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // ── 9. Line breaks ────────────────────────────────────────────────────────
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // ── 10. Strip remaining HTML tags ─────────────────────────────────────────
  md = stripTags(md);

  // ── 11. Decode HTML entities ──────────────────────────────────────────────
  md = decodeEntities(md);

  // ── 12. Normalize whitespace ──────────────────────────────────────────────
  md = md
    .replace(/\r\n/g, '\n')      // normalise line endings
    .replace(/\n{3,}/g, '\n\n')  // collapse 3+ blank lines → 2
    .trim();

  return md;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Remove an element and its content entirely. */
function stripElement(html: string, tag: string): string {
  return html.replace(
    new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi'),
    '',
  );
}

/** Remove all HTML tags from a string, leaving only text. */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

/**
 * Try to extract the innermost `<main>`, `<article>`, or `[role="main"]`
 * element. Returns null if none found, in which case the full body is used.
 */
function extractMainContent(html: string): string | null {
  const selectors: RegExp[] = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /role="main"[^>]*>([\s\S]*?)<\/\w+>/i,
    /<body[^>]*>([\s\S]*?)<\/body>/i,
  ];
  for (const re of selectors) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Decode common HTML entities. */
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
}
