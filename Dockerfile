# Use base image
FROM elilillyco-lilly-docker.jfrog.io/node:lts-alpine

# Set working directory
WORKDIR /app

# Copy .npmrc with auth settings first
COPY .npmrc .npmrc

# Copy package definition files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
