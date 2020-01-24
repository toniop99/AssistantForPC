import { app, BrowserWindow, dialog, ipcMain, Menu, Notification, Tray } from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";
import * as os from "os";
import logFile from "electron-log";

/***** My files imports *****/
import Observer from "../services/Observer";
import ConfigFile from "../services/ConfigFile";
import { mainWindowText } from "./mainWindowText.controller";

mainWindowText();

export default class Main {

    /***** VARIABLES *****/

    // Access to the Config File Doucument.
    private configFile = new ConfigFile();

    // Allow to obtain a lock for run a single instante of the app
    private obtainLock = app.requestSingleInstanceLock();

    // Used to watch changes on the selected cloud folder.
    private observer: Observer = new Observer();


    // Variables used to the control of the app and the main window.
    private window: BrowserWindow = null;
    private tray: Tray = null;
    private icon: string = path.join(__dirname, "../../../public/images/icons/icon64.png");
    private mainIndex: string = (path.join(__dirname, "../../../public/index.hbs"));

    private canExit: boolean = false;

    // Variables to control the tutorial window.
    private tutorialWindow: BrowserWindow = null;
    private tutorialIndex: string = (path.join(__dirname, "../../../public/tutorialIndex.hbs"));
    private canOpenTutorial: boolean = true;


    private appInfo = {
        appName: app.getName(),
        appPath: __dirname,
        appVersion: "1.0.2",
        configPath: this.configFile.getPathConfigFile(),
        logsPath: path.join(os.userInfo().homedir, "/ApPData/Roaming", app.getName(), "/logs"),
    };

    /***** * *****/

    constructor() {}

    public startApp() {
        app.setName("Google Assistant For Your PC");
        this.observeFolder();
        this.oneInstance();
        this.startOnTurnOn();

        app.on("ready", () => {
            autoUpdater.logger = logFile;
            autoUpdater.checkForUpdatesAndNotify();

            this.createMainWindow();
            this.createTopMenu();
            this.createTray();
        });

        app.on("before-quit", () => {
            // this.exitApp();
        });

        ipcMain.on("getTutorial", () => {
            this.window.webContents.send("openTutorial", {
                tutorial: this.createTutorialWindow(),
            });
        });

        ipcMain.on("changeCloudPath", () => {
            this.observeFolder();
        });

        ipcMain.on("restart_app_update", () => {
            this.canExit = true;
            autoUpdater.quitAndInstall();
        });

        autoUpdater.on("update-available", () => {
            this.window.webContents.send("update_available");
          });

        autoUpdater.on("update-downloaded", () => {
            this.window.webContents.send("update_downloaded");
        });
    }

    private observeFolder() {
        this.observer.on("file-added", (log) => {
            logFile.info(log.message);
        });
        this.observer.watchFolder(this.configFile.getCurrentCloudFolder());
    }

    // Function used to check if the app can start with the SO.
    private startOnTurnOn(): boolean {
        // See the config to check the user option.
        if (this.configFile.getItemValue("startWithWindows")) {
            app.setLoginItemSettings({
                openAtLogin: true,
                path: app.getPath("exe"),
            });
            // The app can start on login.
            return true;
        } else {
            app.setLoginItemSettings({
                openAtLogin: false,
            });
            // The app cannot start on login.
            return false;
        }
    }

    // Function used to ensure that the app only have one instance.
    private oneInstance() {
        // this.obtainLock = false. We can assume that other instance of the app is running.
        if (!this.obtainLock) {
            // Close this instance.
            app.quit();
        } else {
            /** We do that when the user try to open other instance when one is executed. */
            app.on("second-instance", () => {
                if(this.window) {
                    if (this.window.isMinimized()) {this.window.restore(); }
                    this.window.focus();

                    // TODO: Change this dialogBox for a peaceful message.
                    dialog.showMessageBox(this.window, {
                        type: "info",
                        buttons: ["Close"],
                        title: "App Opened",
                        message: "The app is currently open",
                    });
                }
            });
        }
    }

    // Function used to create and manage the options of the app main window.
    private createMainWindow() {

        const windowOptions: Electron.BrowserWindowConstructorOptions = {
            // Default title but defined on HTML.
            title: "Assistant for your PC",
            icon: this.icon,
            width: 1280,
            height: 720,
            minWidth: 800,
            minHeight: 720,
            maxWidth: 1280,
            maxHeight: 720,
            maximizable: false,
            center: true,
            autoHideMenuBar: false,
            show: false,
            webPreferences: {
                // devTools: false,
                nodeIntegration: true,
                preload: path.join(__dirname, "../preload.js"),
            },
        };

        // Create the window.
        this.window = new BrowserWindow(windowOptions);
        this.window.loadFile(this.mainIndex);

        this.window.on("ready-to-show", () => {
            this.window.show();
        });

        this.window.on("minimize", (event: Electron.Event) => {
            event.preventDefault();
           this.window.hide();
            this.minimizedNotification().show();
        });

        this.window.on("close", (event) => {
            if (!this.canExit) {
              event.preventDefault();
              this.window.hide();
              this.minimizedNotification().show();
            }
            return false;
          });

    }

    // Function to create Tray
    private createTray() {
        const contextMenu =  Menu.buildFromTemplate([
            {
                label: "Abrir", type: "normal",
                click: () => {
                    this.window.show();
                },
            },

            { type: "separator" },

            { label: "Salir", type: "normal",
                click: () => {
                    this.exitApp();
                },
            },
          ]);

        this.tray = new Tray(this.icon);
        this.tray.setToolTip("Application for google assistant to control your PC.");
        this.tray.setContextMenu(contextMenu);

        this.tray.on("double-click", () => {
            this.window.show();
            this.window.focus();
        });
    }

    // Function that notify the user when the app is minimized.
    private minimizedNotification(): Notification {
        // TODO : Check the notification
        const notification = new Notification({
            body: "La app sigue ejecutandose",
            hasReply: false,
            icon: this.icon,
            title: "Google Assistant For PC",
            silent: true,
        });

        notification.on("click", () => {
            this.window.show();
            this.window.focus();
        });
        return notification;
    }

    private createTutorialWindow() {
        const windowOptions: Electron.BrowserWindowConstructorOptions = {
            // Default title but defined on HTML.
            title: "Tutorial",
            parent: this.window,
            icon: this.icon,
            width: 600,
            height: 400,
            minWidth: 600,
            minHeight: 400,
            maxWidth: 600,
            maxHeight: 400,
            maximizable: false,
            minimizable: false,
            center: true,
            autoHideMenuBar: true,
            show: false,
            webPreferences: {
                // devTools: false,
                nodeIntegration: true,
                preload: path.join(__dirname, "../preload.js"),
            },
        };

        if (this.canOpenTutorial) {
            this.tutorialWindow = new BrowserWindow(windowOptions);
            this.tutorialWindow.removeMenu();
            this.tutorialWindow.setAlwaysOnTop(true);
            this.tutorialWindow.loadFile(this.tutorialIndex);

            this.tutorialWindow.on("ready-to-show", () => {
                this.tutorialWindow.show();
            });

            this.tutorialWindow.on("close", (event) => {
                this.tutorialWindow = null;
                this.canOpenTutorial = true;
            });
            this.canOpenTutorial = false;
        }

    }

    // Function used to create the top menu used for all the windows.
    // tslint:disable-next-line: member-ordering
    public createTopMenu() {

        const menu = Menu.buildFromTemplate([
            {
                label: "Open Dev Tools",
                accelerator: "CmdOrCtrl+Shift+D",
                click: () => {
                    this.window.webContents.openDevTools();
                  },
            },
            {
                label: "Get App Info",
                accelerator: "CmdOrCtrl+Shift+F",
                click: () => {
                  this.window.webContents.send("appInfo", this.appInfo);
                },
            },
            {
                label: "Tutorial",
                click: () => {
                    this.createTutorialWindow();
                },
            },
            {
                accelerator: "CmdOrCtrl+Shift+Q",
                label: "Exit",
                click: () => {
                   this.exitApp();
                },
            },
        ]);

        Menu.setApplicationMenu(menu);
    }

    // tslint:disable-next-line: member-ordering
    public exitApp() {
        this.startOnTurnOn();
        this.canExit = true;
        this.tray.destroy();
        this.window = null;
        app.quit();
    }
}
