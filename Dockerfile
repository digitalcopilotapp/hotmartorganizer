FROM node:18-bullseye-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl ca-certificates libssl1.1 && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && node --loader ts-node/esm src/index.ts"]
