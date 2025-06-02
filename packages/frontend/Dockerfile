# Build stage
FROM node:20.19.1-alpine AS builder

WORKDIR /app

# Copy workspace root package files
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

# Copy common and frontend packages
COPY packages/common ./packages/common
COPY packages/frontend ./packages/frontend

# Install dependencies
RUN npm ci

# Build common package first
RUN npm run build:cjs --workspace=@auction/common

# Build frontend
RUN npm run build --workspace=@auction/frontend

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 