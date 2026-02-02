FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (better layer caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ backend/

# Move into backend directory
WORKDIR /app/backend

# Run tests with output visible
CMD ["pytest", "-s"]
