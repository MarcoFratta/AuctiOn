# Use the official Node.js image as a base
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the root package.json and package-lock.json
COPY package*.json ./
COPY package-lock.json ./

# Install the root dependencies (including common package)
RUN npm install

# Copy the shared tsconfig.base.json
COPY tsconfig.base.json ./

# Now, copy the common package
COPY packages/common/package*.json ./packages/common/
COPY packages/common/tsconfig.json ./packages/common/
COPY packages/common/src ./packages/common/src

# Install the common package's dependencies
WORKDIR /app/packages/common
RUN npm install
RUN npm run build

# Copy the user service package files
WORKDIR /app/packages/user-service
COPY packages/user-service/package*.json ./
COPY packages/user-service/tsconfig.json ./
COPY packages/user-service/src ./src
COPY packages/user-service/docs ./docs

# Install the user service dependencies
WORKDIR /app
RUN npm install

# Expose the port the application will run on
EXPOSE 3000

# Build the application
WORKDIR /app/packages/user-service
RUN npm run build
RUN npm run doc

# Start the application
CMD ["npm", "start"]
