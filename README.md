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
  * CONFERO_PORT
  
### Deployment: ###
in webserver:
npm install
npm run build
in root:
docker-compose up --build 

pull:
https://github.com/Simonah88/confero-app
in the app folder:
npm install
npm run buildweb

