# Use the official Node.js 22 Alpine image (matches dependency requirements)
FROM node:22-alpine AS builder

# Install OpenSSL (required for Prisma Client to run on Alpine)
RUN apk add --no-cache openssl

# Set the working directory
WORKDIR /app

# Copy package descriptors and Prisma configuration first
COPY package*.json prisma.config.ts* ./

# Copy the Prisma schema and migrations directory before npm ci so postinstall (prisma generate) succeeds
COPY prisma ./prisma/

# Install all dependencies using npm ci (triggers postinstall: prisma generate)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# -- Final Stage --
FROM node:22-alpine

# Install OpenSSL in the final image
RUN apk add --no-cache openssl

# Set the working directory
WORKDIR /app

# Copy the build artifacts and node_modules from the builder stage with non-root ownership
COPY --from=builder --chown=node:node /app ./

# Create the uploads directory for temporary/local files and ensure ownership
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Expose the port the app runs on (can be overridden via environment variables)
EXPOSE 5001

# Use non-root user for security
USER node

# Start the application using the production script
CMD ["npm", "start"]

