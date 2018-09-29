FROM node:10-alpine as builder

WORKDIR /
COPY client client
COPY server server

WORKDIR /client
RUN npm ci
RUN npm run build

WORKDIR /server
RUN npm ci
RUN npm run build

RUN mv /client/dist /server/dist/client
RUN mv /server/dist /dist


FROM node:10-alpine

COPY --from=builder /dist /mediathekviewweb

CMD [ "node", "/mediathekviewweb/app.js" ]