# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Life-map-bot is a Telegram bot application with three apps in a Turborepo monorepo:

- **apps/bot** — Telegram bot (Grammy)
- **apps/api** — Backend API (Hono + SQLite via Drizzle ORM)
- **apps/web** — Telegram Web App frontend (Vue 3 + Vite + Tailwind CSS 4)
- **packages/shared** — Shared types and utilities (date-fns, zod)

## Commands

Package manager: **pnpm** (v9.0.0). Node >= 18.

```bash
# Development (all apps concurrently)
pnpm dev

# Build all
pnpm build

# Type checking
pnpm check-types

# Format
pnpm format

# Lint
pnpm lint

# Run a single app
pnpm --filter api dev
pnpm --filter bot dev
pnpm --filter web dev

# Drizzle ORM (from apps/api)
pnpm --filter api drizzle-kit generate
pnpm --filter api drizzle-kit migrate
```

## Architecture

### apps/api

Hono HTTP server on port 3000 with `@hono/node-server`. Uses `better-sqlite3` + `drizzle-orm` for database. Validation with `zod`. Dev runs via `tsx watch`.

### apps/bot

Grammy-based Telegram bot with `node-cron` for scheduled tasks. Dev runs via `tsx watch`.

### apps/web

Vue 3 SPA built with Vite. Uses `@telegram-apps/sdk` for Telegram Web App integration. Styling with Tailwind CSS 4 (via `@tailwindcss/vite` plugin). TypeScript strict mode with `vue-tsc` for type checking.

### packages/shared

Shared between apps. Exports date-fns utilities and zod schemas.

## Testing

Framework: **Vitest** (configured in apps/api and packages/shared).

```bash
# Run all tests
pnpm --filter api test
pnpm --filter shared test

# Run single file
pnpm --filter api vitest run src/__tests__/share.test.ts

# Run via turbo (CI)
pnpm turbo run test
```

### Conventions

- **Location**: `src/__tests__/*.test.ts` (co-located with source package)
- **Imports**: Always explicit (`import { describe, it, expect } from 'vitest'`), not globals
- **Naming**: `describe('<module or route>')` → `it('should <expected behavior>')`
- **Pattern**: AAA (Arrange → Act → Assert), one assertion concern per test
- **Isolation**: Every test must be independent. For modules with shared state (Maps, stores), export a `resetX()` function and call it in `beforeEach`
- **Mocking**: Only mock external dependencies (network, DB). Never mock internal modules
- **Hono routes**: Test via `app.request()` (built-in, no supertest needed). Inject auth context through middleware in test setup
- **Types**: Use `type` (not `interface`), arrow functions. Match project code style in tests too
- **Config**: `restoreMocks: true` in vitest.config.ts — mocks auto-restore between tests

### Reference test

See `apps/api/src/__tests__/share.test.ts` — demonstrates route testing with auth mock, state isolation, rate limiting, and file validation.

## Key Tech Choices

- TypeScript strict mode across all packages
- ESM modules throughout (module: NodeNext in API/bot, ESNext in web)
- Turborepo handles build orchestration with `^build` dependency chain
