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
  // <pre> without <code> (e.g. ASCII art, terminal output)
  md = md.replace(
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    (_m, inner) => '```\n' + decodeEntities(stripTags(inner)) + '\n```\n\n',
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
      return `${i}. ${inlineToMarkdown(item).trim()}\n`;
    });
    return '\n' + items + '\n';
  });

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, inner) => {
    const items = inner.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m2: string, item: string) => {
      return `- ${inlineToMarkdown(item).trim()}\n`;
    });
    return '\n' + items + '\n';
  });

  // Remaining stray <li> not inside a list wrapper
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner) => `- ${inlineToMarkdown(inner).trim()}\n`);

  // ── 6b. Definition lists ───────────────────────────────────────────────────
  md = md.replace(/<dt[^>]*>([\s\S]*?)<\/dt>/gi, (_m, inner) => `\n**${stripTags(inner).trim()}**\n`);
  md = md.replace(/<dd[^>]*>([\s\S]*?)<\/dd>/gi, (_m, inner) => `: ${stripTags(inner).trim()}\n`);
  md = md.replace(/<\/?dl[^>]*>/gi, '\n');

  // ── 6c. Tables ────────────────────────────────────────────────────────────
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_m, inner) => {
    const rows: string[][] = [];

    // Collect header cells
    const theadMatch = inner.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
    if (theadMatch) {
      const headerRow: string[] = [];
      const thRe = /<th[^>]*>([\s\S]*?)<\/th>/gi;
      let th: RegExpExecArray | null;
      while ((th = thRe.exec(theadMatch[1])) !== null) {
        headerRow.push(stripTags(decodeEntities(th[1])).trim());
      }
      if (headerRow.length > 0) rows.push(headerRow);
    }

    // Collect body rows
    const tbodyContent = inner.replace(/<thead[^>]*>[\s\S]*?<\/thead>/gi, '');
    const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let tr: RegExpExecArray | null;
    while ((tr = trRe.exec(tbodyContent)) !== null) {
      const cells: string[] = [];
      const tdRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let td: RegExpExecArray | null;
      while ((td = tdRe.exec(tr[1])) !== null) {
        cells.push(stripTags(decodeEntities(td[1])).trim());
      }
      if (cells.length > 0) rows.push(cells);
    }

    if (rows.length === 0) return '';

    const colCount = Math.max(...rows.map((r) => r.length));
    const pad = (row: string[]) =>
      '| ' + row.map((c) => c.replace(/\|/g, '\\|')).concat(Array(colCount - row.length).fill('')).join(' | ') + ' |';

    const lines: string[] = [];
    lines.push(pad(rows[0]));
    lines.push('| ' + Array(colCount).fill('---').join(' | ') + ' |');
    for (let i = 1; i < rows.length; i++) lines.push(pad(rows[i]));
    return '\n\n' + lines.join('\n') + '\n\n';
  });

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
    new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, 'gi'),
    '',
  );
}

/** Remove all HTML tags from a string, leaving only text. */
function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

/**
 * Apply inline Markdown conversions (bold, italic, code, links) to a fragment,
 * then strip any remaining tags. Used for list item and heading content so that
 * inline formatting is preserved rather than discarded.
 *
 * Backtick spans are protected from the final stripTags pass by temporarily
 * encoding their angle brackets so they aren't mistaken for HTML tags.
 */
function inlineToMarkdown(html: string): string {
  let s = html;
  // Code spans: decode entities inside, then protect content from stripTags
  // by replacing < and > with their entity forms after conversion.
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_m, inner) => {
    const decoded = decodeEntities(inner).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '`' + decoded + '`';
  });
  s = s.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  s = s.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
  s = s.replace(/<(?:s|del|strike)[^>]*>([\s\S]*?)<\/(?:s|del|strike)>/gi, '~~$1~~');
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, text) => `[${stripTags(text).trim()}](${href})`);
  s = s.replace(/<br\s*\/?>/gi, ' ');
  s = stripTags(s);
  // Restore entity-encoded angle brackets inside backtick spans
  return decodeEntities(s);
}

/**
 * Try to extract the main content area from the page.
 *
 * Priority: <main> → <article>(s) → role="main" → <body>
 * Multiple <article> elements are concatenated so none are dropped.
 * Returns null if none found, in which case the full HTML is used.
 */
function extractMainContent(html: string): string | null {
  // <main> — take the first one
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) return mainMatch[1];

  // <article> — collect ALL and concatenate
  const articleRe = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  const articles: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = articleRe.exec(html)) !== null) {
    articles.push(m[1]);
  }
  if (articles.length > 0) return articles.join('\n\n');

  // role="main" — match the opening tag that carries the attribute, then
  // capture until the corresponding closing tag (greedy on the tag name)
  const roleMatch = html.match(/<(\w+)[^>]*\brole="main"[^>]*>([\s\S]*?)<\/\1>/i);
  if (roleMatch) return roleMatch[2];

  // <body> fallback
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return bodyMatch[1];

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
