#!/bin/bash
set -e  # Exit on first error

# Function to clean up Docker Compose
cleanup() {
    echo "Stopping containers and removing volumes..."
    docker compose -f ../../docker-compose.test.yml down --volumes --remove-orphans
}
trap cleanup EXIT  # Run cleanup on exit, even if tests fail

# Start containers
docker compose -f ../../docker-compose.test.yml up -d --force-recreate --build

# Run tests
npx jest --runInBand
