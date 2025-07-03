# frontend/Dockerfile

# Step 1: Use official Node.js image with Alpine for smaller size
FROM node:22-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Install only production dependencies first for better caching
COPY package*.json ./
RUN npm ci --silent --only=production=false && npm cache clean --force

# Step 4: Copy the rest of the code
COPY . .

# Step 5: Set environment variables for optimization
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV CHOKIDAR_INTERVAL=2000
ENV GENERATE_SOURCEMAP=false
ENV FAST_REFRESH=false

# Step 6: Expose the port React runs on
EXPOSE 3000

# Step 7: Start the app with optimized settings
CMD ["npm", "start"]
