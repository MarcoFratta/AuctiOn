# Use the official Node.js image as a base
FROM node:18

# Set the working directory
WORKDIR /app


# Copy the shared tsconfig.base.json from the root context
COPY tsconfig.base.json ./
COPY package*.json ./
COPY package-lock.json ./
RUN npm install

# Now, copy the common package
COPY packages/common/package*.json ./packages/common/
COPY packages/common/tsconfig.json ./packages/common/
COPY packages/common/src ./packages/common/src

# Install the common package's dependencies
WORKDIR /app/packages/common
RUN npm install
RUN npm run build

# Move to the auction-service folder
WORKDIR /app/packages/auction-service

# Copy the service-specific files
COPY packages/auction-service/package*.json ./
COPY packages/auction-service/tsconfig.json ./
COPY packages/auction-service/src ./src

# Install dependencies
RUN npm install

# Expose the port the application will run on
EXPOSE 3000

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "start"]
