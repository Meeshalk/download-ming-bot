import {
    hideSpinner,
    showSpinner,
    sleep,
} from "./core/common";

import "./styles/main.css";

const { ipcRenderer, shell } = require("electron");

const Store = require("electron-store");

// store init
const config = new Store();


// UI actions selectors and init
const mainForm = document.querySelector("#mainform");
const setRootFolder = document.querySelector("#set_root_folder");
const targetDomain = document.querySelector('#target_domain');

targetDomain.addEventListener("click", async (targetDomainClicked) => {
    targetDomainClicked.preventDefault();
    shell.openExternal(targetDomain.getAttribute('href'));
});

// open
document.addEventListener("DOMContentLoaded", async (domLoaded) => {

});


// set root folder
setRootFolder.addEventListener("click", async (rootFolderEvent) => {
    let response = await ipcRenderer.invoke("open-dialog", {
        title: "Open Root Folder",
        buttonLabel: "Select",
        properties: ["openDirectory"],
    });

    if (response.canceled === false) {
        config.clear();
        config.set("root-folder", response.filePaths[0]);
    }
});


mainForm.addEventListener("submit", async (mainFormSubmitEvent) => {
    mainFormSubmitEvent.preventDefault();
    showSpinner();
    await sleep(3000);
    let rootFolder = config.get("root-folder");

    hideSpinner();
    await ipcRenderer.invoke("show-message", {
        message: `File - ${pathBasename(outFile)} was created successfully!`,
        type: "info",
        title: "Completed!",
    });
});
