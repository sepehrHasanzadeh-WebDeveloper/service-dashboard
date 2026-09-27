FROM node:20-alpine AS base

RUN corepack enable \
  && corepack install --global pnpm@12.6.0

WORKDIR /app

FROM base AS dependencies

ENV DATABASE_URL=file:/app/data/dev.db

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/data/dev.db

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts next.config.ts tsconfig.json postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY src ./src
COPY public ./public

RUN ./node_modules/.bin/prisma generate
RUN ./node_modules/.bin/next build

FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/data/dev.db

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app ./
RUN mkdir -p /app/data \
  && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && ./node_modules/.bin/next start"]
