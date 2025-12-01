# Dockerfile for apps/demo

# ---- Base Stage ----
# Installs all dependencies for the entire monorepo.
# This layer is cached to speed up subsequent builds.
FROM node:22-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency definition files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/js-sdk/package.json ./packages/js-sdk/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY apps/demo/package.json ./apps/demo/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# ---- Builder Stage ----
# Copies the source code and builds the 'demo' application.
FROM base AS builder
WORKDIR /app

# Copy the rest of the source code
COPY . .

# Build the 'demo' app using Turbo
RUN pnpm turbo run build --filter=demo

# ---- Runner Stage ----
# Creates the final, optimized image for running the application.
FROM node:22-alpine AS runner
WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/js-sdk/package.json ./packages/js-sdk/
COPY --from=builder /app/packages/eslint-config/package.json ./packages/eslint-config/
COPY --from=builder /app/packages/typescript-config/package.json ./packages/typescript-config/
COPY --from=builder /app/apps/demo/package.json ./apps/demo/
RUN pnpm install --frozen-lockfile --prod

# Copy the built 'demo' app from the builder stage
COPY --from=builder /app/apps/demo/.next /app/apps/demo/.next
COPY --from=builder /app/apps/demo/public /app/apps/demo/public
COPY --from=builder /app/apps/demo/next.config.js /app/apps/demo/

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Change to the app directory
WORKDIR /app/apps/demo

# Start the Next.js app
CMD ["pnpm", "start"]
