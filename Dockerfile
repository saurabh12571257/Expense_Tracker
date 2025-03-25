FROM node:20-alpine AS frontend-build

# Set working directory for frontend build
WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html vite.config.js postcss.config.js ./
COPY .eslintrc.js eslint.config.js ./

# Build frontend
RUN npm run build

FROM node:20-alpine AS backend-build

# Set working directory for backend build
WORKDIR /app/backend

# Copy backend package files and install dependencies
COPY tracker-backend/package*.json ./
RUN npm install

# Copy backend source code
COPY tracker-backend/ .

# Final image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy built frontend assets
COPY --from=frontend-build /app/frontend/dist /app/public

# Copy backend files
COPY --from=backend-build /app/backend /app

# Install a simple static file server for frontend
RUN npm install -g serve

# Expose ports
EXPOSE 5002 3000

# Create a simple startup script
RUN echo '#!/bin/sh\n\
# Start backend server in background\n\
node server.js &\n\
# Start frontend static server\n\
serve -s /app/public -l 3000\n\
' > /app/start.sh

RUN chmod +x /app/start.sh

# Start both frontend and backend
CMD ["/app/start.sh"] 