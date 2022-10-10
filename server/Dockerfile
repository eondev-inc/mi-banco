#STAGE 1

FROM node:12-alpine as build-step

WORKDIR /server

COPY package.json /server

RUN npm install

COPY . /server

RUN npm install typescript -g

RUN npm run build

CMD ["node", "./dist/bin/www.js"]




