# Multi-stage build for React frontend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S toray -u 1001 -G nginx

# Set proper permissions
RUN chown -R toray:nginx /var/cache/nginx && \
    chown -R toray:nginx /var/log/nginx && \
    chown -R toray:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R toray:nginx /var/run/nginx.pid && \
    chown -R toray:nginx /usr/share/nginx/html

# Switch to non-root user
USER toray

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]