# API

Hono REST API server with SQLite database (Drizzle ORM). Serves data for the Telegram Mini App and internal bot requests.

## Routes

| Method | Path                              | Auth              | Description                  |
| ------ | --------------------------------- | ----------------- | ---------------------------- |
| GET    | `/api/health`                     | None              | Health check                 |
| GET    | `/api/me`                         | Telegram initData | Get current user by initData |
| GET    | `/api/users`                      | API secret        | List all users               |
| POST   | `/api/users`                      | API secret        | Create a user                |
| GET    | `/api/users/:telegramId`          | API secret        | Get user by Telegram ID      |
| PATCH  | `/api/users/:telegramId/settings` | API secret        | Update user settings         |

## Environment Variables

| Name            | Required | Description                                            |
| --------------- | -------- | ------------------------------------------------------ |
| `BOT_TOKEN`     | Yes      | Telegram bot token (used for initData HMAC validation) |
| `API_SECRET`    | Yes      | Shared secret for bot-to-API authentication            |
| `DATABASE_PATH` | No       | SQLite file path (default: `./data/life-map.db`)       |
| `PORT`          | No       | Server port (default: `3000`)                          |

## Development

```bash
cp ../../.env.example .env
# Fill in BOT_TOKEN and API_SECRET
pnpm dev
```

The server starts on `http://localhost:3000` with hot reload via `tsx watch`.

## Migrations

Drizzle Kit manages schema migrations. Generated SQL files live in `drizzle/`.

```bash
# Generate a migration after changing db/schema.ts
pnpm db:generate

# Apply migrations locally
pnpm db:migrate
```

In production, migrations run automatically on container startup via `src/migrate.ts` (called from the Docker entrypoint).
