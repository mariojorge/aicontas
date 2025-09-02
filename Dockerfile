# Multi-stage build combining frontend and backend

# Accept port as build argument
ARG APP_PORT=3000

# Stage 1: Build frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Final image with backend serving frontend
FROM node:20-slim

# Accept port as build argument in final stage
ARG APP_PORT=3000

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

# Expose port using build argument
EXPOSE ${APP_PORT}

# Start backend (which will serve both API and static files)
CMD ["npm", "start"]