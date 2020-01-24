import Store = require("electron-store");
import * as os from "os";
import * as path from "path";

export default class ConfigFile {

    private static configFile = new Store();

    private static defaultConfigFile = {
        defaultDir : {
            BatFilesPath : path.join(os.userInfo().homedir , "/Documents/GoogleAssistantBatFiles/"),
            CloudPath : path.join(os.userInfo().homedir , "/Dropbox/GoogleAssistant/"),
        },

        customDir : {
            BatFilesPath : "",
            CloudPath : "",
        },

        startWithWindows : true,
        language: "english",
        configuration : {
            show: false,
            useFolders: true,
            useDropbox: false,
        }
    };

    constructor() {
        // console.log(this.configFile.path);
        if (!ConfigFile.configFile.has("defaultDir") || !ConfigFile.configFile.has("customDir")) {
            this.setDefaultConfig();
        }
    }

    public changeConfig(key: string, value: any) {
        ConfigFile.configFile.set(key, value);
        // console.log("Changed: " + this.configFile.get(nameToChange));
    }

    public getItemValue(nameItem: string): any {
        return ConfigFile.configFile.get(nameItem);
    }

    public getPathConfigFile(): string {
        return ConfigFile.configFile.path;
    }

    public getCurrentCloudFolder(): string {
        if(this.existcustomDirCloudPath()){
            return this.getItemValue("customDir.CloudPath");
        }else {
            return this.getItemValue("defaultDir.CloudPath");
        }
    }

    public getCurrentBatFolder(): string {
        if (this.existcustomDirBatFilesPath()){
            return this.getItemValue("customDir.BatFilesPath");
        } else {
            return this.getItemValue("defaultDir.BatFilesPath");
        }
    }

    public existcustomDirBatFilesPath(): boolean {
        if (ConfigFile.configFile.get("customDir.BatFilesPath") === "") {
            return false;
        }
        return true;
    }

    private setDefaultConfig() {
        ConfigFile.configFile.set(ConfigFile.defaultConfigFile);
    }

    private existcustomDirCloudPath(): boolean {
        if (ConfigFile.configFile.get("customDir.CloudPath") === "") {
            return false;
        }
        return true;
    }

}
