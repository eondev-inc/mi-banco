#STEP 1
FROM node:16.10-alpine as build-step

WORKDIR /client

COPY package.json /client

RUN npm install

COPY . /client

RUN npm run build

#STEP 2 Instalar NGINX

FROM nginx:1.17.1-alpine

RUN rm -rf /usr/share/nginx/html/* && rm -rf /etc/nginx/conf.d/default.conf

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-step client/dist/mi-banco /usr/share/nginx/html
