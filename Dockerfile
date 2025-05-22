FROM node:22-alpine

WORKDIR /usr/src/app

ARG NGROK_AUTHTOKEN
ENV NGROK_AUTHTOKEN=$NGROK_AUTHTOKEN

COPY package*.json ./

RUN npm install && npm install -g nodemon && npm install --save-dev concurrently

RUN npm install --save-dev webpack webpack-cli

RUN npm install -g ngrok

COPY . .

RUN npx prisma db push

RUN npx tsc

RUN echo "Token from env: $NGROK_AUTHTOKEN" > ../test.txt

EXPOSE 3000

CMD ["sh", "-c", "ngrok config add-authtoken $NGROK_AUTHTOKEN && ngrok http https://localhost:$PORT --host-header=rewrite --inspect=false --log=stdout > ngrok.log & sleep 2 && npm run dev"]
