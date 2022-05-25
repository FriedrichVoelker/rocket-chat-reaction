FROM node:lts-alpine
WORKDIR /usr/src/rocketchatreaction

COPY package*.json ./

RUN npm install
COPY . .
CMD [ "node", "index.js" ]