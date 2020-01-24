import { ipcRenderer, remote } from "electron";
import log from "electron-log";
import * as fs from "fs-extra";
import * as path from "path";
import ConfigFile from "./services/ConfigFile";


const configFile = ConfigFile.getInstace();

function onStart() {
  window.onload = () => {
    if (configFile.getItemValue("startWithWindows")) {
      (document.getElementById("startWithWindows") as HTMLInputElement).checked = true;
    }
  };
}
onStart();

function restartApp() {
  remote.app.relaunch();
  remote.app.exit();
}

ipcRenderer.on("appInfo", (event, data) => {
  ipcRenderer.removeAllListeners("appInfo");
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

ipcRenderer.on("openTutorial", (event, data) => {
  ipcRenderer.removeAllListeners("openTutorial");
  data.tutorial;
});


/***** UPDATE NOTIFICATION *****/

const alertContainerUpdate = document.getElementById("alertContainerUpdate");
const updateMessage = document.getElementById("updateMessage");
const updaterestartButton = document.getElementById("updaterestartButton");
const hideUpdate = document.getElementById("hideUpdate");

ipcRenderer.on("update_available", () => {
  ipcRenderer.removeAllListeners("update_available");
  updateMessage.innerText = "A new update is available. Downloading now...";
  alertContainerUpdate.classList.remove("hidden");

});

ipcRenderer.on("update_downloaded", () => {
  ipcRenderer.removeAllListeners("update_downloaded");
  updateMessage.innerText = "Update Downloaded. It will be installed on restart. Restart now?";
  updaterestartButton.classList.remove("hidden");
  alertContainerUpdate.classList.remove("hidden");
});

hideUpdate.addEventListener("click", () => {
  updaterestartButton.classList.add("hidden");
  alertContainerUpdate.classList.add("hidden");
});

updaterestartButton.addEventListener("click", () => {
  ipcRenderer.send("restart_app_update");
});


/** ************************ */

/***** SHOW TUTORIAL *****/

document.getElementById("showTutorial").addEventListener("click", () => {
  ipcRenderer.send("getTutorial");
});

/** ************************ */


/***** CONFIGURATION SECTION *****/

document.getElementById("fileselectorCloud").addEventListener("change", () => {
  const fileselector: string = (document.getElementById("fileselectorCloud") as HTMLInputElement).files[0].path;
  configFile.changeConfig("customDir.CloudPath", fileselector);

  ipcRenderer.send("changeCloudPath");

});

document.getElementById("buttonDefaultCloud").addEventListener("click", () => {
  configFile.changeConfig("customDir.CloudPath", "");

  ipcRenderer.send("changeCloudPath");

});

document.getElementById("fileselectorBat").addEventListener("change", () => {
  const fileselector: string = (document.getElementById("fileselectorBat") as HTMLInputElement).files[0].path;
  configFile.changeConfig("customDir.BatFilesPath", fileselector);

});

document.getElementById("buttonDefaultBat").addEventListener("click", () => {
  configFile.changeConfig("customDir.BatFilesPath", "");

});

/** ************************ */


/***** TEXTAREA *****/

document.getElementById("saveBat").addEventListener("click", () => {
  saveBat();
});

function saveBat() {
  const titleToSave = (document.getElementById("batTitle") as HTMLInputElement).value;
  const textToSave = (document.getElementById("batText") as HTMLInputElement).value;
  const batFolder = configFile.getCurrentBatFolder();
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

/***** BAT SAVED ALERT *****/

function showBatSavedAlert(fileName: string, filePath: string) {
  const alertContainer = document.getElementById("alertContainerBatSaved");
  const text = document.getElementById("textToShowBatSaved");
  const textToAdd = fileName + " file saved at: " + filePath;

  text.innerText = textToAdd;

  alertContainer.classList.remove("hidden");

  setTimeout(() => {
    hideBatSavedAlert();
    text.innerText = "";
  }, 4000);
}

function hideBatSavedAlert() {
  const alertContainer = document.getElementById("alertContainerBatSaved");
  alertContainer.classList.add("hidden");
}

document.getElementById("hideBatSaved").addEventListener("click", () => {
  hideBatSavedAlert();
});

/** ************************ */

/***** START WITH WINDOWS BUTTON *****/

document.getElementById("startWithWindows").addEventListener("change", () => {
  startWithWindows();
});

function startWithWindows() {
  const check = (document.getElementById("startWithWindows") as HTMLInputElement).checked;
  configFile.changeConfig("startWithWindows", check);
  log.info("Start With Windows: " + check);
}

/** ************************ */
