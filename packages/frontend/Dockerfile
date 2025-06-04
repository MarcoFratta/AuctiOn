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
RUN npm install -w @auction/common --production
RUN npm install -w @auction/frontend --production --ignore-scripts

# Build common package first
RUN npm i -D @types/jest
RUN npm run build:esm --workspace=@auction/common
# Build frontend
RUN npm run build-only --workspace=@auction/frontend

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 