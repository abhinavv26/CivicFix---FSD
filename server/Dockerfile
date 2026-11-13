# Multi-stage or lightweight production Node container
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies if needed
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies (production + required runtime tools)
RUN npm ci --only=production

# Copy application source
COPY . .

# Ensure uploads folder exists
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "server.js"]
