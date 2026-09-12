# RailSync 2.0 — Production Backend Container
# AI-Powered Automatic Block Planning & Digital Twin for Indian Railways

FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH="/app:/app/Backend" \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install minimal OS dependencies for compilation and health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY Backend/requirements.txt /app/Backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/Backend/requirements.txt

# Copy backend application, optimization engine, and trained ML artifacts
COPY Backend /app/Backend
COPY Optimization /app/Optimization
COPY Railsync_Layer1_Complete /app/Railsync_Layer1_Complete
COPY Railsync_2.0_Layer_0_FINAL /app/Railsync_2.0_Layer_0_FINAL
COPY Railsync_Layer2_Outputs /app/Railsync_Layer2_Outputs

# Expose default port
EXPOSE 8000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-8000}/health || exit 1

# Start the FastAPI application on 0.0.0.0:$PORT
CMD ["sh", "-c", "uvicorn app.main:app --app-dir /app/Backend --host 0.0.0.0 --port ${PORT:-8000}"]
