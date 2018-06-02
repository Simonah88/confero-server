#!/bin/bash
#Usage buildprod.sh [remotehost]
echo "Remote URL is: ${1}"
docker build --no-cache --build-arg remote_url=$1 ./build/ -t confwebbuild
docker run --name temp-confwebbuild confwebbuild /bin/true
rm -rf ./services/nginx/www
docker cp temp-confwebbuild:/usr/apprepo/www ./services/nginx/www
docker rm temp-confwebbuild
docker-compose -f ./services/docker-compose.prod.yml build
