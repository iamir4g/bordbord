FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY . .
RUN rm -rf node_modules && npm ci --include=optional

EXPOSE 3000

CMD ["sh", "-lc", "set -eu; if ! node -e \"try{require('lightningcss');process.exit(0)}catch(e){process.exit(1)}\" >/dev/null 2>&1; then npm ci --include=optional; fi; exec npm run dev -- --hostname 0.0.0.0 --port 3000"]
