# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for scikit-learn, certificates, and health check
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY Services/AIService/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the AIService code
COPY Services/AIService/ .

# Copy certificates for HTTPS
COPY certs/ ./certs/

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Expose both HTTP and HTTPS ports
EXPOSE 8000
EXPOSE 8001

# Health check (using HTTP for simplicity)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "main.py"]
