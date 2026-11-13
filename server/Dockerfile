# Production Node container (Debian-based slim for broad glibc compatibility)
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
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
