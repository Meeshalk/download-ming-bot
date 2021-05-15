import "./styles/main.css";
import { getPage } from "./core/api";
import {
    showSpinner,
    hideSpinner,
    isValidUrl,
    lowerTrim,
    getPagedUrl,
} from "./core/common";
import { fileExists, joinPath, listFiles, makeFolder } from "./core/fileSystem";
import { getAlbumDetailsFromDOM, getPagesArray } from "./core/scraper";
const { ipcRenderer, shell } = require("electron");

const Store = require("electron-store");

// store init
const config = new Store();

const VALID_DOMAINS = ["downloadming.com", "downloadming4.com"];

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

        config.set("out", albumFolder);
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
    let out = config.get("out");
    let url = lowerTrim(mainForm.elements.url.value);
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

    const initialPageDetails = await ipcRenderer.invoke(
        "http-request",
        await getPage(url)
    );

    let initialLinks = await getAlbumDetailsFromDOM(initialPageDetails.body);

    // pagination logic
    let pages = [];
    let currentPage = null;
    const pageMatrix = await getPagesArray(initialPageDetails.body);

    if (pageMatrix === false || paginate === "no") {
        pages = [1];
        currentPage = 1;
    } else {
        pages = pageMatrix.pages;
        currentPage = pageMatrix.current;
    }

    let albumArry = [];
    while (pages.length !== 0) {
        let thisPage = pages.shift();
        let _url = null;
        let pageDetails = null;
        if (currentPage !== thisPage) {
            // do the http and shit
            _url = await getPagedUrl(url, thisPage);
            pageDetails = await ipcRenderer.invoke(
                "http-request",
                await getPage(_url)
            );
            albumArry.push(await getAlbumDetailsFromDOM(pageDetails.body));
            continue;
        }
        albumArry.push(initialLinks);
    }

    console.log(albumArry);

    // let albums =
    // console.log(pages);

    // let count = pages.length;
    // do {
    //     count--;
    //     console.log(pages.shift());
    // } while (count > 0);

    // console.log(rootFolder, url);
    hideSpinner();
});
