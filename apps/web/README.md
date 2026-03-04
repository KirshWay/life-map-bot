# Web

Vue 3 Single Page Application that runs as a Telegram Mini App. Renders the life map week grid with theme colors from the Telegram client.

## Components

| Component      | Description                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- |
| `App.vue`      | Root component. Initializes Telegram SDK, fetches user data, renders grid or fallback states. |
| `WeekGrid.vue` | Builds the 80x52 grid, auto-scrolls to the current year on mount.                             |
| `WeekCell.vue` | Single week cell. Styled as lived (filled), current (pulsing), or future (outlined).          |

## Composables

| Composable    | Description                                                                             |
| ------------- | --------------------------------------------------------------------------------------- |
| `useTelegram` | Initializes `@telegram-apps/sdk`, extracts user ID and raw initData from launch params. |
| `useLifeMap`  | Fetches user data from the API, computes weeks lived and current week number.           |

## Environment Variables

| Name           | Required | Description                                                                                       |
| -------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | No       | API base URL. Leave empty in dev (Vite proxy handles `/api` requests). Set for production builds. |

## Development

```bash
pnpm dev
```

The Vite dev server starts on `http://localhost:5173` and proxies `/api` to `http://localhost:3000`.

To test inside Telegram, expose the dev server over HTTPS:

```bash
ngrok http 5173
```

Set the ngrok URL as your Mini App URL in @BotFather and as `WEB_APP_URL` in the bot's `.env`.
