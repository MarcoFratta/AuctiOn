# Use the official Node.js image as a base
FROM node:18

# Set the working directory
WORKDIR /app


# Copy the shared tsconfig.base.json from the root context
COPY tsconfig.base.json ./
COPY package*.json ./
COPY package-lock.json ./
RUN npm install

# Move to the lobby-service folder
WORKDIR /app/packages/lobby-service

# Copy the service-specific files
COPY packages/lobby-service/package*.json ./
COPY packages/lobby-service/tsconfig.json ./
COPY packages/lobby-service/src ./src

# Install dependencies
RUN npm install

# Expose the port the application will run on
EXPOSE 3000

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "start"]
