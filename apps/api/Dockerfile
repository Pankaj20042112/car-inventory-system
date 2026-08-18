FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN npm install --legacy-peer-deps
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/api

FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/
RUN npm install --omit=dev --legacy-peer-deps
COPY --from=builder /usr/src/app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=builder /usr/src/app/apps/api/prisma ./apps/api/prisma
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
EXPOSE 5000
CMD ["node", "apps/api/dist/server.js"]
