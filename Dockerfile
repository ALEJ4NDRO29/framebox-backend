# build

FROM node:12.16.3-alpine3.9 as build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start"]