FROM nginx:latest

LABEL maintainer="basile.1845115@studenti.uniroma1.it"

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80