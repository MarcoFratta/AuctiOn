# Stage 1: Build stage
FROM node:20.19.0-alpine AS builder

WORKDIR /app

# Copy root package files and install ALL monorepo dependencies
COPY package.json package-lock.json ./
COPY packages/common ./packages/common
COPY packages/auction-service ./packages/auction-service

RUN rm -rf packages/auction-service/__tests__

RUN npm install --production
RUN npm install typescript

# Copy shared config and common package source
COPY tsconfig.base.json ./
# Build the common package
RUN npm run build:cjs -w @auction/common
# Copy auction-service source code
# Build the auction-service
RUN npm run build -w auction-service

# Stage 2: Production stage
FROM node:20.19.0-alpine

WORKDIR /app

# Copy production node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy built common package artifacts
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json


# Copy auction-service built code and package.json
COPY --from=builder /app/packages/auction-service/dist ./dist
COPY --from=builder /app/packages/auction-service/package.json ./package.json


# Expose the port the application will run on
EXPOSE 3000
# Start the application
CMD ["npm", "start"]
