const dbdriver = require('couchdb-promises');

let couchoptions = {
    baseUrl: `http://${process.env.CONFERO_COUCH_USER}:${process.env.CONFERO_COUCH_PW}@localhost:5984`,
        requestTimeout: 100000,
        verifyCertificate: false
};

let couchdb = dbdriver(couchoptions);

let wipe = async function(){
    let databases = await couchdb.listDatabases();

    for(let database of databases.data){
        if(database.indexOf('_') == -1){
            couchdb.deleteDatabase(database);
        }
    }
};

wipe();

