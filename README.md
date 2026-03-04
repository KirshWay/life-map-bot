# 🗓 Life Map

![CI](https://github.com/KirshWay/life-map-bot/actions/workflows/deploy.yml/badge.svg)
![Version](https://img.shields.io/github/v/tag/KirshWay/life-map-bot?label=version)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-22-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

> _Telegram Mini App that visualizes your life as a grid of weeks — inspired by "Your Life in Weeks" by Tim Urban (Wait But Why)_

## Overview

Life Map turns your entire lifespan into a visual grid of 4,160 weeks (80 years). Each filled cell is a week you've already lived; the pulsing cell is your current week; the empty cells are what's ahead. The app runs inside Telegram as a Mini App, with a bot that collects your birth date and sends weekly motivation reminders.

## Features

- Week grid visualization (80 years x 52 weeks per year)
- Telegram bot onboarding with birthday collection
- Weekly motivation notifications via cron (Monday 9:00 UTC)
- Dark/light theme synced from Telegram client
- Telegram initData validation (HMAC-SHA256)
- Dockerized deployment with GitHub Actions CI/CD

## Architecture

```
life-map-bot/
├── apps/
│   ├── api/     — Hono REST API + SQLite (Drizzle ORM)
│   ├── bot/     — Grammy Telegram bot
│   └── web/     — Vue 3 SPA (Telegram Mini App)
├── packages/
│   └── shared/  — Zod schemas, week calculation utils
└── docker/      — Dockerfiles per service
```

All three apps share a single TypeScript monorepo managed by Turborepo. The bot communicates with the API over HTTP using a shared secret. The web app authenticates via Telegram initData passed to the API.

## Tech Stack

| Layer    | Technology                                |
| -------- | ----------------------------------------- |
| Frontend | Vue 3, Tailwind CSS 4, @telegram-apps/sdk |
| API      | Hono, Drizzle ORM, better-sqlite3         |
| Bot      | grammY, node-cron                         |
| Shared   | Zod, date-fns, TypeScript                 |
| Infra    | Docker, GitHub Actions, Docker Swarm      |
| Tooling  | pnpm, Turborepo, Vitest, ESLint, Prettier |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- Telegram bot token from [@BotFather](https://t.me/BotFather)
- [ngrok](https://ngrok.com/) (or similar tunnel) for HTTPS during local development

### Installation

```bash
git clone https://github.com/KirshWay/life-map-bot.git
cd life-map-bot
pnpm install
```

### Configuration

Copy `.env.example` into each app that needs it and fill in the values:

```bash
cp .env.example apps/api/.env
cp .env.example apps/bot/.env
```

Key variables: `BOT_TOKEN`, `API_SECRET`, `WEB_APP_URL`. See [.env.example](.env.example) for the full list.

### Development

```bash
pnpm dev
```

This starts all three apps concurrently via Turborepo. The web app proxies `/api` requests to the API server automatically.

For Telegram to reach your local Mini App, expose the web dev server over HTTPS:

```bash
ngrok http 5173
```

Set `WEB_APP_URL` in `apps/bot/.env` to the ngrok HTTPS URL.

## Deployment

The project deploys via Docker Swarm using a GitHub Actions workflow. On push to `main`:

1. **Test** -- type-check and run all tests
2. **Build** -- build Docker images for api, bot, and web (parallel)
3. **Deploy** -- push images to ghcr.io and deploy the stack via SSH

See [.github/workflows/deploy.yml](.github/workflows/deploy.yml) and [docker-compose.yml](docker-compose.yml) for details.

### Required GitHub Secrets

`BOT_TOKEN`, `API_SECRET`, `WEB_APP_URL`, `API_URL`, `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`

## Project Structure

```
life-map-bot/
├── .github/workflows/
│   └── deploy.yml               — CI/CD pipeline
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── db/              — Drizzle schema and connection
│   │   │   ├── middleware/      — Auth, Telegram validation, error handler
│   │   │   ├── routes/          — health, me, users endpoints
│   │   │   ├── __tests__/       — Vitest tests
│   │   │   ├── index.ts         — Server entrypoint
│   │   │   └── migrate.ts       — Programmatic migration runner
│   │   └── drizzle/             — Generated SQL migrations
│   ├── bot/
│   │   └── src/
│   │       ├── commands/        — /start command
│   │       ├── handlers/        — Birth date text handler
│   │       ├── services/        — API client, weekly scheduler
│   │       ├── bot.ts           — Bot factory with session
│   │       └── index.ts         — Entrypoint
│   └── web/
│       └── src/
│           ├── components/      — WeekGrid, WeekCell
│           ├── composables/     — useTelegram, useLifeMap
│           ├── services/        — API client
│           ├── types.ts         — WeekStatus const enum
│           ├── App.vue          — Root component
│           └── main.ts          — Vue app bootstrap
├── packages/
│   └── shared/
│       └── src/
│           ├── schemas/         — Zod user schemas
│           └── utils/           — Week calculation functions
├── docker/
│   ├── api/                     — Dockerfile + entrypoint
│   ├── bot/                     — Dockerfile
│   └── web/                     — Dockerfile + nginx.conf
├── scripts/
│   └── bump-version.sh          — Synchronized SemVer bumping
├── docker-compose.yml           — Production (Docker Swarm)
├── compose.dev.yaml             — Local Docker development
├── turbo.json                   — Turborepo pipeline config
└── pnpm-workspace.yaml          — Workspace definition
```

## License

[MIT](LICENSE)
