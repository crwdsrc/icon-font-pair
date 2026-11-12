# Icon + Type: static site served by nginx.
# Stage 1 builds the font catalog and the Svelte app into dist/.
# Stage 2 serves it. Icons, Google Fonts and Fontsource fonts load from public APIs and CDNs at runtime.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
# Path the site is served under, for example /experiments/icon-font-pair/. Set it as a build variable in Coolify.
ARG BASE_PATH=/
ENV BASE_PATH=$BASE_PATH
COPY index.html vite.config.js svelte.config.js ./
COPY scripts ./scripts
COPY vendor ./vendor
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
