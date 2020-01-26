import { app, BrowserWindow, BrowserWindowConstructorOptions, dialog, ipcMain, Menu, Notification, Tray, MenuItem } from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";
import * as os from "os";
import logFile from "electron-log";
import isDev = require("electron-is-dev");

/***** My files imports *****/
import Observer from "../services/Observer";
import ConfigFile from "../services/ConfigFile";
import UI from "./UI.controller";
import Tutorial from "./tutorial.controller";

export default class Main extends UI{

    private static instance: Main;

    /***** VARIABLES *****/

    // Access to the Config File Doucument.
    private configFile = ConfigFile.getInstace();

    // Allow to obtain a lock for run a single instante of the app
    private obtainLock = app.requestSingleInstanceLock();

    // Used to watch changes on the selected cloud folder.
    private observer: Observer = new Observer();


    // Variables used to the control of the app and the main window.
    private window: BrowserWindow = null;
    
    private tray: Tray = null;
    private trayMessage: string = "Application to control your PC.";

    private icon: string = path.join(__dirname, "../../public/images/icons/icon64.png");
    private mainIndex: string = (path.join(__dirname, "../../public/index.html"));

    private canExit: boolean = false;

    // Control the tutorial window.
    private tutorial: Tutorial = new Tutorial();

    private appInfo = {
        appName: app.getName(),
        appPath: __dirname,
        appVersion: "1.0.2",
        configPath: this.configFile.getPathConfigFile(),
        logsPath: path.join(os.userInfo().homedir, "/ApPData/Roaming", app.getName(), "/logs"),
    };

    /***** * *****/

    private constructor() {
        super();
        this.initializeApp();
    }

    public static getInstace(): Main {
        if (!Main.instance) {
            Main.instance = new Main();
        }
        return Main.instance;
    }

    
    private initializeApp() {
        app.setName("Google Assistant For Your PC");
        this.observeFolder();
        this.oneInstance();
        this.startOnTurnOn();

        app.on("ready", () => {
            autoUpdater.logger = logFile;
            autoUpdater.checkForUpdatesAndNotify();

            this.mainWindow();
            this.appMenu();
            this.appTray();
        });

        app.on("before-quit", () => {
            // this.exitApp();
        });

        ipcMain.on("getTutorial", () => {
            this.window.webContents.send("openTutorial", {
                tutorial: this.tutorial.createTutorialWindow(this.window),
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
        this.observer.removeAllListeners();

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
                if (this.window) {
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
    private mainWindow() {

        const windowOptions: BrowserWindowConstructorOptions = {
            // Default title but defined on HTML.
            title: "Assistant for your PC",
            icon: this.icon,
            width: 1280,
            height: 760,
            minWidth: 1280,
            minHeight: 760,
            maxWidth: 1280,
            maxHeight: 760,
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
        this.window = this.createWindow(windowOptions, this.mainIndex);

        // Main window Events
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
    private appTray() {
        const contextMenu: Menu =  Menu.buildFromTemplate([
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

        this.tray = this.createTray(this.icon, contextMenu, this.trayMessage);

        this.tray.on("double-click", () => {
            this.window.show();
            this.window.focus();
        });
    }

    // Function used to create the top menu used for all the windows.
    private appMenu() {

        const menu: Menu = Menu.buildFromTemplate([
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
                    this.tutorial.createTutorialWindow(this.window);
                },
            },
            {
                label: "Language",
                sublabel: "Reset to see the language changes",
                submenu: [
                    {
                        label: "English",
                        click: () => {
                            this.configFile.changeConfig("language", "english");
                            this.window.webContents.send("changeLanguage");
                        },
                    },
                    {
                        label: "Español",
                        click: () => {
                            this.configFile.changeConfig("language", "spanish");
                            this.window.webContents.send("changeLanguage");
                        },
                    },
                ],
            },
            {
                accelerator: "CmdOrCtrl+Shift+Q",
                label: "Exit",
                click: () => {
                   this.exitApp();
                },
            },
        ]);
        
        
        if(isDev) {
            menu.append(new MenuItem(
                    {
                    label: "Open Dev Tools",
                    accelerator: "CmdOrCtrl+Shift+D",
                    click: () => {
                        this.window.webContents.openDevTools();
                    },
            },));
        }

        this.applicationMenu(menu);
    }

    // Function that notify the user when the app is minimized.
    private minimizedNotification(): Notification {
        // TODO : Use electron-windows-notifications
        const notification: Notification = new Notification({
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

    public exitApp() {
        this.startOnTurnOn();
        this.canExit = true;
        this.destroyTray(this.tray);
        
        this.tray = null;
        
        this.window.close();
        this.window = null;
        
        app.quit();
    }
}
