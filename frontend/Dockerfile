# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install serve to run the production build
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/build ./build

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["serve", "-s", "build", "-l", "3000"]
