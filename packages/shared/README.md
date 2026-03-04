# Shared

Shared TypeScript package used by `api`, `bot`, and `web`. Exports Zod validation schemas and week calculation utilities.

## Exports

### Schemas (`schemas/user.ts`)

| Export                                 | Description                                                    |
| -------------------------------------- | -------------------------------------------------------------- |
| `userSchema`                           | Full user object validation                                    |
| `createUserSchema`                     | Validation for creating a user (telegramId, birthDate, chatId) |
| `updateSettingsSchema`                 | Validation for updating settings (notificationsEnabled)        |
| `User`, `CreateUser`, `UpdateSettings` | Inferred TypeScript types                                      |

### Utils (`utils/weeks.ts`)

| Export                                    | Description                                    |
| ----------------------------------------- | ---------------------------------------------- |
| `getTotalWeeks()`                         | Returns 4,160 (80 years x 52 weeks)            |
| `getWeeksLived(birthDate)`                | Weeks elapsed since birth date                 |
| `getCurrentWeekNumber(birthDate)`         | Current week number (1-based, capped at 4,160) |
| `getWeekDateRange(birthDate, weekNumber)` | Start and end dates for a given week           |

Week numbers are relative to the user's birth date, not calendar weeks. Week 1 starts on the birth date.

## Tests

```bash
pnpm test
```

12 tests covering all week calculation functions with mocked system time.
