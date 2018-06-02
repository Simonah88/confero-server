FROM nginx:1.12.0
COPY /www /usr/share/nginx/html
RUN touch /usr/share/nginx/html/cordova.js
COPY nginx.conf /etc/nginx/nginx.conf