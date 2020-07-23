FROM node:13.7.0-stretch

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

CMD npm start

EXPOSE 3000

