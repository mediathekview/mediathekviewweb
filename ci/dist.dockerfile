ARG CLIENT_DIST_IMAGE
ARG SERVER_DIST_IMAGE

FROM ${CLIENT_DIST_IMAGE} as client

FROM ${SERVER_DIST_IMAGE} as server

COPY --from=client /dist /dist/client


FROM node:20-alpine

COPY --from=server /dist /mediathekviewweb

CMD [ "node", "/mediathekviewweb/app.js" ]
