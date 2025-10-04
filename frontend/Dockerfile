FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package.json ./
COPY frontend/package-lock.json* ./

# Install dependencies (including dev dependencies)
RUN npm install

# Copy all frontend source code
COPY frontend/ .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
