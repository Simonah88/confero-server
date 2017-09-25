"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require('moment');
const Log_1 = require("../utils/Log");
class EventParser {
    constructor(inputEvent) {
        this.parsedEvent = {};
        let event = this.improveConfData(inputEvent);
        this.error = !event;
        if (!this.error) {
            this.parsedEvent["Sessions"] = event["Sessions"];
            this.parsedEvent["Items"] = event["Items"];
            this.parsedEvent["People"] = event["People"];
            delete event["Sessions"];
            delete event["Items"];
            delete event["People"];
            this.parsedEvent.MetaData = event;
        }
        else {
            Log_1.default.error(inputEvent.Name + " couldn't be improved, missing fundamental information");
        }
    }
    //based on
    //https://bitbucket.org/rtholmes/conf2/src/813cccdf87ffeba7864e19da8ad9631c6ef0928e/www/js/validate.js
    //tries to clean the data to make it as usable as possible so client doesn't have to worry about things being undefined
    improveConfData(data) {
        if (typeof data == 'undefined') {
            Log_1.default.error("Missing data");
            return false;
        }
        // Required for Person:
        // Person.Name
        // Person.Affiliation
        // Persion.Id
        var peopleError = false;
        if (typeof data.People == 'undefined') {
            Log_1.default.error("People element missing (required)");
            return false;
        }
        var people = data.People;
        if (typeof data.People.length == 'undefined') {
            Log_1.default.error("People element is not an array");
            return false;
        }
        for (var i = 0; i < people.length; i++) {
            var person = people[i];
            if (typeof person.Name == 'undefined') {
                person.Name = "Unknown";
            }
            if (typeof person.Key == 'undefined') {
                person.Key = "Unknown";
            }
            if (typeof person.Affiliation == 'undefined') {
                person.Affiliation = "Unknown";
            }
            if (typeof person.Id == 'undefined') {
                person.Id = this.simpleHash(person.Key);
            }
        }
        // Required for Session:
        // Session.Title
        // Session.Type
        // Session.Id
        // Session.Day
        // Session.Time
        // Session.Location
        // Session.LocationIndex
        if (typeof data.Sessions == 'undefined') {
            Log_1.default.error("Sessions element missing (required)");
            return false;
        }
        if (typeof data.Sessions.length == 'undefined') {
            Log_1.default.error("Sessions element is not an array (required)");
            return false;
        }
        for (var i = 0; i < data.Sessions.length; i++) {
            var session = data.Sessions[i];
            if (typeof session.Title == 'undefined') {
                session.Title = "Untitled Session";
            }
            if (typeof session.Day == 'undefined') {
                session.Day = "1999-01-01";
            }
            else {
                if (!this.validateDate(session.Day)) {
                    session.Day = "1999-01-01";
                }
            }
            if (typeof session.Key == 'undefined') {
                session.Key = this.simpleHash(session.Title);
            }
            if (typeof session.Id == 'undefined') {
                session.Id = this.simpleHash(session.Key);
            }
            if (typeof session.Location == 'undefined') {
                session.Location = 'TBD';
            }
            if (typeof session.LocationIndex == 'undefined' || session.LocationIndex == '') {
                if (session.Location == '') {
                    session.LocationIndex = this.simpleHash('TBD') % 15;
                }
                else {
                    session.LocationIndex = this.simpleHash(session.Location) % 15;
                }
            }
            if (typeof session.ShortTitle == 'undefined') {
                session.ShortTitle = session.Title;
            }
            // create the display format
            session.displayTime = this.parseDateTime(session.Day).format('ddd MMMM Do -- ') + (session.Time ? session.Time : "");
            if (typeof session.Time == 'undefined') {
                session.Time = "00:00";
            }
        }
        data.Sessions.sort((a, b) => {
            a = this.parseDateTime(a.Day + " " + a.Time);
            b = this.parseDateTime(b.Day + " " + b.Time);
            if (a.unix() < b.unix()) {
                return -1;
            }
            if (a.unix() > b.unix()) {
                return 1;
            }
            return 0;
        });
        // Required for Item:
        // 
        if (typeof data.Items == 'undefined') {
            Log_1.default.error("Items element missing (required)");
            return false;
        }
        if (typeof data.Items.length == 'undefined') {
            Log_1.default.error("Items element is not an array (required)");
            return false;
        }
        for (var i = 0; i < data.Items.length; i++) {
            var item = data.Items[i];
            if (typeof item.AffiliationsString == 'undefined') {
                item.AffiliationsString = "";
            }
            if (typeof item.PersonsString == 'undefined') {
                item.PersonsString = "";
            }
            //try to clean up poorly formatted urls
            if (item.URL) {
                item.URL = decodeURIComponent(item.URL);
            }
            if (item.URLvideo) {
                item.URLvideo = decodeURIComponent(item.URLvideo);
            }
            if (typeof item.Key == 'undefined') {
                item.Key = this.simpleHash(item.Title);
            }
        }
        data.Items.sort(function (a, b) {
            if (a.Title < b.Title) {
                return -1;
            }
            if (a.Title > b.Title) {
                return 1;
            }
            return 0;
        });
        return data;
    }
    validateDate(dStr) {
        var m = moment(dStr, "YYYY-MM-DD"); // this is what we specify
        if (m.isValid() && m.year() > 2000) {
            return true;
        }
        return false;
    }
    simpleHash(input) {
        var hash = 0, i, chr;
        if (input.length === 0)
            return hash;
        for (i = 0; i < input.length; i++) {
            chr = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    ;
    parseDateTime(dtStr) {
        var m = moment(dtStr, "YYYY-MM-DD HH:mm"); // this is what we specify
        if (m.isValid() && m.year() > 2000) {
            return m;
        }
        m = moment(dtStr, "M/D/YYYY h:mm a"); // old version
        if (m.isValid()) {
            return m;
        }
        return moment(0);
    }
}
exports.default = EventParser;
//# sourceMappingURL=EventParser.js.map