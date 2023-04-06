FROM node:16.15.1-alpine

WORKDIR /usr/src/app

COPY package.json ./

COPY . .
RUN yarn
RUN npm i @nestjs/class-transformer
EXPOSE 3001

CMD ["yarn", "start:docker"]