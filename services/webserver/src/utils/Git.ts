const bluebird = require("bluebird");
const child = require('child_process');
const exec = bluebird.promisify(child.exec);
const fs = require("fs");

export default class Git {

    static async repoExists(path: string): Promise<boolean> {
        try {
            await exec('git status', {cwd: path});
        } catch (e) {
            return false;
        }
        return true;
    }

    static async pull(localPath: string): Promise<void> {
        await exec(`git pull`, {cwd: localPath});
    }

    static async clone(localPath: string, remotePath: string): Promise<void> {
        if (!fs.existsSync(localPath)) {
            fs.mkdirSync(localPath);
        }
        await exec(`git clone ${remotePath} .`, {cwd: localPath});
    }

    static async getFileHash(filepath: string, repoPath: string): Promise<string> {
        let hash = await exec(`git log --pretty=format:%H ${filepath} | head -n 1`, {cwd: repoPath});
        return hash.trim();
    }

}
