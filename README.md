Confero-Server
------------
### Dependencies: ###
  * docker
  * docker-compose
  
 https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04
 https://docs.docker.com/compose/install/
 
 Install script for base ubuntu 16.04 server is in project root(setupubuntu1604server.sh)

### Environmental variables: ###
  * CONFERO_COUCH_USER
  * CONFERO_COUCH_PW
  * CONFERO_PORT - port nginx will bind to
  
### Deployment: ###

  * bash buildprod.sh 
  * docker-compose -f ./services/docker-compose.prod.yml up -d

  Teardown:

  * docker-compose -f ./services/docker-compose.prod.yml down




