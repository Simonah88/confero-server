"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const GitDB_1 = require("./Data/GitDB");
const Log_1 = require("./utils/Log");
let app = express();
let dbhost = process.env.DEVELOPMENT ? "localhost" : "couchdb";
let gitDB = new GitDB_1.default({
    couchoptions: {
        baseUrl: `http://${process.env.CONFERO_COUCH_USER}:${process.env.CONFERO_COUCH_PW}@${dbhost}:5984`,
        requestTimeout: 100000,
        verifyCertificate: false
    },
    remotePath: "https://github.com/rtholmes/conf-data.git",
    localPath: "../../shared/conf-data"
});
gitDB.update().catch(function (e) {
    Log_1.default.error(e);
});
app.get('/webhook', function (req, res) {
    gitDB.update().then(() => {
    }).catch(function (e) {
        Log_1.default.error(e);
    });
    res.send('Hi Earth.');
});
app.listen(3033, function () {
    console.log('Webapp listening on port 3030');
});
//# sourceMappingURL=App.js.map