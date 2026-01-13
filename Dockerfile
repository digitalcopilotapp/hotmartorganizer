FROM node:18-bullseye-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
 
FROM node:18-bullseye-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
