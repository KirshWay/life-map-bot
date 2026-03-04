FROM node:22-alpine AS base
ENV COREPACK_INTEGRITY_KEYS=""
RUN corepack enable pnpm

FROM base AS pruner
RUN npm install -g turbo@2.8.11
WORKDIR /app
COPY . .
RUN turbo prune web --docker

FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm turbo build --filter=web

FROM nginx:alpine AS runner

COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
