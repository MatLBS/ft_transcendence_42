FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g nodemon && npm install --save-dev concurrently

RUN npm install --save-dev webpack webpack-cli

COPY . .

RUN npx tsc

EXPOSE 3000

CMD ["sh", "-c", "npm run build:css && npm run build:client && npm run dev"]
