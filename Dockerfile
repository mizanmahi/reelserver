FROM node:20-alpine

WORKDIR /reelserver

# Install ffmpeg
RUN apk add --no-cache ffmpeg bash curl


COPY package.json yarn.lock ./


RUN yarn install --frozen-lockfile


COPY . .


EXPOSE 5000

# for production 
# CMD ["sh", "-c", "yarn migrate && yarn build && yarn start"] 
#for development
CMD ["sh", "-c", "yarn migrate && yarn dev"] 
