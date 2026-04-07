# Production Dockerfile for Apple Store API
FROM node:20-alpine

# Use /app as the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose the API port
EXPOSE 5001

# Command to run the application
CMD ["npm", "start"]
