FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g nodemon && npm install --save-dev concurrently

COPY . .

RUN npx tsc

RUN npx prisma migrate dev --name init

EXPOSE 3000

CMD ["sh", "-c", "npm run build:css && npm run dev"]
