ARG CLIENT_DIST_IMAGE
FROM ${CLIENT_DIST_IMAGE} as client

ARG SERVER_DIST_IMAGE
FROM ${SERVER_DIST_IMAGE} as server

COPY --from=client /dist /dist/client


FROM node:10-alpine

COPY --from=server /dist /mediathekviewweb

CMD [ "node", "/mediathekviewweb/app.js" ]
