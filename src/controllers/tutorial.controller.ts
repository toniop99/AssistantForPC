import { BrowserWindow } from "electron";
import * as path from "path";


export default class Tutorial {
    
    // For check if the tutowial window is actually open
    private canOpenTutorial: boolean = true;
    private tutorialWindow: BrowserWindow;
    private tutorialIndex: string = (path.join(__dirname, "../../public/tutorialIndex.html"));
    private icon: string = path.join(__dirname, "../../public/images/icons/icon64.png");

    public createTutorialWindow(parentWindow: BrowserWindow): BrowserWindow {
        const windowOptions: Electron.BrowserWindowConstructorOptions = {
            // Default title but defined on HTML.
            title: "Tutorial",
            parent: parentWindow,
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
            },
        };

        if(this.canOpenTutorial) {
            this.tutorialWindow = new BrowserWindow(windowOptions);
            this.tutorialWindow.removeMenu();
            this.tutorialWindow.setAlwaysOnTop(true);
            this.tutorialWindow.loadFile(this.tutorialIndex);

            this.canOpenTutorial = false;            
        }

        this.tutorialWindow.on("ready-to-show", () => {
            this.tutorialWindow.show();
        });

        this.tutorialWindow.on("close", () => {
            this.tutorialWindow = null;
            this.canOpenTutorial = true;
        });

        return this.tutorialWindow;
    }

}