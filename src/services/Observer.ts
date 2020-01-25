import * as childProcess from "child_process";
import * as chokidar from "chokidar";
import * as log from "electron-log";
import * as EventEmitter from "events";
import * as fsExtra from "fs-extra";
import * as path from "path";

import ConfigFile from "./ConfigFile";


export default class Observer extends EventEmitter {
    private cf = ConfigFile.getInstace();

    private watcher: chokidar.FSWatcher;

    constructor() {
        super();
    }

    public watchFolder(folder: string) {
        this.watcher = null;
        try {
            log.info(`Watching for folder changes on: ${folder}`);

            const watcher: chokidar.FSWatcher = chokidar.watch(folder, { persistent: true });

            watcher.on("add", async (filePath) => {
                    
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
                        
                        log.info(`${filePath} has been removed.`);

                    }, 4000);
            });
        } catch (error) {
            // tslint:disable-next-line: no-console
            log.error(error);
        }
    }

    private openFile(f: string) {
        childProcess.exec(f, (error, stdout, stderr) => {
            // tslint:disable-next-line: no-console
            console.log(stdout);
        });
    }

}
