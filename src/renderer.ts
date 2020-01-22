import { ipcRenderer, remote } from "electron";
import log from "electron-log";
import * as fs from "fs-extra";
import * as path from "path";
import ConfigFile from "./services/ConfigFile";


const configFile = new ConfigFile();

function onStart() {
  if (configFile.getItemValue("startWithWindows")) {
    (document.getElementById("startWithWindows") as HTMLInputElement).checked = true;
  }

  document.getElementById("actualPathBat").innerText = configFile.getCurrentBatFolder();
  document.getElementById("actualtPathCloud").innerText = configFile.getCurrentCloudFolder();
}
onStart();

ipcRenderer.on("appInfo", (event, data) => {

  const options = {
    type: "info",
    buttons: ["Close"],
    title: "App Information",
    message: "App Name: " + data.appName + "\n" + "App Version: " +
      data.appVersion + "\n" + "App Path: " + data.appPath + "\n" + "Config Path: " + data.configPath
      + "\n" + "Logs Path: " + data.logsPath,
  };

  remote.dialog.showMessageBox(remote.getCurrentWindow(), options);

  console.log(data);
});


/** SHOW MORE INFO ALERT */
/** ************************ */


/** CONFIGURATION SECTION */

document.getElementById("fileselectorCloud").addEventListener("change", () => {
  const fileselector: string = (document.getElementById("fileselectorCloud") as HTMLInputElement).files[0].path;
  configFile.changeConfig("customDir.CloudPath", fileselector);

  document.getElementById("actualtPathCloud").innerText = configFile.getCurrentCloudFolder();

  showRestartAlert();
});

document.getElementById("buttonDefaultCloud").addEventListener("click", () => {
  configFile.changeConfig("customDir.CloudPath", "");

  document.getElementById("actualtPathCloud").innerText = configFile.getCurrentCloudFolder();

  showRestartAlert();
});

document.getElementById("fileselectorBat").addEventListener("change", () => {
  const fileselector: string = (document.getElementById("fileselectorBat") as HTMLInputElement).files[0].path;
  configFile.changeConfig("customDir.BatFilesPath", fileselector);

  document.getElementById("actualPathBat").innerText = configFile.getCurrentBatFolder();

  showRestartAlert();
});

document.getElementById("buttonDefaultBat").addEventListener("click", () => {
  configFile.changeConfig("customDir.BatFilesPath", "");

  document.getElementById("actualPathBat").innerText = configFile.getCurrentBatFolder();

  showRestartAlert();
});

/** ************************ */


/** TEXTAREA */

document.getElementById("saveBat").addEventListener("click", () => {
  saveBat();
});

function saveBat() {
  const titleToSave = (document.getElementById("batTitle") as HTMLInputElement).value;
  const textToSave = (document.getElementById("batText") as HTMLInputElement).value;
  // tslint:disable-next-line: max-line-length
  const batFolder = configFile.existcustomDirBatFilesPath() ? configFile.getItemValue("customDir.BatFilesPath") : configFile.getItemValue("defaultDir.BatFilesPath");
  const fullPath = path.join(batFolder, titleToSave);

  const re = /(?:\.([^.]+))?$/;

  if (re.exec(titleToSave)[1] === "bat") {
    fs.writeFile(fullPath, textToSave, (err) => {
      if (err) { log.error(err); }
    });

    showBatSavedAlert(titleToSave, fullPath);
  } else {
    fs.writeFile(fullPath + ".bat", textToSave, (err) => {
      if (err) { log.error(err); }
    });

    showBatSavedAlert(titleToSave + ".bat", fullPath + ".bat");
  }

  // Resetting the value of the html textArea
  (document.getElementById("batTitle") as HTMLInputElement).value = "";
  (document.getElementById("batText") as HTMLInputElement).value = "START ";

}

/** ************************ */

/** RESTART ALERT  */

function showRestartAlert() {
  const alertContainer = (document.getElementById("alertContainerRestartApp") as HTMLInputElement);
  alertContainer.removeAttribute("style");
  setTimeout(() => {
    hideRestartAlert();
  }, 10000);
}

function hideRestartAlert() {
  const alertContainer = (document.getElementById("alertContainerRestartApp") as HTMLInputElement);
  alertContainer.setAttribute("style", "display:none;");
}

document.getElementById("hideRestartAlert").addEventListener("click", () => {
  hideRestartAlert();
});

document.getElementById("buttonResetApp").addEventListener("click", () => {
  hideRestartAlert();
  restartApp();
});

/** ************************ */

/** BAT SAVED ALERT */

function showBatSavedAlert(fileName: string, filePath: string) {
  const alertContainer = (document.getElementById("alertContainerBatSaved") as HTMLInputElement);
  const text = (document.getElementById("textToShowBatSaved") as HTMLInputElement);
  const textToAdd = document.createTextNode(fileName + " file saved at: " + filePath);
  text.appendChild(textToAdd);

  alertContainer.removeAttribute("style");
  setTimeout(() => {
    hideBatSavedAlert();
    text.removeChild(textToAdd);
  }, 4000);
}

function hideBatSavedAlert() {
  const alertContainer = (document.getElementById("alertContainerBatSaved") as HTMLInputElement);
  alertContainer.setAttribute("style", "display:none;");
}

document.getElementById("hideBatSaved").addEventListener("click", () => {
  hideBatSavedAlert();
});

/** ************************ */



document.getElementById("startWithWindows").addEventListener("change", () => {
  startWithWindows();
});

function startWithWindows() {
  const check = (document.getElementById("startWithWindows") as HTMLInputElement).checked;
  configFile.changeConfig("startWithWindows", check);
  log.info("Start With Windows: " + check);
  showRestartAlert();
}

function restartApp() {
  remote.app.relaunch();
  remote.app.exit();
}
