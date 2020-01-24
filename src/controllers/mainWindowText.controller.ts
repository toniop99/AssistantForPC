import { app } from "electron";

export const mainWindowText = () => {
    require("electron-handlebars")({
        title: "Assistant For PC",
        tutorialTitle: "Assistant For PC Tutorial",
        appVersion: process.env.npm_package_version,
    });
};

