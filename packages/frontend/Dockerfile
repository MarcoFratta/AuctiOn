# Build stage
FROM node:18-alpine AS build-stage

WORKDIR /app

# Copy configuration and package definition files first
COPY tsconfig.base.json ./
COPY package.json ./
COPY package-lock.json ./
COPY packages/common ./packages/common
COPY packages/frontend ./packages/frontend
# If frontend depends on other workspace packages, copy their package.json too
# e.g., COPY packages/some-other-pkg/package.json ./packages/some-other-pkg/

# Install ALL workspace dependencies based on the lock file
# This single install handles linking workspace packages correctly
RUN npm install

# Build the frontend application using the workspace command
# Assumes your root package.json or frontend package.json has a 'build' script
# Use '-w frontend' or '--workspace=frontend' to target the specific package

RUN npm run build:esm -w @auction/common
RUN npm run build -w frontend
# If your build script isn't runnable from the root, you might need:
# WORKDIR /app/packages/frontend
# RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy built files from build stage
# Ensure this path matches the actual output directory of your build command
COPY --from=build-stage /app/packages/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 