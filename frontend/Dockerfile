# Base stage
FROM node:23-alpine AS base
WORKDIR /pyspur/frontend
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
# Development-specific instructions here

# Production stage
FROM base AS production
RUN npm ci --only=production
COPY . .
RUN npm run build
# Production-specific instructions here
