# Stage 1: Build stage
FROM node:20.19.0-alpine AS builder

WORKDIR /app

# Copy root package files AND package sources BEFORE installing
COPY package.json package-lock.json ./
COPY packages/common ./packages/common
COPY packages/user-service ./packages/user-service
RUN rm -rf packages/user-service/__tests__
# Install ALL monorepo dependencies (including workspace linking)
RUN npm install --production
RUN npm install typescript
# Copy shared config (can be done after install)
COPY tsconfig.base.json ./

# Build the common package
RUN npm run build:cjs -w @auction/common

# Build the user-service and docs
RUN npm run build -w user-service

# Stage 2: Production stage
FROM node:20.19.0-alpine

WORKDIR /app

# Copy production node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy built common package artifacts
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json

# Copy user-service built code, package.json, and docs
COPY --from=builder /app/packages/user-service/dist ./dist
COPY --from=builder /app/packages/user-service/package.json ./package.json
COPY --from=builder /app/packages/user-service/docs ./docs

# Expose the port the application will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
