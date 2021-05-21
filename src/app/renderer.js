import "./styles/main.css";
import { getPage } from "./core/api";
import {
    showSpinner,
    hideSpinner,
    isValidUrl,
    lowerTrim,
    getPagedUrl,
    sleep,
} from "./core/common";
import {
    fileExists,
    joinPath,
    listFiles,
    makeFolder,
    saveFileTo,
} from "./core/fileSystem";
import {
    getAlbumDetailsFromDOM,
    getPagesArray,
    getSongLinks,
} from "./core/scraper";
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
            albumFolder = await joinPath(rootFolder, "albums");
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
    let songCount = 0;
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

    for (const pageKey in albumArry) {
        const page = albumArry[pageKey];

        for (const albumKey in page) {
            const album = page[albumKey];
            const songDetails = await ipcRenderer.invoke(
                "http-request",
                await getPage(album.url)
            );

            albumArry[pageKey][albumKey]["songs"] = await getSongLinks(
                songDetails.body
            );

            songCount += (albumArry[pageKey][albumKey]["songs"]).length;

            for (const songKey in albumArry[pageKey][albumKey]["songs"]) {

                let song = albumArry[pageKey][albumKey]["songs"][songKey];
                if (song.name === false || song.url === false) continue;

                const songResponse = await ipcRenderer.invoke("download", {
                    url: song.url,
                    folder: albumFolder,
                    subFolder: album.title,
                    file: song.filename,
                });
            }
        }
    }
    hideSpinner();
    await ipcRenderer.invoke('show-message', {
        message:`${songCount} songs downloaded!`,
        type: "info",
        title: "Download Complete",
    });
});
