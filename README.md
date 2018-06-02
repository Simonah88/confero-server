Confero-Server
------------
### Dependencies: ###
  * docker
  * docker-compose
  * node/npm
  
 https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04
 https://docs.docker.com/compose/install/

### Environmental variables: ###
  * CONFERO_COUCH_USER
  * CONFERO_COUCH_PW
  * CONFERO_REMOTE_URL serverurl
  * CONFERO_PORT port nginx will bind to
  
### Deployment: ###

  * bash buildprod.sh [url for app, can be host:port]
  * docker-compose -f ./services/docker-compose.prod.yml up -d

  Teardown:

  * docker-compose -f ./services/docker-compose.prod.yml down




