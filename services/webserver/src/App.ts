import * as express from "express"
import GitDB from "./Data/GitDB"
import Log from "./utils/Log"
const path = require('path');

let app     = express();
let dev     = process.env.NODE_ENV === "development"
let dbhost  =  dev ? "localhost" : "couchdb";
let gitpath = dev ? path.normalize(process.cwd() + "../../shared/") : "/usr/shared/";

console.log(process.env)

let gitDB = new GitDB({
        couchoptions: {
            baseUrl: `http://${process.env.CONFERO_COUCH_USER}:${process.env.CONFERO_COUCH_PW}@${dbhost}:5984`,
            requestTimeout: 100000,
            verifyCertificate: false
        },
        remotePath: "https://github.com/rtholmes/conf-data.git",
        localPath: gitpath 
    });

gitDB.update().catch(function(e){
    Log.error(e)
});

app.get('/webhook', function (req, res) {
    gitDB.update().then(()=>{

        }
    ).catch(function(e){
        Log.error(e)
    });
    res.send('Hi Earth.');
});

app.listen(3033, function () {
    console.log('Webapp listening on port 3030')
});

