# Bot

Grammy-based Telegram bot that handles user onboarding and sends weekly life progress notifications.

## Commands

| Command  | Description                                                                       |
| -------- | --------------------------------------------------------------------------------- |
| `/start` | Checks if user exists. If yes, shows Mini App button. If no, asks for birth date. |

## Message Handlers

| Trigger                                 | Description                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Text message (when awaiting birth date) | Parses `DD.MM.YYYY`, validates, creates user via API, shows Mini App button. |

## Notifications

A cron job runs every Monday at 9:00 UTC. It fetches all users from the API, filters by `notificationsEnabled`, and sends a message with the current week number and total weeks lived. Messages are throttled at ~20/sec to stay under Telegram's rate limit.

## Environment Variables

| Name          | Required | Description                                     |
| ------------- | -------- | ----------------------------------------------- |
| `BOT_TOKEN`   | Yes      | Telegram bot token from @BotFather              |
| `API_URL`     | No       | API base URL (default: `http://localhost:3000`) |
| `API_SECRET`  | Yes      | Shared secret for API authentication            |
| `WEB_APP_URL` | Yes      | Public HTTPS URL for the Mini App               |

## Development

```bash
cp ../../.env.example .env
# Fill in BOT_TOKEN, API_SECRET, WEB_APP_URL
pnpm dev
```

The bot starts with hot reload via `tsx watch`. Requires the API to be running.
