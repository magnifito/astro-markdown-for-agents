import { describe, expect, it } from 'vitest';
import { htmlToMarkdown } from '../src/html-to-markdown.ts';

describe('htmlToMarkdown', () => {
  describe('headings', () => {
    it('converts h1–h6 to ATX headings', () => {
      for (let level = 1; level <= 6; level++) {
        const hashes = '#'.repeat(level);
        expect(htmlToMarkdown(`<h${level}>Title</h${level}>`)).toBe(`${hashes} Title`);
      }
    });

    it('preserves inline code inside headings', () => {
      expect(htmlToMarkdown('<h2>Use <code>--flag</code> option</h2>')).toContain('## Use `--flag` option');
    });

    it('preserves bold inside headings', () => {
      expect(htmlToMarkdown('<h3>The <strong>main</strong> idea</h3>')).toContain('### The **main** idea');
    });
  });

  describe('inline formatting', () => {
    it('converts <strong> to **bold**', () => {
      expect(htmlToMarkdown('<p><strong>bold</strong></p>')).toContain('**bold**');
    });

    it('converts <b> to **bold**', () => {
      expect(htmlToMarkdown('<p><b>bold</b></p>')).toContain('**bold**');
    });

    it('converts <em> to *italic*', () => {
      expect(htmlToMarkdown('<p><em>italic</em></p>')).toContain('*italic*');
    });

    it('converts <s> to ~~strikethrough~~', () => {
      expect(htmlToMarkdown('<p><s>struck</s></p>')).toContain('~~struck~~');
    });

    it('converts <code> to `backtick`', () => {
      expect(htmlToMarkdown('<code>snippet</code>')).toContain('`snippet`');
    });
  });

  describe('links and images', () => {
    it('converts <a href> to [text](url)', () => {
      expect(htmlToMarkdown('<a href="https://example.com">click</a>')).toContain(
        '[click](https://example.com)',
      );
    });

    it('converts <a href> with single-quoted attribute', () => {
      expect(htmlToMarkdown("<a href='https://example.com'>click</a>")).toContain(
        '[click](https://example.com)',
      );
    });

    it('converts <img alt src> to ![alt](src)', () => {
      expect(htmlToMarkdown('<img alt="logo" src="/logo.png" />')).toContain('![logo](/logo.png)');
    });

    it('converts <img src alt> when attribute order is reversed', () => {
      expect(htmlToMarkdown('<img src="/logo.png" alt="logo" />')).toContain('![logo](/logo.png)');
    });

    it('converts <img src> with no alt to ![](src)', () => {
      expect(htmlToMarkdown('<img src="/logo.png" />')).toContain('![](/logo.png)');
    });

    it('converts <img> with single-quoted attributes', () => {
      expect(htmlToMarkdown("<img alt='logo' src='/logo.png' />")).toContain('![logo](/logo.png)');
    });
  });

  describe('lists', () => {
    it('converts <ul> to unordered list', () => {
      const result = htmlToMarkdown('<ul><li>Alpha</li><li>Beta</li></ul>');
      expect(result).toContain('- Alpha');
      expect(result).toContain('- Beta');
    });

    it('converts <ol> to ordered list', () => {
      const result = htmlToMarkdown('<ol><li>First</li><li>Second</li></ol>');
      expect(result).toContain('1. First');
      expect(result).toContain('2. Second');
    });
  });

  describe('code blocks', () => {
    it('converts <pre><code> to fenced code block', () => {
      const result = htmlToMarkdown('<pre><code>const x = 1;</code></pre>');
      expect(result).toContain('```');
      expect(result).toContain('const x = 1;');
    });

    it('converts bare <pre> (no <code>) to fenced code block', () => {
      const result = htmlToMarkdown('<pre>  line1\n  line2</pre>');
      expect(result).toContain('```');
      expect(result).toContain('line1');
      expect(result).toContain('line2');
    });

    it('preserves HTML-encoded angle brackets inside code blocks', () => {
      const result = htmlToMarkdown('<pre><code>&lt;div class="foo"&gt;\n  &lt;p&gt;Hello&lt;/p&gt;\n&lt;/div&gt;</code></pre>');
      expect(result).toContain('<div class="foo">');
      expect(result).toContain('<p>Hello</p>');
    });

    it('preserves HTML-encoded angle brackets inside inline code', () => {
      expect(htmlToMarkdown('<p>Use <code>&lt;span&gt;</code> here</p>')).toContain('`<span>`');
    });
  });

  describe('tables', () => {
    it('converts a simple table with thead/tbody to Markdown', () => {
      const result = htmlToMarkdown(
        '<table><thead><tr><th>Name</th><th>Age</th></tr></thead>' +
        '<tbody><tr><td>Alice</td><td>30</td></tr><tr><td>Bob</td><td>25</td></tr></tbody></table>',
      );
      expect(result).toContain('| Name | Age |');
      expect(result).toContain('| --- | --- |');
      expect(result).toContain('| Alice | 30 |');
      expect(result).toContain('| Bob | 25 |');
    });

    it('converts a table without thead (all rows treated as body)', () => {
      const result = htmlToMarkdown(
        '<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>',
      );
      expect(result).toContain('| A | B |');
      expect(result).toContain('| --- | --- |');
      expect(result).toContain('| C | D |');
    });

    it('escapes pipe characters inside table cells', () => {
      const result = htmlToMarkdown('<table><tr><td>a | b</td></tr></table>');
      expect(result).toContain('a \\| b');
    });
  });

  describe('definition lists', () => {
    it('converts <dl>/<dt>/<dd> to bold term + colon definition', () => {
      const result = htmlToMarkdown('<dl><dt>Term</dt><dd>Definition</dd></dl>');
      expect(result).toContain('**Term**');
      expect(result).toContain(': Definition');
    });
  });

  describe('block elements', () => {
    it('converts <blockquote> to > prefix', () => {
      expect(htmlToMarkdown('<blockquote>quoted text</blockquote>')).toContain('> quoted text');
    });

    it('converts <blockquote><p> so quoted text is actually prefixed with >', () => {
      const result = htmlToMarkdown('<blockquote><p>quoted text</p></blockquote>');
      expect(result).toContain('> quoted text');
    });

    it('converts <hr> to ---', () => {
      expect(htmlToMarkdown('<hr />')).toContain('---');
    });

    it('converts <br> to newline', () => {
      expect(htmlToMarkdown('line1<br />line2')).toContain('line1\nline2');
    });
  });

  describe('HTML entity decoding', () => {
    it('decodes &amp;', () => {
      expect(htmlToMarkdown('<p>a &amp; b</p>')).toContain('a & b');
    });

    it('decodes &lt; and &gt;', () => {
      expect(htmlToMarkdown('<p>&lt;tag&gt;</p>')).toContain('<tag>');
    });

    it('decodes &quot;', () => {
      expect(htmlToMarkdown('<p>&quot;quoted&quot;</p>')).toContain('"quoted"');
    });

    it('decodes &nbsp;', () => {
      expect(htmlToMarkdown('<p>a&nbsp;b</p>')).toContain('a b');
    });

    it('decodes numeric entities', () => {
      expect(htmlToMarkdown('&#65;')).toBe('A');
    });
  });

  describe('noise removal', () => {
    it('strips <script> blocks entirely', () => {
      const result = htmlToMarkdown('<script>alert("xss")</script><p>content</p>');
      expect(result).not.toContain('alert');
      expect(result).toContain('content');
    });

    it('strips <style> blocks entirely', () => {
      const result = htmlToMarkdown('<style>body{color:red}</style><p>content</p>');
      expect(result).not.toContain('color');
      expect(result).toContain('content');
    });

    it('strips <nav>, <header>, <footer>, <aside>', () => {
      const result = htmlToMarkdown(
        '<nav>menu</nav><header>hdr</header><main><p>main content</p></main><footer>ftr</footer><aside>sidebar</aside>',
      );
      expect(result).not.toContain('menu');
      expect(result).not.toContain('hdr');
      expect(result).not.toContain('ftr');
      expect(result).not.toContain('sidebar');
      expect(result).toContain('main content');
    });

    it('collapses excessive blank lines', () => {
      const result = htmlToMarkdown('<p>a</p><p>b</p><p>c</p>');
      expect(result).not.toMatch(/\n{3,}/);
    });
  });

  describe('main content extraction', () => {
    it('preserves <header> inside <article> (post title pattern)', () => {
      const result = htmlToMarkdown(
        '<body><header>site header</header><article><header><h1>Post Title</h1></header><p>body</p></article></body>',
      );
      expect(result).toContain('# Post Title');
      expect(result).toContain('body');
    });

    it('prefers <main> over surrounding noise', () => {
      const result = htmlToMarkdown(
        '<body><nav>nav</nav><main><h1>Article</h1><p>Body text.</p></main></body>',
      );
      expect(result).toContain('# Article');
      expect(result).toContain('Body text.');
    });

    it('falls back to <article> if no <main>', () => {
      const result = htmlToMarkdown('<article><h2>Post</h2></article>');
      expect(result).toContain('## Post');
    });

    it('concatenates multiple <article> elements', () => {
      const result = htmlToMarkdown(
        '<article><h2>First</h2></article><article><h2>Second</h2></article>',
      );
      expect(result).toContain('## First');
      expect(result).toContain('## Second');
    });

    it('uses role="main" element when no <main> or <article>', () => {
      const result = htmlToMarkdown('<div role="main"><p>main content</p></div>');
      expect(result).toContain('main content');
    });
  });
});
