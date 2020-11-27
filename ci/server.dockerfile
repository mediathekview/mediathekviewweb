FROM node:14-alpine

WORKDIR /server
COPY server/package.json server/package-lock.json ./
RUN npm ci

WORKDIR /server
COPY server .
RUN npm run build

RUN mv /server/dist /dist
