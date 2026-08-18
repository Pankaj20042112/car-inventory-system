FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
RUN npm install --legacy-peer-deps
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

FROM nginx:alpine
COPY --from=builder /usr/src/app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
