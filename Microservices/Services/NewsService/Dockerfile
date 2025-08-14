# Use the official Node.js runtime as the base image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Install Prisma CLI
RUN npm install -g prisma

# Expose port
EXPOSE 80

# Set environment variables
ENV NODE_ENV=production
ENV PORT=80

# Run database migrations and start the application
CMD ["sh", "-c", "prisma migrate deploy && npm start"]
