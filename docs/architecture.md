# Architecture — Life Map

## Overview

```
User → Telegram Bot → API Server → SQLite DB
User → Telegram Mini App → API Server → SQLite DB
```

## Data Flow

1. User sends `/start` to bot → bot asks for birth date
2. User sends birth date → bot validates via shared Zod schema → bot calls API to save user
3. Bot sends inline keyboard with "Open Life Map" button → launches Mini App
4. Mini App loads → sends initData to API → API validates → returns user data
5. Mini App renders week grid based on birth date
6. Weekly cron in bot → fetches users with notifications on → sends weekly message

## API Endpoints

| Method | Path                            | Description                   |
| ------ | ------------------------------- | ----------------------------- |
| POST   | /api/users                      | Create user (from bot)        |
| GET    | /api/users/:telegramId          | Get user data (from Mini App) |
| PATCH  | /api/users/:telegramId/settings | Update notification settings  |
| GET    | /api/health                     | Health check                  |

## Authentication

- Bot → API: Internal service, secured by shared secret in `API_SECRET` env var
- Mini App → API: Telegram initData validation (HMAC-SHA256 with bot token)

## Environment Variables

```
BOT_TOKEN=           # Telegram bot token from @BotFather
API_URL=             # Internal API URL (http://api:3000 in Docker)
API_SECRET=          # Shared secret for bot-to-API auth
DATABASE_PATH=       # SQLite file path (default: ./data/life-map.db)
WEB_APP_URL=         # Public HTTPS URL for Mini App
```
