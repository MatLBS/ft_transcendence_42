FROM node:18

RUN apt-get update
RUN apt-get upgrade -y

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
