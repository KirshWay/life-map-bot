---
name: grammy-bot
description: >
  grammY Telegram bot patterns: commands, handlers, middleware, inline keyboards,
  Mini App launch buttons, scheduled notifications. Use when working on apps/bot.
---

## grammY Bot — Project Patterns

### Bot Structure

```
apps/bot/src/
├── commands/       # Command handlers (/start, /settings)
├── handlers/       # Callback query handlers
├── services/       # Business logic (scheduler, API client)
├── bot.ts          # Bot instance creation
└── index.ts        # Entry point
```

### Command Pattern

```typescript
import { Composer } from "grammy";

const startCommand = new Composer();

startCommand.command("start", async (ctx) => {
  await ctx.reply("Welcome! Send your birth date (DD.MM.YYYY):");
});

export { startCommand };
```

### Mini App Launch Button

```typescript
import { InlineKeyboard } from "grammy";

const keyboard = new InlineKeyboard().webApp("Open Life Map", "https://your-domain.com");

await ctx.reply("Your life map is ready!", { reply_markup: keyboard });
```

### Scheduled Notifications (node-cron)

```typescript
import cron from "node-cron";

// Every Monday at 9:00 AM
cron.schedule("0 9 * * 1", async () => {
  // Fetch users with notifications enabled
  // Calculate weeks lived
  // Send messages via bot.api.sendMessage()
});
```

### Key Points

- Bot communicates with API via HTTP (not direct DB access)
- Use `bot.api.sendMessage(chatId, text)` for proactive messages
- grammY has built-in error handling via `bot.catch()`
- For long-running operations use `grammy-runner` for concurrent updates
