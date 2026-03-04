---
name: drizzle-sqlite
description: >
  Drizzle ORM with SQLite (better-sqlite3) patterns: schema definition,
  migrations, queries, relations. Use when working on apps/api database layer.
---

## Drizzle + SQLite — Project Patterns

### Schema Location

All schemas in `apps/api/src/db/schema.ts`. DB connection in `apps/api/src/db/index.ts`.

### Schema Pattern

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  telegramId: text("telegram_id").notNull().unique(),
  birthDate: text("birth_date").notNull(), // ISO date string
  chatId: text("chat_id").notNull(),
  notificationsEnabled: integer("notifications_enabled", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
```

### Migration Workflow

```bash
pnpm --filter api db:generate   # Generate migration from schema changes
pnpm --filter api db:migrate    # Apply migrations
```

### Query Patterns

Use Drizzle's query builder, not raw SQL:

```typescript
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";

// Select
const user = await db.select().from(users).where(eq(users.telegramId, id)).get();

// Insert
await db.insert(users).values({ telegramId, birthDate, chatId });

// Update
await db.update(users).set({ notificationsEnabled: false }).where(eq(users.id, userId));
```

### Key Points

- SQLite stores dates as TEXT (ISO strings) — use date-fns for parsing
- `better-sqlite3` is synchronous but Drizzle wraps it — use `await` anyway for consistency
- Database file path from env: `DATABASE_PATH` or default `./data/life-map.db`
