# Use official Node.js image for development
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy env args so you can pass them when building the image if needed
ARG NEXT_PUBLIC_COMPLEX_URL
ENV NEXT_PUBLIC_COMPLEX_URL=$NEXT_PUBLIC_COMPLEX_URL

ARG NEXT_PUBLIC_MAMAD_URL
ENV NEXT_PUBLIC_MAMAD_URL=$NEXT_PUBLIC_MAMAD_URL

# Install dependencies including dev dependencies for dev mode
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files
COPY . .

# Expose the default Next.js dev port
EXPOSE 3000

# Start Next.js in development mode
CMD ["npx", "next", "dev"]

