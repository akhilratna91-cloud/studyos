FROM node:20-alpine AS builder

WORKDIR /app

ARG INTERNAL_API_ORIGIN=http://backend:5000
ENV INTERNAL_API_ORIGIN=$INTERNAL_API_ORIGIN
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV INTERNAL_API_ORIGIN=http://backend:5000
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
