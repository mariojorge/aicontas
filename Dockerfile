# Multi-stage build combining frontend and backend

# Stage 1: Build frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Final image with backend serving frontend
FROM node:20-slim

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Copy built frontend to backend's public directory
RUN mkdir -p ./public
COPY --from=frontend-build /app/frontend/dist ./public

# Create data directory
RUN mkdir -p ./data && chown -R node:node ./data && chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start backend (which will serve both API and static files)
CMD ["npm", "start"]