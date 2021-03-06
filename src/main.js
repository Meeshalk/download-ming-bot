const { app, BrowserWindow, ipcMain } = require("electron");


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}

const { openDialog, showMessageBox } = require("./app/core/common");
const { request, donwnloadFile } = require("./app/core/request");

let mainWin;
// Menu.setApplicationMenu(null);
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            devTools: false,
        },
        show: false,
        minWidth: 640,
        minHeight: 480,
        backgroundColor: "#242424"
    })

    mainWindow.once('ready-to-show', () =>{
        mainWindow.show()
    })

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.setMenuBarVisibility(false);

    mainWin = mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// main function


// open dialog
ipcMain.handle("open-dialog", async (event, data) => {
    return await openDialog(data, mainWin);
});

// open message box
ipcMain.handle("show-message", async (event, data) => {
    return await showMessageBox(data, mainWin);
});

// http request and response
ipcMain.handle("http-request", async (event, data) => {
    return await request(data);
});

// download
ipcMain.handle("download", async (event, data) => {
    return await donwnloadFile(mainWin, data);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
