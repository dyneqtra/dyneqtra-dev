#!/bin/bash

# First test Ollama connection if URL is provided
if [ -f "test_ollama.sh" ]; then
    chmod +x test_ollama.sh
    ./test_ollama.sh
fi

set -e 
mkdir -p /pyspur/backend/app/models/management/alembic/versions/
start_server() {
    uvicorn app.api.main:app --reload --host 0.0.0.0 --port 8000
}

main() {
    alembic upgrade head
    start_server
}

main