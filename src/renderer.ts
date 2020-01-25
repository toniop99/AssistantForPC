import { ipcRenderer, remote } from "electron";
import log from "electron-log";
import * as fs from "fs-extra";
import * as path from "path";
import ConfigFile from "./services/ConfigFile";

import { languages, getCurrentLanguage } from "./translations/mainWindow.translations"; 

const configFile = ConfigFile.getInstace();


/***** VARIABLES *****/

          /***** SHOW INFORMATION VARIABLES *****/
  const mainTitle = document.getElementById("applicationTitle");
  const moreInformationTitle = document.getElementById("moreInformationTitle");
  const moreInformationBody1 = document.getElementById("moreInformationBody1");
  const moreInformationBody2 = document.getElementById("moreInformationBody2");
  const showTutorial = document.getElementById("showTutorial");
          /***** * *****/

          /***** CONFIGURATION VARIABLES *****/
  const configurationTitle = document.getElementById("configurationTitle");
  
          /***** CLOUD VARIABLES *****/
  const configurationCloudPathText = document.getElementById("configurationCloudPathText");
  const fileSelectorCloud = document.getElementById("fileselectorCloud");
  const fileselectorCloudButton = document.getElementById("fileselectorCloudButton");
  const buttonDefaultCloud = document.getElementById("buttonDefaultCloud");
  const actualtPathCloud = document.getElementById("actualtPathCloud");
  const cloudDangerMessage = document.getElementById("cloudDangerMessage");
          /***** * *****/

          /***** BAT VARIABLES *****/
  const configurationBatPathText = document.getElementById("configurationBatPathText");
  const fileselectorBat = document.getElementById("fileselectorBat");
  const fileselectorBatButton = document.getElementById("fileselectorBatButton");
  const buttonDefaultBat = document.getElementById("buttonDefaultBat");
  const actualPathBat = document.getElementById("actualPathBat");

          /***** * *****/


          /***** EDITOR VARIABLES *****/
  const editorTitle = document.getElementById("editorTitle");
  const editorBody = document.getElementById("editorBody");
  const saveBat = document.getElementById("saveBat");
  const editorDangerMessage = document.getElementById("editorDangerMessage");

          /***** * *****/

          /***** FOOTER VARABLES *****/
  const startWithWindowsText = document.getElementById("startWithWindowsText");
  const versionText = document.getElementById("versionText");
          /***** * *****/

          /***** UPDATE NOTIFICATION *****/
  const alertContainerUpdate = document.getElementById("alertContainerUpdate");
  const updateMessage = document.getElementById("updateMessage");
  const updaterestartButton = document.getElementById("updaterestartButton");
  const hideUpdate = document.getElementById("hideUpdate");
          /***** * *****/


/***** * *****/

function insertText() {
  const cl = getCurrentLanguage();

  mainTitle.innerText = cl.title;
  moreInformationTitle.innerText = cl.moreInformation.title;
  moreInformationBody1.innerText = cl.moreInformation.body1;
  moreInformationBody2.innerText = cl.moreInformation.body2;
  showTutorial.innerText = cl.moreInformation.button;

  configurationTitle.innerText = cl.configuration.title;
  configurationCloudPathText.innerText = cl.configuration.cloud.cloudPath;
  fileselectorCloudButton.innerText = cl.configuration.cloud.cloudButton;
  buttonDefaultCloud.innerText = cl.configuration.cloud.reset;
  actualtPathCloud.innerText = configFile.getCurrentCloudFolder();
  cloudDangerMessage.innerText = cl.configuration.cloud.dangerMessage; 
  
  configurationBatPathText.innerText = cl.configuration.bat.batPath;
  fileselectorBatButton.innerText = cl.configuration.bat.batButton;
  buttonDefaultBat.innerText = cl.configuration.bat.reset;
  actualPathBat.innerText = configFile.getCurrentBatFolder();

  editorTitle.innerText = cl.editor.title;
  editorBody.innerText = cl.editor.body;
  saveBat.innerText = cl.editor.button;
  editorDangerMessage.innerText = cl.editor.dangerMessage;

  startWithWindowsText.innerText = cl.footer.startWithWindows;
  versionText.innerText = languages.appVersion;
}
insertText()

function onStart() {
  if (configFile.getItemValue("startWithWindows")) {
    (document.getElementById("startWithWindows") as HTMLInputElement).checked = true;
  }
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

ipcRenderer.on("changeLanguage", (event, data) => {
  ipcRenderer.removeAllListeners("openTutorial");
  insertText();
});


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

showTutorial.addEventListener("click", () => {
  ipcRenderer.send("getTutorial");
});

/** ************************ */


/***** CONFIGURATION SECTION *****/

fileSelectorCloud.addEventListener("change", () => {
  const fileselector: string = (document.getElementById("fileselectorCloud") as HTMLInputElement).files[0].path;
  configFile.changeConfig("customDir.CloudPath", fileselector);

  ipcRenderer.send("changeCloudPath");

  actualtPathCloud.innerText = configFile.getCurrentCloudFolder();

});

buttonDefaultCloud.addEventListener("click", () => {
  configFile.changeConfig("customDir.CloudPath", "");
  
  ipcRenderer.send("changeCloudPath");

  actualtPathCloud.innerText = configFile.getCurrentCloudFolder();

});

fileselectorBat.addEventListener("change", () => {
  const fileselector: string = (document.getElementById("fileselectorBat") as HTMLInputElement).files[0].path;
  configFile.changeConfig("customDir.BatFilesPath", fileselector);
 
  actualPathBat.innerText = configFile.getCurrentBatFolder();
});

buttonDefaultBat.addEventListener("click", () => {
  configFile.changeConfig("customDir.BatFilesPath", "");

  actualPathBat.innerText = configFile.getCurrentBatFolder();
});

/** ************************ */


/***** TEXTAREA *****/

saveBat.addEventListener("click", () => {
  saveBatFile();
});

function saveBatFile() {
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
