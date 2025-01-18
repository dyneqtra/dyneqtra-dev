# Base stage
FROM python:3.12-slim AS base
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /pyspur/backend
COPY requirements.txt .
RUN pip install -r requirements.txt

# Development stage
FROM base AS development
# Development-specific instructions here

# Production stage
FROM base AS production
COPY . .
# Production-specific instructions here
