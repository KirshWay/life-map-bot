---
name: telegram-mini-app
description: >
  Telegram Mini App development: initData validation, @telegram-apps/sdk usage,
  Vue composables for TMA, theming, viewport, back button. Use when working on
  apps/web or Telegram-related API middleware.
---

## Telegram Mini Apps — Project Conventions

### Security: initData Validation (CRITICAL)

Always validate Telegram initData on the backend before trusting any user data.
Implementation: `apps/api/src/middleware/telegram.ts`

The initData is passed from the Mini App via HTTP header or query parameter.
Never trust client-side data without backend validation.

### Vue Composables for TMA

Create composables in `apps/web/src/composables/`:

- `useTelegramTheme()` — sync CSS variables with Telegram theme colors
- `useTelegramViewport()` — handle safe areas and viewport changes
- `useBackButton()` — integrate Telegram's native back button
- `useTelegramUser()` — extract user data from SDK

### Common Pitfalls

- Mini App MUST be served over HTTPS (even in dev — use ngrok or similar)
- Don't use SSR — TMA is a client-side SPA loaded inside Telegram WebView
- Always test in actual Telegram client, not just browser
- `@telegram-apps/sdk` uses `signal`-based reactivity — wrap in Vue `computed` or `watch`
- Telegram theme can change at runtime (user switches dark/light mode)
- Viewport height is dynamic — bottom sheet mode vs fullscreen

### Useful Links

- Telegram Mini Apps docs: https://core.telegram.org/bots/webapps
- @telegram-apps/sdk: https://docs.telegram-mini-apps.com/
