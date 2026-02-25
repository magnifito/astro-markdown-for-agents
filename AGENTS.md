# AGENTS.md

Astro integration that automatically serves Markdown to AI agents.

## Setup commands
- Install dependencies: `pnpm install`
- Start dev server (tsc watch): `pnpm dev`
- Build project (tsc): `pnpm build`
- Run tests (vitest): `pnpm test`

## Project Architecture & Conventions
- Written in TypeScript.
- Primary files are in `src/`.
- Uses `vitest` for tests.
- Uses `pnpm` as the package manager.
- The example will be run in a Docker container that includes an Nginx configuration.

## Testing instructions
- Run `pnpm test` to execute the vitest test suite.
- Ensure all tests pass before completing changes.
