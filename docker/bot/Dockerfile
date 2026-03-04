FROM node:22-alpine AS base
ENV COREPACK_INTEGRITY_KEYS=""
RUN corepack enable pnpm

FROM base AS pruner
RUN npm install -g turbo@2.8.11
WORKDIR /app
COPY . .
RUN turbo prune bot --docker

FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo build --filter=bot

RUN pnpm --filter bot deploy --prod /app/deploy

FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/deploy .
COPY --from=builder --chown=appuser:nodejs /app/apps/bot/dist ./dist

USER appuser

CMD ["node", "dist/index.js"]
