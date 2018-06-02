FROM node:8
ARG remote_url
ENV CONFERO_REMOTE_URL=$remote_url
RUN git clone --depth=1 https://github.com/Simonah88/confero-app.git /usr/apprepo
WORKDIR /usr/apprepo/app
RUN npm install
RUN npm run buildweb
