import { BrowserWindow, BrowserWindowConstructorOptions, Menu, Tray} from "electron";

export default class UI { 

    private static controlTray: boolean = false;
    private static tray: Tray;

    public createWindow(options: BrowserWindowConstructorOptions, url?: string): BrowserWindow {
        const window = new BrowserWindow(options);
        if(url === null) return window;

        window.loadFile(url);
        return window;
    }

    public createTray(icon: string, contextMenu?: Menu, toolTip?: string): Tray {
        // If control tray exists, return them.
        if(UI.controlTray) return UI.tray;

        // If not exist we create them and put the control to true.
        UI.tray = new Tray(icon);
        if(contextMenu) UI.tray.setContextMenu(contextMenu);
        if(toolTip) UI.tray.setToolTip(toolTip);

        UI.controlTray = true;

        return UI.tray;
    }

    public destroyTray(tray: Tray) {
        tray.destroy;
        UI.tray.destroy();
        UI.tray = null;
    }

    public applicationMenu(menu: Menu) {
        Menu.setApplicationMenu(menu);
    }
}