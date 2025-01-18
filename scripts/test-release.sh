#!/bin/bash

# Get version from .env file
VERSION=$(grep VERSION .env | cut -d '=' -f2)
GITHUB_REPOSITORY=$(grep GITHUB_REPOSITORY .env | cut -d '=' -f2)

echo "Building release version: $VERSION"
echo "Repository: $GITHUB_REPOSITORY"

# Build backend
echo "Building backend image..."
docker build \
  --target production \
  -t ghcr.io/${GITHUB_REPOSITORY}-backend:${VERSION} \
  ./backend

# Build frontend
echo "Building frontend image..."
docker build \
  --target production \
  -t ghcr.io/${GITHUB_REPOSITORY}-frontend:${VERSION} \
  ./frontend

# Run with production compose file
echo "Starting production containers..."
docker compose -f docker-compose.prod.yml up 