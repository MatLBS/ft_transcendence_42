FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g nodemon && npm install --save-dev concurrently

RUN npm install --save-dev webpack webpack-cli

COPY . .

RUN npx prisma db push

RUN npx tsc

EXPOSE 3000

CMD ["npm", "run", "dev"]