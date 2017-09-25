const bluebird = require("bluebird");
const fs = require('fs');
const readDir = bluebird.promisify(fs.readdir);
const readFile = bluebird.promisify(fs.readFile);
const path = require('path');
const dbDriver = require('couchdb-promises');
const deepEqual = require('deep-equal');

import Log from "../utils/Log"
import Git from "../utils/Git"
import EventProccesor from "./EventParser"

export default class GitDB {
    private couchdb: any;
    private remoteRepoPath: string;
    private localRepoPath: string;
    private EVENT_METADATA_ID = "MetaData";
    private EVENT_SESSIONS_ID = "Sessions";
    private EVENT_ITEMS_ID = "Items";
    private EVENT_PEOPLE_ID = "People";


    constructor(options) {
        this.couchdb = dbDriver(options.couchoptions);
        this.remoteRepoPath = options.remotePath;
        this.localRepoPath = path.normalize(process.cwd() + "/" + options.localPath);
    }

    //Checks if the local repo already exists creating it if not then updating the database
    async update(): Promise<void> {
        let localRepoExists = await Git.repoExists(this.localRepoPath);

        if (localRepoExists) {
            await Git.pull(this.localRepoPath);
        } else {
            await Git.clone(this.localRepoPath, this.remoteRepoPath);
        }
        await this._updateDB();

    }

    //gets all the filenames from the data folder then updates/inserts them as needed
    private async _updateDB(): Promise<void> {
        let jsonFilesPath = path.join(this.localRepoPath, "/data/");
        let jsonFilenames = await readDir(jsonFilesPath);

        for (let filename of jsonFilenames) {
            if (filename != "SampleData.json")
                this._updateJSON(filename).catch((err)=>{
                    Log.error("FILE: " + filename + " had error " + JSON.stringify(err));
                })
        }

        this._updateIndex().catch((err)=>{
            Log.error("INDEX ERROR: " + JSON.stringify(err));
        })
    }

    //parses the JSON from the files then decides to insert or update the database
    private async _updateJSON(filename): Promise<void> {
        //dbnames have to be lowercase and start with letters
        let dbname = "couch" + filename.toLowerCase().split(".")[0];
        let githash = await Git.getFileHash(path.join(this.localRepoPath, "/data/", filename), this.localRepoPath);

        let inCouch: boolean = await this._isInCouch(dbname, this.EVENT_METADATA_ID);
        let outOfDate: boolean;
        if (inCouch) {
            outOfDate = await this._isOutofDate(dbname, this.EVENT_METADATA_ID, githash);
        }

        if (!inCouch || outOfDate) {
            let data = await readFile(path.join(this.localRepoPath, "/data/", filename), "utf8");
            let json = JSON.parse(data.replace(/&quot;/g, '\\"'));
            json["githash"] = githash;

            let eventProccesor = new EventProccesor(json);
            if(eventProccesor.error)
                throw new Error("Event for " + dbname + " had error parsing event");

            if (!inCouch)
                await this._insertEvent(dbname, eventProccesor.parsedEvent);

            if (outOfDate)
                await this._updateEvent(dbname, eventProccesor.parsedEvent);
        }

    }

    //Compares githash from the latest git pull to stored value in git to check if it is out of date
    private async _isOutofDate(dbname: string, document: string, githash: string) {
        let dbdocument = await this.couchdb.getDocument(dbname, document);
        return dbdocument.data[document]["githash"] != githash
    }

    private async _insertEvent(dbname: string, event: any): Promise<void> {

        let documentsToInsert: string[] = [this.EVENT_METADATA_ID, this.EVENT_ITEMS_ID, this.EVENT_PEOPLE_ID, this.EVENT_SESSIONS_ID];
        try{
            await this.couchdb.createDatabase(dbname);
        } catch(err){
            //if database already exists don't worry about it
            if(err.status != 412)
                throw err;
        }

        documentsToInsert.forEach((documentName: string)=>{
            let toInsert = {};
            toInsert[documentName] = event[documentName];
            this.couchdb.createDocument(dbname, toInsert, documentName)
                .catch((err)=>{
                        Log.error("Failed to create document: " + documentName + "for db: " +dbname);
                        Log.error(err);
                    }
                )
        })

    }

    //Updates subparts of events so if nothing was changed in people it won't need to be pulled by client
    private async _updateEvent(dbname: string, event: any): Promise<void> {
        let documentsToUpdate: string[] = [this.EVENT_METADATA_ID, this.EVENT_ITEMS_ID, this.EVENT_PEOPLE_ID, this.EVENT_SESSIONS_ID];

        documentsToUpdate.forEach(async (documentName: string) => {
            let couchVersion = await this.couchdb.getDocument(dbname, documentName);
            let gitVersion = event[documentName];

            if(!deepEqual(couchVersion[documentName], gitVersion, {strict: true})){
                let toUpdate = {};
                toUpdate[documentName] =  event[documentName];
                toUpdate["_rev"] = couchVersion.data["_rev"];
                this.couchdb.createDocument(dbname, toUpdate, documentName)
                    .catch((err)=>{
                            Log.error("Failed to update document: " + documentName + "for db: " +dbname);
                            Log.error(err);
                        }
                    )
            }

        });

    }

    //checks if the event already exists in couch
    private async _isInCouch(dbname: string, document: string): Promise<boolean> {
        try {
            await this.couchdb.getDocument(dbname, document);
        } catch (error) {
            if (error.status == 404)
                return false;
            Log.error(error);
        }
        return true;
    }

    //index file is used by main page
    private async _updateIndex(): Promise<void> {
        //creates index file if it doesn't already exist
        let inCouch: boolean = await this._isInCouch("index", "index");
        if (!inCouch) {
            await this.couchdb.createDatabase("index");
            await this.couchdb.createDocument("index", {}, "index");
        }
        let data = await readFile(path.join(this.localRepoPath, "/EventIndex.json"), "utf8");
        let json = JSON.parse(data.replace(/&quot;/g, '\\"'));
        let events = json["Events"];

        events.sort(function (a, b) {
            return Date.parse(b.StartDate) - Date.parse(a.StartDate);
        });

        let couchDocument = await this.couchdb.getDocument("index", "index");
        await this.couchdb.createDocument("index", {Events: events, "_rev": couchDocument.data["_rev"]}, "index");

    }


}
