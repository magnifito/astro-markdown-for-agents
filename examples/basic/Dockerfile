# Stage 1: Build the site
FROM node:22-slim AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy the integration and the example
COPY package.json tsconfig.json index.ts ./
COPY src ./src
COPY tests ./tests
COPY examples ./examples

# Install all dependencies at the workspace level
RUN pnpm install --no-frozen-lockfile

# Build the example site
WORKDIR /app/examples/basic
RUN pnpm install --no-frozen-lockfile
RUN pnpm build

# Stage 2: Serve the site with Nginx
FROM nginx:alpine

# Copy the custom Nginx config
COPY examples/basic/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built site from the builder stage
COPY --from=builder /app/examples/basic/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
