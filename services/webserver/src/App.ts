import * as express from "express"
import GitDB from "./Data/GitDB"
import Log from "./utils/Log"

let app = express();

let dbhost = process.env.DEVELOPMENT ? "localhost" : "couchdb";

let gitDB = new GitDB({
    couchoptions: {
        baseUrl: `http://${process.env.CONFERO_COUCH_USER}:${process.env.CONFERO_COUCH_PW}@${dbhost}:5984`,
        requestTimeout: 100000,
        verifyCertificate: false
    },
        remotePath: "https://github.com/rtholmes/conf-data.git",
        localPath: "../../shared/conf-data"
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

app.listen(3030, function () {
    console.log('Webapp listening on port 3030')
});

