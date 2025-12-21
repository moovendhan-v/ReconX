FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install Node.js, Python, and dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    python3 \
    python3-pip \
    build-essential \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy backend package files and install Node dependencies
COPY backend/package*.json ./
RUN npm install

# Copy python-core requirements and install Python dependencies
COPY python-core/requirements.txt ./python-requirements.txt
RUN pip3 install --no-cache-dir -r python-requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy python-core (exploits and scripts) to /app/python-core
COPY python-core/ ./python-core/

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

# Start backend in dev mode
CMD ["npm", "run", "start:dev"]
