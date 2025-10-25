# Build stage
FROM node:24-alpine AS build-stage
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN npm ci --prefix server

# Install client dependencies
COPY client/package*.json ./client/
RUN npm ci --prefix client

# Copy and build server
COPY server/ ./server/
RUN npm run build --prefix server

# Copy and build client
COPY client/ ./client/
RUN npm run build --prefix client

# Production stage
FROM node:24-alpine
WORKDIR /usr/src/app

# Copy server package files
COPY server/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built server from build stage
COPY --from=build-stage /app/server/dist ./dist

# Copy built client from build stage
COPY --from=build-stage /app/client/dist ./dist/client

# Create data directory
RUN mkdir -p /usr/src/app/data

# Expose port
EXPOSE 8000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application
CMD [ "node", "dist/app.js" ]