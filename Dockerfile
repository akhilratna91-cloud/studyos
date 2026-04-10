FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY .env.example ./.env.example
COPY README.md ./README.md

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
