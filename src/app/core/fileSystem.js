const { readdir, lstat, access, mkdir, writeFile } = require("fs").promises;
import { shell } from "electron";
const path = require("path");
const OUT_DIV = "#output-div";

async function saveFileTo(folder, name, content, options = {}) {
    return await writeFile(path.join(folder, name), content);
}

async function listFiles(folder) {
    await removeAllChildNodes(OUT_DIV);
    let files = await readdir(folder);
    for (const file in files) {
        const filePath = path.join(folder, files[file]);
        const fileStat = await lstat(filePath);

        if (!fileStat.isDirectory()) {
            continue;
        }

        await putFileOnUI(filePath, path.basename(files[file]));
    }
    await initFilesEventListeners();
}

async function putFileOnUI(filePath, name) {
    const baseName = path.parse(name).name;
    document.querySelector(OUT_DIV).insertAdjacentHTML(
        "beforeend",
        `<div class="oa-file-row">
            <svg class="bi oa-icon" fill="currentColor">
                <use xlink:href="../assets/oa.svg#folder"></use>
            </svg>
            <span class="flex-grow pr-1 overflow-ellipsis overflow-hidden
            whitespace-nowrap" style="max-width: 305px;">${baseName}</span>
            <button
                data-path="${filePath}"
                class="oa-main-btn oa-btn-xs oa-btn-blue-grad folder-open-button"
                title="Opens this file with default system app"
            >
                Open
            </button>
        </div>`
    );
}

async function initFilesEventListeners() {
    document
        .querySelectorAll(".folder-open-button")
        .forEach(async (openFileButton) => {
            openFileButton.addEventListener(
                "click",
                async (openFileClickEvent) => {
                    await shell.showItemInFolder(
                        openFileClickEvent.target.getAttribute("data-path")
                    );
                }
            );
        });
}

async function removeAllChildNodes(selector) {
    const parent = document.querySelector(selector);
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    return true;
}

async function joinPath(root, name) {
    return path.join(root, name);
}

async function makeFolder(root, name) {
    try {
        let created = await mkdir(path.join(root, name));
        if (created === undefined) return path.join(root, name);
    } catch (error) {
        console.log(error);
        return false;
    }
    return false;
}

async function fileExists(root, name) {
    try {
        return (await access(path.join(root, name))) === undefined
            ? true
            : false;
    } catch (error) {
        // console.log(error);
        return false;
    }
}

export { listFiles, fileExists, makeFolder, joinPath, saveFileTo };
