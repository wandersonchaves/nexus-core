# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instala pnpm se necessário ou usa npm
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY . .

RUN npx nest build api

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
