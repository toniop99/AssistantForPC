import * as childProcess from "child_process";
import * as chokidar from "chokidar";
import * as log from "electron-log";
import * as EventEmitter from "events";
import * as fsExtra from "fs-extra";
import * as path from "path";

import ConfigFile from "./ConfigFile";


export default class Observer extends EventEmitter {
    private cf = new ConfigFile();
    // tslint:disable-next-line: max-line-length

    constructor() {
        super();
    }

    public watchFolder(folder: string) {
        try {
            // tslint:disable-next-line: no-console
            console.log(
                `[${new Date().toLocaleString()}] Watching for folder changes on: ${folder}`,
            );
            log.info(`Watching for folder changes on: ${folder}`);

            const watcher: chokidar.FSWatcher = chokidar.watch(folder, { persistent: true });

            watcher.on("add", async (filePath) => {
                    // tslint:disable-next-line: no-console
                    console.log(
                        `[${new Date().toLocaleString()}] ${filePath} has been added.`,
                    );
                    log.info(`${filePath} has been added.`);

                    // Read content of new file
                    const fileContent = await fsExtra.readFile(filePath);
                    this.openFile(path.join(this.cf.getCurrentBatFolder(), fileContent + ".bat"));


                    // emit an event when new file has been added
                    this.emit("file-added", {
                        message: fileContent.toString(),
                    });

                    setTimeout(async () => {
                        await fsExtra.unlink(filePath);
                        // tslint:disable-next-line: no-console
                        console.log(
                            `[${new Date().toLocaleString()}] ${filePath} has been removed.`,
                        );
                        log.info(`${filePath} has been removed.`);

                    }, 8000);
            });
        } catch (error) {
            // tslint:disable-next-line: no-console
            console.log(error);
        }
    }

    private openFile(f: string) {
        childProcess.exec(f, (error, stdout, stderr) => {
            // tslint:disable-next-line: no-console
            console.log(stdout);
        });
    }

}
