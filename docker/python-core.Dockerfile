# Multi-stage build for Python Core
# Stage 1: Builder
FROM ubuntu:22.04 AS builder

# Install Python and build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && apt-get clean \
    &&rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Create virtual environment
RUN python3 -m venv /build/venv

# Copy requirements
COPY requirements.txt .

# Install dependencies in virtual environment
RUN /build/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /build/venv/bin/pip install --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM ubuntu:22.04

# Install Python runtime only (no build tools)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-venv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /build/venv /app/venv

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8000

# Use virtual environment Python
ENV PATH="/app/venv/bin:$PATH"

# Start the application
CMD ["/app/venv/bin/python", "api.py"]
