import Store = require("electron-store");
import * as os from "os";
import * as path from "path";
const defaultBrowser = require("x-default-browser");

// Singleton class
export default class ConfigFile {

    private static instance: ConfigFile;

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
        language: "english",
        configuration : {
            show: false,
            useFolders: true,
            useDropbox: false,
        }
    };

    private constructor() {
        // TODO Check all the config files to guarantee if we need set the default config or not. 
        if (!this.configFile.has("defaultDir") || !this.configFile.has("customDir")) {
            this.setDefaultConfig();
        }

        // defaultBrowser((err: any, res: any) => {
        //     console.log(res);
        // });
    }

    public static getInstace(): ConfigFile {
        if (!ConfigFile.instance) {
            ConfigFile.instance = new ConfigFile();
        }
        return ConfigFile.instance;
    }
    
    public changeConfig(key: string, value: any) {
        this.configFile.set(key, value);
        // console.log("Changed: " + this.configFile.get(nameToChange));
    }

    public getItemValue(nameItem: string): any {
        return this.configFile.get(nameItem);
    }

    // Return the path where this file is placed.
    public getPathConfigFile(): string {
        return this.configFile.path;
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
        if (this.configFile.get("customDir.BatFilesPath") === "") {
            return false;
        }
        return true;
    }

    private setDefaultConfig() {
        this.configFile.set(this.defaultConfigFile);
    }

    private existcustomDirCloudPath(): boolean {
        if (this.configFile.get("customDir.CloudPath") === "") {
            return false;
        }
        return true;
    }

}
