FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]

FROM deps AS development
COPY . .
EXPOSE 3001
CMD ["npx", "tsx", "watch", "src/index.ts"]
