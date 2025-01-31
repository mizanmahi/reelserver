FROM node:20-alpine

WORKDIR /reelserver

# Install necessary packages
RUN apk add --no-cache ffmpeg bash curl

# Copy package files first
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD ["sh", "-c", "yarn migrate && yarn build && yarn start"]
