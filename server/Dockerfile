# Multi-stage build for Node.js backend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S toray -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=toray:nodejs /app/dist ./dist
COPY --from=builder --chown=toray:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=toray:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown -R toray:nodejs /app/logs

# Switch to non-root user
USER toray

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]