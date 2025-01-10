# Use the official Node.js image as a base
FROM node:18

# Set the working directory
WORKDIR /app


# Copy the shared tsconfig.base.json from the root context
COPY tsconfig.base.json ./
COPY package*.json ./
COPY package-lock.json ./
RUN npm install

# Move to the api-gateway folder
WORKDIR /app/packages/api-gateway

# Copy the service-specific files
COPY packages/api-gateway/package*.json ./
COPY packages/api-gateway/tsconfig.json ./
COPY packages/api-gateway/src ./src

# Install dependencies
RUN npm install

# Expose the port the application will run on
EXPOSE 8080

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "start"]
