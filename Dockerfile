# Build Stage
FROM node:16.15.1-alpine AS build

WORKDIR /tmp/build
COPY package*.json ./

RUN npm ci

COPY . .
RUN npm run build
RUN rm -rf src

# Image
FROM node:16.15.1-alpine

ARG DATE_CREATED
ARG VERSION

LABEL org.opencontainers.image.created=$DATE_CREATED
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.authors="moonstar-x"
LABEL org.opencontainers.image.vendor="moonstar-x"
LABEL org.opencontainers.image.title="Automation Service"
LABEL org.opencontainers.image.description="A custom automation service to handle some notifications with a Workflow based design."
LABEL org.opencontainers.image.source="https://github.com/moonstar-x/automation-service"

WORKDIR /opt/app
COPY package*.json ./

RUN npm ci --only=prod
COPY --from=build /tmp/build ./

ENV NODE_ENV=production

CMD ["node", "./build/src/index.js"]
