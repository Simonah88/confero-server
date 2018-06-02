#!/bin/bash
docker build --no-cache ./build/ -t confwebbuild
docker run --name temp-confwebbuild confwebbuild /bin/true
rm -rf ./services/nginx/www
docker cp temp-confwebbuild:/usr/apprepo/www ./services/nginx/www
docker rm temp-confwebbuild
docker image rm confwebbuild:latest
docker-compose -f ./services/docker-compose.prod.yml build
