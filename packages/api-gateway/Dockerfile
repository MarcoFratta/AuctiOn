# Use the official Node.js image as a base
FROM node:18

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose the port the application will run on
EXPOSE 8080

COPY src ./src
COPY tsconfig.json ./


RUN npm run build

# Start the application
CMD ["npm", "start"]
