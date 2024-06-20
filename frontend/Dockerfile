FROM node:20 as builder

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]

