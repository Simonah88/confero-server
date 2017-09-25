var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const dbdriver = require('couchdb-promises');
let couchoptions = {
    baseUrl: `http://${process.env.CONFERO_COUCH_USER}:${process.env.CONFERO_COUCH_PW}@localhost:5984`,
    requestTimeout: 100000,
    verifyCertificate: false
};
let couchdb = dbdriver(couchoptions);
let wipe = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let databases = yield couchdb.listDatabases();
        for (let database of databases.data) {
            if (database.indexOf('_') == -1) {
                couchdb.deleteDatabase(database);
            }
        }
    });
};
wipe();
//# sourceMappingURL=wipecouch.js.map