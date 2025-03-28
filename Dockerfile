FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g nodemon && npm install --save-dev concurrently

COPY . .

RUN npx tsc

EXPOSE 3000

CMD ["npm", "run", "dev"]
# CMD ["sh", "-c", "npx tsc && nodemon server.js"]
