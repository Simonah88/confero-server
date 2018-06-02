#!/bin/bash
docker build --no-cache --build-arg remote_url=${CONFERO_REMOTE_URL} ./build/ -t confwebbuild
docker run --name temp-confwebbuild confwebbuild /bin/true
rm -f ./services/nginx/www
docker cp temp-confwebbuild:/usr/apprepo/www ./services/nginx/www
docker rm temp-confwebbuild
docker-compose -f ./services/docker-compose.prod.yml build