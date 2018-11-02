ARG CLIENT_BUILD_IMAGE
FROM ${CLIENT_BUILD_IMAGE} as client

ARG SERVER_BUILD_IMAGE
FROM ${SERVER_BUILD_IMAGE} as server

COPY --from=client /dist /dist/client


FROM node:10-alpine

COPY --from=server /dist /mediathekviewweb

CMD [ "node", "/mediathekviewweb/app.js" ]