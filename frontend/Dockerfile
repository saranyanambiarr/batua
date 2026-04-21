FROM node:20-slim AS builder
WORKDIR /app

# Build args — Vite bakes these in at build time, not runtime
ARG VITE_API_BASE_URL
ARG VITE_TRANSACTION_API_URL

COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Serve the built files
FROM node:20-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
