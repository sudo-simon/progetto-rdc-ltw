FROM node:latest

LABEL maintainer="basle.1845115@studenti.uniroma1.it"

WORKDIR /usr/src/app

VOLUME [ "/usr/src/app" ]


ENV NODE_ENV=development
ENV PORT=9998

EXPOSE 9998


