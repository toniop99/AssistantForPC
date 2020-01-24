import ConfigFile from "../services/ConfigFile";

const dictionary = {
    spanish: {
        title: "Asistente para tu PC",
        tutorialTitle: "Assistant For PC Tutorial",
    },

    english: {
        title: "Assistant For your PC",
    },
};

const configFile = new ConfigFile();


export function mainWindowText() {

    const selectedLanguage: string = configFile.getItemValue("language");

    let useDictionary: object;

    if (selectedLanguage === "english") {
        useDictionary = dictionary.english;
    } else if (selectedLanguage === "spanish") {
        useDictionary = dictionary.spanish;
    }

    require("electron-handlebars")({
        language: useDictionary,

        actualPathBat: configFile.getCurrentBatFolder(),
        actualtPathCloud: configFile.getCurrentCloudFolder(),
        appVersion: "1.1.2",
    });
}

