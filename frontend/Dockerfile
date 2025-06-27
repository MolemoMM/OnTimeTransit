# frontend/Dockerfile

# Step 1: Use official Node.js image
FROM node:22

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy the rest of the code
COPY . .

# Step 5: Expose the port React runs on
EXPOSE 3000

# Step 6: Start the app and bind to all interfaces
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
