# --- Этап 1: сборка ---------------------------------------------------------
FROM node:26.13-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=https://jsonplaceholder.typicode.com/photos
ARG VITE_API_ARTIFICIAL_DELAY_MS=300
ARG VITE_PHOTOS_AUTOLOAD=off
ENV VITE_API_URL=$VITE_API_URL \
  VITE_API_ARTIFICIAL_DELAY_MS=$VITE_API_ARTIFICIAL_DELAY_MS \
  VITE_PHOTOS_AUTOLOAD=$VITE_PHOTOS_AUTOLOAD

# Облегчённая сборка: без typecheck (его делают хуки/CI) и без минификации —
# быстрее собирается, бандл читаемее для отладки. Сервер — всё тот же стабильный nginx.
RUN npx vite build --minify false

# --- Этап 2: раздача ---------------------------------------------------------
FROM nginx:1.29-alpine AS runtime

RUN apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
