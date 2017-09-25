"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Collection of logging methods. Useful for making the output easier to read and understand.
 *
 * @param msg
 */
/* tslint:disable:no-console */
class Log {
    static trace(msg) {
        console.log("<T> " + new Date().toLocaleString() + ": " + msg);
    }
    static info(msg) {
        console.log("<I> " + new Date().toLocaleString() + ": " + msg);
    }
    static warn(msg) {
        console.error("<W> " + new Date().toLocaleString() + ": " + msg);
    }
    static error(msg) {
        console.error("<E> " + new Date().toLocaleString() + ": " + JSON.stringify(msg));
    }
    static test(msg) {
        console.log("<X> " + new Date().toLocaleString() + ": " + msg);
    }
}
exports.default = Log;
//# sourceMappingURL=Log.js.map