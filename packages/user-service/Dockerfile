# Use the official Node.js image as a base
FROM node:18

# Set the working directory
WORKDIR /app


# Copy the shared tsconfig.base.json from the root context
COPY tsconfig.base.json ./
COPY package*.json ./
COPY package-lock.json ./
RUN npm install

# Move to the user-service folder
WORKDIR /app/packages/user-service

# Copy the service-specific files
COPY packages/user-service/package*.json ./
COPY packages/user-service/tsconfig.json ./
COPY packages/user-service/src ./src
COPY packages/user-service/docs ./docs


# Install dependencies
RUN npm install

# Expose the port the application will run on
EXPOSE 3000

# Build the application
RUN npm run build
RUN npm run doc

# Start the application
CMD ["npm", "start"]