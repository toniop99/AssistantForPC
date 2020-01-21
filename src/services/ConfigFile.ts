import Store = require("electron-store");
import * as os from "os";
import * as path from "path";

export class ConfigFile {

    private configFile = new Store();

    private defaultConfigFile = {
        defaultDir : {
            BatFilesPath : path.join(os.userInfo().homedir , "/Documents/GoogleAssistantBatFiles/"),
            CloudPath : path.join(os.userInfo().homedir , "/Dropbox/GoogleAssistant/"),
        },

        customDir : {
            BatFilesPath : "",
            CloudPath : "",
        },

        startWithWindows : true,
    };

    constructor() {
        // console.log(this.configFile.path);
        // tslint:disable-next-line: max-line-length
        if (!this.configFile.has("defaultDir") || !this.configFile.has("customDir")) {
            this.setDefaultConfig();
        }

    }

    // tslint:disable-next-line: no-shadowed-variable
    public changePath(nameToChange: string, path: string) {
        this.configFile.set(nameToChange, path);
        // console.log("Changed: " + this.configFile.get(nameToChange));
    }

    public startWithWindows(value: boolean) {
        this.configFile.set("startWithWindows", value);
    }

    public existcustomDirBatFilesPath(): boolean {
        if (this.configFile.get("customDir.BatFilesPath") === "") {
            return false;
        }
        return true;
    }

    public existcustomDirCloudPath(): boolean {
        if (this.configFile.get("customDir.CloudPath") === "") {
            return false;
        }
        return true;
    }

    public getItemValue(nameItem: string): string {
        return this.configFile.get(nameItem);
    }

    public getStartWithWindows(): boolean {
        return this.configFile.get("startWithWindows");
    }

    public getPathConfigFile(): string {
        return this.configFile.path;
    }

    private setDefaultConfig() {
        this.configFile.set(this.defaultConfigFile);
    }



}
