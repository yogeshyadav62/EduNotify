FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application files
COPY . .

# Expose port
EXPOSE 4500

# Set environment
ENV NODE_ENV=production
ENV PORT=4500

# Start server
CMD ["node", "index.js"]
