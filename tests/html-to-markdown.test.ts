import { describe, expect, it } from 'vitest';
import { htmlToMarkdown } from '../src/html-to-markdown.js';

describe('htmlToMarkdown', () => {
  describe('headings', () => {
    it('converts h1–h6 to ATX headings', () => {
      for (let level = 1; level <= 6; level++) {
        const hashes = '#'.repeat(level);
        expect(htmlToMarkdown(`<h${level}>Title</h${level}>`)).toBe(`${hashes} Title`);
      }
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

    it('converts <img alt src> to ![alt](src)', () => {
      expect(htmlToMarkdown('<img alt="logo" src="/logo.png" />')).toContain('![logo](/logo.png)');
    });

    it('converts <img src alt> when attribute order is reversed', () => {
      expect(htmlToMarkdown('<img src="/logo.png" alt="logo" />')).toContain('![logo](/logo.png)');
    });

    it('converts <img src> with no alt to ![](src)', () => {
      expect(htmlToMarkdown('<img src="/logo.png" />')).toContain('![](/logo.png)');
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
  });

  describe('block elements', () => {
    it('converts <blockquote> to > prefix', () => {
      expect(htmlToMarkdown('<blockquote>quoted text</blockquote>')).toContain('> quoted text');
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
  });
});
