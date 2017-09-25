"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird = require("bluebird");
const fs = require('fs');
const readDir = bluebird.promisify(fs.readdir);
const readFile = bluebird.promisify(fs.readFile);
const path = require('path');
const dbDriver = require('couchdb-promises');
const deepEqual = require('deep-equal');
const Log_1 = require("../utils/Log");
const Git_1 = require("../utils/Git");
const EventParser_1 = require("./EventParser");
class GitDB {
    constructor(options) {
        this.EVENT_METADATA_ID = "MetaData";
        this.EVENT_SESSIONS_ID = "Sessions";
        this.EVENT_ITEMS_ID = "Items";
        this.EVENT_PEOPLE_ID = "People";
        this.couchdb = dbDriver(options.couchoptions);
        this.remoteRepoPath = options.remotePath;
        this.localRepoPath = path.normalize(process.cwd() + "/" + options.localPath);
    }
    //Checks if the local repo already exists creating it if not then updating the database
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            let localRepoExists = yield Git_1.default.repoExists(this.localRepoPath);
            if (localRepoExists) {
                yield Git_1.default.pull(this.localRepoPath);
            }
            else {
                yield Git_1.default.clone(this.localRepoPath, this.remoteRepoPath);
            }
            yield this._updateDB();
        });
    }
    //gets all the filenames from the data folder then updates/inserts them as needed
    _updateDB() {
        return __awaiter(this, void 0, void 0, function* () {
            let jsonFilesPath = path.join(this.localRepoPath, "/data/");
            let jsonFilenames = yield readDir(jsonFilesPath);
            for (let filename of jsonFilenames) {
                if (filename != "SampleData.json")
                    this._updateJSON(filename).catch((err) => {
                        Log_1.default.error("FILE: " + filename + " had error " + JSON.stringify(err));
                    });
            }
            this._updateIndex().catch((err) => {
                Log_1.default.error("INDEX ERROR: " + JSON.stringify(err));
            });
        });
    }
    //parses the JSON from the files then decides to insert or update the database
    _updateJSON(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            //dbnames have to be lowercase and start with letters
            let dbname = "couch" + filename.toLowerCase().split(".")[0];
            let githash = yield Git_1.default.getFileHash(path.join(this.localRepoPath, "/data/", filename), this.localRepoPath);
            let inCouch = yield this._isInCouch(dbname, this.EVENT_METADATA_ID);
            let outOfDate;
            if (inCouch) {
                outOfDate = yield this._isOutofDate(dbname, this.EVENT_METADATA_ID, githash);
            }
            if (!inCouch || outOfDate) {
                let data = yield readFile(path.join(this.localRepoPath, "/data/", filename), "utf8");
                let json = JSON.parse(data.replace(/&quot;/g, '\\"'));
                json["githash"] = githash;
                let eventProccesor = new EventParser_1.default(json);
                if (eventProccesor.error)
                    throw new Error("Event for " + dbname + " had error parsing event");
                if (!inCouch)
                    yield this._insertEvent(dbname, eventProccesor.parsedEvent);
                if (outOfDate)
                    yield this._updateEvent(dbname, eventProccesor.parsedEvent);
            }
        });
    }
    //Compares githash from the latest git pull to stored value in git to check if it is out of date
    _isOutofDate(dbname, document, githash) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbdocument = yield this.couchdb.getDocument(dbname, document);
            return dbdocument.data[document]["githash"] != githash;
        });
    }
    _insertEvent(dbname, event) {
        return __awaiter(this, void 0, void 0, function* () {
            let documentsToInsert = [this.EVENT_METADATA_ID, this.EVENT_ITEMS_ID, this.EVENT_PEOPLE_ID, this.EVENT_SESSIONS_ID];
            try {
                yield this.couchdb.createDatabase(dbname);
            }
            catch (err) {
                //if database already exists don't worry about it
                if (err.status != 412)
                    throw err;
            }
            documentsToInsert.forEach((documentName) => {
                let toInsert = {};
                toInsert[documentName] = event[documentName];
                this.couchdb.createDocument(dbname, toInsert, documentName)
                    .catch((err) => {
                    Log_1.default.error("Failed to create document: " + documentName + "for db: " + dbname);
                    Log_1.default.error(err);
                });
            });
        });
    }
    //Updates subparts of events so if nothing was changed in people it won't need to be pulled by client
    _updateEvent(dbname, event) {
        return __awaiter(this, void 0, void 0, function* () {
            let documentsToUpdate = [this.EVENT_METADATA_ID, this.EVENT_ITEMS_ID, this.EVENT_PEOPLE_ID, this.EVENT_SESSIONS_ID];
            documentsToUpdate.forEach((documentName) => __awaiter(this, void 0, void 0, function* () {
                let couchVersion = yield this.couchdb.getDocument(dbname, documentName);
                let gitVersion = event[documentName];
                if (!deepEqual(couchVersion[documentName], gitVersion, { strict: true })) {
                    let toUpdate = {};
                    toUpdate[documentName] = event[documentName];
                    toUpdate["_rev"] = couchVersion.data["_rev"];
                    this.couchdb.createDocument(dbname, toUpdate, documentName)
                        .catch((err) => {
                        Log_1.default.error("Failed to update document: " + documentName + "for db: " + dbname);
                        Log_1.default.error(err);
                    });
                }
            }));
        });
    }
    //checks if the event already exists in couch
    _isInCouch(dbname, document) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.couchdb.getDocument(dbname, document);
            }
            catch (error) {
                if (error.status == 404)
                    return false;
                Log_1.default.error(error);
            }
            return true;
        });
    }
    //index file is used by main page
    _updateIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            //creates index file if it doesn't already exist
            let inCouch = yield this._isInCouch("index", "index");
            if (!inCouch) {
                yield this.couchdb.createDatabase("index");
                yield this.couchdb.createDocument("index", {}, "index");
            }
            let data = yield readFile(path.join(this.localRepoPath, "/EventIndex.json"), "utf8");
            let json = JSON.parse(data.replace(/&quot;/g, '\\"'));
            let events = json["Events"];
            events.sort(function (a, b) {
                return Date.parse(b.StartDate) - Date.parse(a.StartDate);
            });
            let couchDocument = yield this.couchdb.getDocument("index", "index");
            yield this.couchdb.createDocument("index", { Events: events, "_rev": couchDocument.data["_rev"] }, "index");
        });
    }
}
exports.default = GitDB;
//# sourceMappingURL=GitDB.js.map