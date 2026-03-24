FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
RUN npm run db:generate

COPY src ./src
RUN npm run build

EXPOSE 3333

CMD ["sh", "-c", "npm run db:generate && npm run start"]
