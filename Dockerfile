# Use the Node.js image
FROM node:lts-alpine

# Argument for setting the environment
ARG ENVIRONMENT=production

# Set the working directory inside the container
WORKDIR /app

# Install dependencies early to leverage caching
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Update environment variables in the .env file and build the application
RUN sed -i "s/NODE_ENV=.*/NODE_ENV=${ENVIRONMENT}/g" .env && \
    sed -i "s/NEXT_PUBLIC_APP_ENV=.*/NEXT_PUBLIC_APP_ENV=${ENVIRONMENT}/g" .env && \
    npm run build && \
    npm prune --omit=dev --legacy-peer-deps

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
