FROM node:16-alpine

WORKDIR /client
COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client .
RUN npm run build

RUN mv /client/dist /dist
