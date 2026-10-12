FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/contracts/package.json ./packages/contracts/

RUN npm ci

COPY tsconfig.base.json ./

COPY packages/contracts ./packages/contracts
COPY apps/backend ./apps/backend

RUN npm run build -w @app/contracts
RUN npm run build -w @app/backend

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "run", "start", "-w", "@app/backend"]