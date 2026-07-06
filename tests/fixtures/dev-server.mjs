import { dev } from 'astro';

const root = process.argv[2];

if (!root) {
  throw new Error('Expected Astro project root as first argument');
}

const server = await dev({
  root,
  logLevel: 'silent',
  server: {
    host: '127.0.0.1',
    port: 0,
  },
});

process.send?.({
  type: 'ready',
  address: server.address,
});

async function shutdown() {
  await server.stop();
  process.exit(0);
}

process.on('message', (message) => {
  if (message?.type === 'shutdown') {
    void shutdown();
  }
});

process.on('SIGTERM', () => {
  void shutdown();
});
