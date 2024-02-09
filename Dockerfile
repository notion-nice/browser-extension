FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS builder
# RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories \
#   && apk add --no-cache libc6-compat
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY . .
RUN yarn global add turbo \
  && turbo prune --scope=web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat

WORKDIR /app
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

COPY --from=builder /app/out/full/ .
RUN yarn global add pnpm \
  && pnpm install

ENV NEXT_TELEMETRY_DISABLED=1

# Build the project
RUN pnpm dlx turbo run build --filter web...

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ARG CODE_ENV

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone .
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static


# You only need to copy next.config.js if you are NOT using the default configuration
# COPY --from=installer /app/apps/web/next.config.js .
# COPY --from=installer /app/apps/web/package.json .
# COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/web/public ./public
# COPY --from=installer /app/apps/web/tracing.js ./apps/web/tracing.js
# COPY --from=installer /app/apps/web/node_modules ./apps/web/node_modules

RUN ls -la

EXPOSE 3000

ENV PORT 3000

CMD node server.js