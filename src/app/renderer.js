import { hideSpinner, isValidUrl, showSpinner, sleep } from "./core/common";
import { fileExists, joinPath, listFiles, makeFolder } from "./core/fileSystem";
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

let albumFolder = null;
let rootFolder = null;
// open target website
targetDomain.addEventListener("click", async (targetDomainClicked) => {
    targetDomainClicked.preventDefault();
    shell.openExternal(targetDomain.getAttribute("href"));
});

// open
document.addEventListener("DOMContentLoaded", async (domLoaded) => {
    // onload
    if (config.has("root-folder")) {
        rootFolder = config.get("root-folder");
        if (!(await fileExists(rootFolder, "albums"))) {
            try {
                albumFolder = await makeFolder(rootFolder, "albums");
            } catch (error) {
                console.log(error);
            }
        } else {
            albumFolder = joinPath(rootFolder, "albums");
        }

        config.set('out', albumFolder);
        await listFiles(albumFolder);
    }

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
        rootFolder = config.get("root-folder");
    }
});

mainForm.addEventListener("submit", async (mainFormSubmitEvent) => {
    mainFormSubmitEvent.preventDefault();
    showSpinner();
    let root = config.get("root-folder");
    let url = mainForm.elements.url.value;
    let paginate = mainForm.elements.paginate.value;
    let urlValidated = await isValidUrl(url);

    if (urlValidated === false) {
        // error - in input url
        console.log("Invalid url");
        hideSpinner();
        return false;
    }

    if (
        !(urlValidated instanceof URL) ||
        !VALID_DOMAINS.includes(urlValidated.hostname)
    ) {
        // error - domain unsupported
        hideSpinner();
        console.log("domain unsupported " + url);
        return false;
    }



    // console.log(rootFolder, url);
    hideSpinner();
});
