# API Conventions — Life Map

## Route Structure

All routes in `apps/api/src/routes/`. Each file exports a Hono route group:

```typescript
import { Hono } from 'hono'

const userRoutes = new Hono()

userRoutes.post('/', async (c) => { ... })
userRoutes.get('/:telegramId', async (c) => { ... })

export { userRoutes }
```

Mounted in `apps/api/src/app.ts`:

```typescript
app.route("/api/users", userRoutes);
app.route("/api/health", healthRoutes);
```

## Middleware

- `telegram.ts` — validates Telegram initData (for Mini App requests)
- `auth.ts` — validates API_SECRET header (for bot-to-API requests)
- `error.ts` — global error handler, returns consistent JSON errors

## Error Responses

Always return consistent error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Birth date must be in the past"
  }
}
```

## Validation

Use Zod schemas from `packages/shared`. Validate request bodies with Hono's validator middleware or manually:

```typescript
import { userCreateSchema } from "@life-map/shared";

app.post("/", async (c) => {
  const result = userCreateSchema.safeParse(await c.req.json());
  if (!result.success) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: result.error.message } }, 400);
  }
  // ...
});
```
