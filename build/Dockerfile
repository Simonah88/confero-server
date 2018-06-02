FROM node:8
RUN git clone --depth=1 https://github.com/Simonah88/confero-app.git /usr/apprepo
WORKDIR /usr/apprepo/app
RUN npm install
RUN npm run buildweb
