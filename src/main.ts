import { app, BrowserWindow, dialog, Menu, Notification, Tray } from "electron";
import * as log1 from "electron-log";
import * as os from "os";
import * as path from "path";

import { ConfigFile } from "./services/ConfigFile";
import { Observer } from "./services/Observer";

app.setName("Google Assistant For Your PC");

const obtainBlock = app.requestSingleInstanceLock();
const obs: Observer = new Observer();
const cf = new ConfigFile();
const cloudFolder = cf.existcustomDirCloudPath() ? cf.getItemValue("customDir.CloudPath") : cf.getItemValue("defaultDir.CloudPath");

const appInfo = {
  appName: app.getName(),
  appPath: __dirname,
  appVersion: "1.0.2",
  configPath: cf.getPathConfigFile(),
  logsPath: path.join(os.userInfo().homedir, "/ApPData/Roaming", app.getName(), "/logs"),
};

let window: Electron.BrowserWindow;
let tray: Tray = null;
const icon: string = path.join(__dirname, "../public/images/icons/icon64.png");

let canClose: boolean = false;

function canStartOnLogin() {
  if (cf.getStartWithWindows()) {
    app.setLoginItemSettings({
      openAtLogin: cf.getStartWithWindows(),
      path: app.getPath("exe"),
    });
  } else {
    app.setLoginItemSettings({
      openAtLogin: cf.getStartWithWindows(),
    });
  }

  obs.on("file-added", (log) => {
    // print error message to console
    // tslint:disable-next-line: no-console
    log1.info(log.message);
    // console.log(log.message);
  });
  obs.watchFolder(cloudFolder);

}
canStartOnLogin();

function oneInstance() {
  if (!obtainBlock) {
    app.quit();
  } else {
    app.on("second-instance", (event, commandLine, WorkingDirectory) => {
      // Si alguien intenta ejecutar una segunda instancia.
      // Nos enfocamos en la principal.
      if (window) {
        if (window.isMinimized()) {window.restore(); }
        window.focus();
        dialog.showMessageBox(window, {
          type: "error",
          buttons: ["Close"],
          title: "Error",
          message: "The app is currently open",
        });
      }
    });
  }
}
oneInstance();



function createWindow() {
  // Crea la ventana del navegador escondida.
  const win = new BrowserWindow({
          title: "Control Your PC With Google Assistant",
          // tslint:disable-next-line: object-literal-sort-keys
          icon: icon,
          width: 1280,
          height: 720,
          minWidth: 800,
          minHeight: 720,
          maxWidth: 1280,
          maxHeight: 720,
          maximizable: false,
          center: true,
          autoHideMenuBar: true,
          show: true,
          webPreferences: {
            // devTools: false,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
          },
  });
  // Cargar el  index.html de la aplicación.
  win.loadFile(path.join(__dirname, "../public/index.html"));
  // win.webContents.openDevTools();

  return win;

}

function createMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "Menu",
        submenu: [
          {
            accelerator: "CmdOrCtrl+Shift+D",
            label: "Open Dev Tools",
            click() {
              window.webContents.openDevTools();
            },
          },
          {
            accelerator: "CmdOrCtrl+Shift+F",
            label: "Get App Info",
            click() {
              window.webContents.send("appInfo", appInfo);
            },
          },
          { type: "separator"},
          {
            accelerator: "CmdOrCtrl+Shift+Q",
            label: "Exit",
            click() {
              canClose = true;
              tray.destroy();
              window = null;
              app.quit();
            },
          },
        ],
    },

  ]);

  Menu.setApplicationMenu(menu);

}

function createTray() {
  tray = new Tray(icon);

  tray.on("double-click", () => {
    window.show();
  });

  const contextMenu = Menu.buildFromTemplate([
    {
        label: "Abrir app", type: "normal",
        click() {
            window.show();
        },
    },
    { type: "separator" },

    { label: "Salir", type: "normal",
        click() {
            canClose = true;
            tray.destroy();
            window = null;
            app.quit();
        },
    },
  ]);

  tray.setToolTip("Application for google assistant to control your PC.");
  tray.setContextMenu(contextMenu);
}

function appNotification(title: string, body: string) {
  const not = new Notification({
    body,
    hasReply: false,
    icon: icon,
    title,
  });

  not.on("click", () => {
    window.show();
  });

  not.show();
}


app.on("ready", () => {
  window = createWindow();
  createTray();
  createMenu();

  window.on("minimize", (event: Electron.Event) => {
      event.preventDefault();
      window.hide();
      appNotification("Google Assistant For PC", "La app sigue ejecutandose");
  });

  window.on("close", (event) => {
    if (!canClose) {
      event.preventDefault();
      window.hide();
      appNotification("Google Assistant For PC", "La app sigue ejecutandose");
    }
    return false;
  });
});

