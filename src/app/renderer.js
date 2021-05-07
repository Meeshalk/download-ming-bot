import { hideSpinner, isValidUrl, showSpinner, sleep } from "./core/common";
import "./styles/main.css";
const { ipcRenderer, shell } = require("electron");
const Store = require("electron-store");

// store init
const config = new Store();

const VALID_DOMAINS = ["donloadming.com", "donloadming4.com"];

// UI actions selectors and init
const mainForm = document.querySelector("#mainform");
const setRootFolder = document.querySelector("#set_root_folder");
const targetDomain = document.querySelector("#target_domain");

// open target website
targetDomain.addEventListener("click", async (targetDomainClicked) => {
    targetDomainClicked.preventDefault();
    shell.openExternal(targetDomain.getAttribute("href"));
});

// open
document.addEventListener("DOMContentLoaded", async (domLoaded) => {
    // onload
    console.log("onLoad");
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
    let rootFolder = config.get("root-folder");
    let url = mainForm.elements.url.value;
    let urlValidated = await isValidUrl(url);
    if (urlValidated === false) {
        // error - in input url
        console.log("Invalid url");
        hideSpinner();
        return false;
    }

    if (
        !(urlValidated instanceof URL) ||
        !(VALID_DOMAINS.includes(urlValidated.hostname))
    ) {
        // error - domain unsupported
        hideSpinner();
        console.log("domain unsupported " + url);
        return false;
    }

    

    // console.log(rootFolder, url);
    hideSpinner();
});
