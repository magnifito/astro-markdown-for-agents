import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'index.ts',
    middleware: 'src/middleware.ts',
    'html-to-markdown': 'src/html-to-markdown.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'node20',
  sourcemap: true,
  external: ['astro'],
});
