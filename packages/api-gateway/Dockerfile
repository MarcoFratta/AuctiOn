# Stage 1: Build stage
FROM node:20.19.0-alpine AS builder

WORKDIR /app

# Copy root package files AND package sources BEFORE installing
COPY package.json package-lock.json ./
COPY packages/common ./packages/common
COPY packages/api-gateway ./packages/api-gateway

RUN rm -rf packages/api-gateway/__tests__

# Install ALL monorepo dependencies (including workspace linking)
RUN npm install --production
RUN npm install typescript
# Copy shared config (can be done after install)
COPY tsconfig.base.json ./

# Build the common package
RUN npm run build:cjs -w @auction/common

# Build the api-gateway service
RUN npm run build -w api-gateway


# Stage 2: Production stage
FROM node:20.19.0-alpine

WORKDIR /app

# Copy production node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy built common package artifacts
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json

# Copy api-gateway built code and package.json
COPY --from=builder /app/packages/api-gateway/dist ./dist
COPY --from=builder /app/packages/api-gateway/package.json ./package.json

# Expose the port the application will run on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
