FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g nodemon

COPY . .

RUN npm run build:css

EXPOSE 3000

CMD ["npm", "run", "dev"]
