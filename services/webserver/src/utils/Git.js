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
const child = require('child_process');
const exec = bluebird.promisify(child.exec);
const fs = require("fs");
class Git {
    static repoExists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield exec('git status', { cwd: path });
            }
            catch (e) {
                return false;
            }
            return true;
        });
    }
    static pull(localPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec(`git pull`, { cwd: localPath });
        });
    }
    static clone(localPath, remotePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs.existsSync(localPath)) {
                fs.mkdirSync(localPath);
            }
            yield exec(`git clone ${remotePath} .`, { cwd: localPath });
        });
    }
    static getFileHash(filepath, repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let hash = yield exec(`git log --pretty=format:%H ${filepath} | head -n 1`, { cwd: repoPath });
            return hash.trim();
        });
    }
}
exports.default = Git;
//# sourceMappingURL=Git.js.map