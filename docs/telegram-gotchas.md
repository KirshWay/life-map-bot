# Telegram Mini Apps — Gotchas & Pitfalls

## HTTPS Required

Telegram requires Mini Apps to be served over HTTPS, even in development.
For local development, use ngrok or a similar tunnel:

```bash
ngrok http 5173
```

Then update bot's Web App URL to the ngrok HTTPS URL.

## No SSR

Telegram Mini App runs inside a WebView. It's always client-side rendered.
Don't add SSR frameworks or server-side rendering — it won't work.

## Theme Changes at Runtime

Users can switch between light/dark mode while the Mini App is open.
Subscribe to theme changes via `@telegram-apps/sdk` and update CSS variables reactively.

## Viewport & Safe Areas

- Bottom sheet mode has smaller viewport than fullscreen
- Account for Telegram's header and safe areas
- Use `viewport.safeAreaInsets` from the SDK

## initData Expiration

Telegram's initData has a limited validity window. Validate it on the backend
as soon as possible after receiving it. Don't cache initData for extended periods.

## Back Button

Telegram has a native back button. Handle it explicitly — otherwise users
get stuck or the app behaves unexpectedly.

## Testing

- Always test in the real Telegram client (iOS/Android), not just browser
- Use `@telegram-apps/sdk`'s debug mode for browser development
- Telegram Desktop and mobile WebView can behave differently
