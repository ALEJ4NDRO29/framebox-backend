FROM node:12.16.2-alpine3.10

RUN mkdir /app
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# RUN npm install -g nodemon

                    # start
CMD ["npm", "run", "start"]