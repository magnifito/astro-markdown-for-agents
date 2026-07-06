// Regexes hoisted so they are compiled once, not per htmlToMarkdown call.
const HEADING_RE: RegExp[] = Array.from(
  { length: 7 },
  (_, level) => new RegExp(`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi'),
);

// Inline formatting patterns shared between the main pipeline and inlineToMarkdown.
const INLINE_CODE_RE = /<code[^>]*>([\s\S]*?)<\/code>/gi;
const BOLD_RE = /<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi;
const ITALIC_RE = /<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi;
const STRIKE_RE = /<(?:s|del|strike)[^>]*>([\s\S]*?)<\/(?:s|del|strike)>/gi;
const LINK_RE = /<a[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;

/**
 * Converts an HTML string to Markdown.
 *
 * Uses regex-based transformations so it is compatible with edge runtimes
 * (Cloudflare Workers, Deno Deploy, etc.) — no DOM or Node.js APIs required.
 */
export function htmlToMarkdown(html: string): string {
  let md = html;

  // ── 1. Strip safe noise elements (never carry content) ───────────────────
  md = stripElement(md, 'script');
  md = stripElement(md, 'style');
  md = stripElement(md, 'nav');
  md = stripElement(md, 'noscript');

  // ── 2. Extract main content region ───────────────────────────────────────
  // Done BEFORE stripping <header>/<footer> so that a <header><h1>Post Title
  // </h1></header> inside <article> or <main> is preserved. The extraction
  // pulls only the inner region; page-level wrappers are excluded automatically
  // when the source has <main> or <article>. For the <body> fallback we strip
  // them afterwards.
  const { content: main, needsChromStrip } = extractMainContent(md);
  if (main) md = main;

  // ── 3a. Strip layout chrome ───────────────────────────────────────────────
  // <main>/<article> extraction already excludes page-level wrappers, so only
  // strip <header>/<footer> when we fell back to <body> (they're still inside).
  md = stripElement(md, 'aside');
  if (needsChromStrip) {
    md = stripElement(md, 'header');
    md = stripElement(md, 'footer');
  }

  // ── 3. Fenced code blocks BEFORE inline code (order matters) ─────────────
  // Do NOT decode entities here — keep &lt;/&gt; encoded so that step 10
  // (stripTags) cannot mistake decoded angle brackets for HTML tags and delete
  // them. Step 11 (decodeEntities) will restore them in the final output.
  md = md.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_m, code) => '```\n' + stripTags(code) + '\n```\n\n',
  );
  // <pre> without <code> (e.g. ASCII art, terminal output)
  md = md.replace(
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    (_m, inner) => '```\n' + stripTags(inner) + '\n```\n\n',
  );

  // ── 4. Headings ───────────────────────────────────────────────────────────
  for (let level = 1; level <= 6; level++) {
    md = md.replace(
      HEADING_RE[level],
      (_m, inner) => `\n\n${'#'.repeat(level)} ${inlineToMarkdown(inner).trim()}\n\n`,
    );
  }

  // ── 5. Block elements ─────────────────────────────────────────────────────
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, inner) => `\n\n${inner}\n\n`);
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, inner) => {
    // Strip inner block wrappers (<p>, <div>, etc.) so their text content
    // lands on the correct lines — otherwise "> <p>text</p>" splits into
    // "> " on one line and "text" unquoted on the next.
    const text = inlineToMarkdown(inner
      .replace(/<\/?(p|div|section)[^>]*>/gi, '\n'));
    return text
      .split('\n')
      .filter((line: string) => line.trim() !== '')
      .map((line: string) => `> ${line}`)
      .join('\n') + '\n\n';
  });
  md = md.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  // ── 6. Lists ──────────────────────────────────────────────────────────────
  // Ordered lists: wrap each <li> with index
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, inner) => {
    const items: string[] = [];
    const itemRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let item: RegExpExecArray | null;
    while ((item = itemRe.exec(inner)) !== null) {
      items.push(`${items.length + 1}. ${inlineToMarkdown(item[1]).trim()}`);
    }
    return '\n' + items.join('\n') + '\n';
  });

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, inner) => {
    const items: string[] = [];
    const itemRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let item: RegExpExecArray | null;
    while ((item = itemRe.exec(inner)) !== null) {
      items.push(`- ${inlineToMarkdown(item[1]).trim()}`);
    }
    return '\n' + items.join('\n') + '\n';
  });

  // Remaining stray <li> not inside a list wrapper
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner) => `- ${inlineToMarkdown(inner).trim()}\n`);

  // ── 6b. Definition lists ───────────────────────────────────────────────────
  md = md.replace(/<dt[^>]*>([\s\S]*?)<\/dt>/gi, (_m, inner) => `\n**${inlineToMarkdown(inner).trim()}**\n`);
  md = md.replace(/<dd[^>]*>([\s\S]*?)<\/dd>/gi, (_m, inner) => `: ${inlineToMarkdown(inner).trim()}\n`);
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
        headerRow.push(inlineToMarkdown(th[1]).trim());
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
        cells.push(inlineToMarkdown(td[1]).trim());
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
  md = md.replace(BOLD_RE, '**$1**');
  md = md.replace(ITALIC_RE, '*$1*');
  md = md.replace(STRIKE_RE, '~~$1~~');
  // Keep entities encoded — step 11 decodes everything uniformly at the end.
  md = md.replace(INLINE_CODE_RE, (_m, inner) => '`' + inner + '`');

  // ── 8. Links and images ───────────────────────────────────────────────────
  // Use a capture group for the quote character so both " and ' are matched.
  md = md.replace(
    LINK_RE,
    (_m, _q, href, text) => `[${stripTags(text).trim()}](${href})`,
  );
  md = md.replace(
    /<img[^>]*alt=(["'])(.*?)\1[^>]*src=(["'])(.*?)\3[^>]*\/?>/gi,
    (_m, _q1, alt, _q2, src) => `![${alt}](${src})`,
  );
  md = md.replace(
    /<img[^>]*src=(["'])(.*?)\1[^>]*alt=(["'])(.*?)\3[^>]*\/?>/gi,
    (_m, _q1, src, _q2, alt) => `![${alt}](${src})`,
  );
  md = md.replace(/<img[^>]*src=(["'])(.*?)\1[^>]*\/?>/gi, (_m, _q, src) => `![](${src})`);

  // ── 9. Line breaks ────────────────────────────────────────────────────────
  md = md.replace(/<br\b[^>]*\/?>/gi, '\n');
  // Preserve boundaries between block-level containers before stripping tags.
  md = md.replace(
    /<\/?(?:address|article|details|dialog|div|fieldset|figcaption|figure|header|hgroup|main|section|summary)[^>]*>/gi,
    '\n',
  );

  // ── 10. Strip remaining HTML tags ─────────────────────────────────────────
  md = stripTags(md);

  // ── 11. Decode HTML entities ──────────────────────────────────────────────
  md = decodeEntities(md);

  // ── 12. Normalize whitespace ──────────────────────────────────────────────
  md = normalizeWhitespace(md);

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
  // Keep entities encoded inside code spans so that step 10 (stripTags) cannot
  // mistake decoded angle brackets for HTML tags. Step 11 decodes everything.
  s = s.replace(INLINE_CODE_RE, (_m, inner) => '`' + inner + '`');
  s = s.replace(BOLD_RE, '**$1**');
  s = s.replace(ITALIC_RE, '*$1*');
  s = s.replace(STRIKE_RE, '~~$1~~');
  s = s.replace(LINK_RE, (_m, _q, href, text) => `[${stripTags(text).trim()}](${href})`);
  s = s.replace(/<br\b[^>]*\/?>/gi, ' ');
  return stripTags(s);
}

/**
 * Remove indentation inherited from formatted HTML while preserving leading
 * whitespace inside fenced code blocks.
 */
function normalizeWhitespace(markdown: string): string {
  let inFence = false;
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');

  const normalized = lines.map((line) => {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      return line.trim();
    }
    if (inFence) return line.replace(/[ \t]+$/g, '');
    return line.trim();
  });

  return normalized
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Try to extract the main content area from the page.
 *
 * Priority: <main> → <article>(s) → role="main" → <body>
 * Multiple <article> elements are concatenated so none are dropped.
 *
 * Returns `{ content, needsChromStrip }` where `needsChromStrip` is true only
 * when the <body> fallback was used — the caller must then strip <header> and
 * <footer> from the result because they're inside <body> but were not excluded
 * by the extraction (unlike <main>/<article> which already exclude them).
 */
function extractMainContent(html: string): { content: string | null; needsChromStrip: boolean } {
  // <main> — take the first one
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) return { content: mainMatch[1], needsChromStrip: false };

  // <article> — collect ALL and concatenate
  const articleRe = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  const articles: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = articleRe.exec(html)) !== null) {
    articles.push(m[1]);
  }
  if (articles.length > 0) return { content: articles.join('\n\n'), needsChromStrip: false };

  // role="main" — match the opening tag that carries the attribute, then
  // capture until the corresponding closing tag (greedy on the tag name)
  const roleMatch = html.match(/<(\w+)[^>]*\brole="main"[^>]*>([\s\S]*?)<\/\1>/i);
  if (roleMatch) return { content: roleMatch[2], needsChromStrip: false };

  // <body> fallback — still contains <header>/<footer> wrappers
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return { content: bodyMatch[1], needsChromStrip: true };

  return { content: null, needsChromStrip: false };
}

/** Decode common HTML entities. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", nbsp: ' ',
};

function decodeEntities(str: string): string {
  return str.replace(/&(#x[0-9a-f]+|#\d+|[a-z#0-9]+);/gi, (_m, entity: string) => {
    if (entity in NAMED_ENTITIES) return NAMED_ENTITIES[entity];
    if (entity.startsWith('#x') || entity.startsWith('#X'))
      return String.fromCharCode(parseInt(entity.slice(2), 16));
    if (entity.startsWith('#'))
      return String.fromCharCode(Number(entity.slice(1)));
    return _m; // unknown entity — leave as-is
  });
}
