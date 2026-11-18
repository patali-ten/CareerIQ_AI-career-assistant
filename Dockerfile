FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the rest of the project
COPY . .

# Seed ChromaDB then start the server
# HuggingFace Spaces expects port 7860
CMD python scripts/seed_vectorstore.py && \
    uvicorn backend.main:app \
      --host 0.0.0.0 \
      --port ${PORT:-7860} \
      --workers 1