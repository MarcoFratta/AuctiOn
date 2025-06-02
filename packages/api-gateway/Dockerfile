# Stage 1: Build stage
FROM node:20.19.1-alpine AS builder

WORKDIR /app

# Copy root package files first for workspace resolution
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

# Copy ALL packages needed for workspace resolution
COPY packages/common ./packages/common
COPY packages/api-gateway ./packages/api-gateway

# Remove test files
RUN rm -rf packages/api-gateway/__tests__

# Install ALL dependencies with workspace linking (remove --production flag)
RUN npm install -w @auction/common --production
RUN npm install -w @auction/api-gateway --production
RUN npm install typescript

# Build common package FIRST (this is crucial)
RUN npm run build:cjs --workspace=@auction/common

# Now build api-gateway (it can find @auction/common)
RUN npm run build --workspace=@auction/api-gateway

# Stage 2: Production stage
FROM node:20.19.1-alpine

WORKDIR /app

# Copy the entire node_modules with workspace structure
COPY --from=builder /app/node_modules ./node_modules

# Copy root package.json for workspace resolution
COPY --from=builder /app/package.json ./package.json

# Copy built common package with correct structure
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json

# Copy api-gateway built code
COPY --from=builder /app/packages/api-gateway/dist ./dist
COPY --from=builder /app/packages/api-gateway/package.json ./package.json

EXPOSE 3333
CMD ["npm", "start"]
