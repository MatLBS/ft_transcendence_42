FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install -g nodemon && npm install --save-dev concurrently

COPY . .

RUN npx tsc

# RUN chmod -R 777 srcs/public/style/

# RUN ls -l srcs/public/style/ && npm run build:css

# RUN npx prisma generate --schema=./prisma/schema.prisma 

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate --schema=./prisma/schema.prisma && npm run build:css && npm run dev"]