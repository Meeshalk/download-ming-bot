const { readdir, lstat, access } = require("fs").promises;
import { shell } from "electron";
const path = require("path");

async function listFiles(folder) {
    await removeAllChildNodes("#output-files-div");
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
    let type = await getFileType(name);
    if (type !== null) {
        document.querySelector(`#${type}-files-div`).insertAdjacentHTML(
            "beforeend",
            `<div class="oa-file-row">
                <svg class="bi oa-icon" fill="currentColor">
                    <use xlink:href="../assets/oa.svg#folder"></use>
                </svg>
                <span class="flex-grow">${baseName}</span>
                <button
                    data-path="${filePath}"
                    class="oa-main-btn oa-btn-xs oa-btn-blue-grad"
                    title="Opens this file with default system app"
                >
                    Open
                </button>
            </div>`
        );
    } else {
        // error
    }
}

async function initFilesEventListeners() {
    document
        .querySelectorAll(".file-open-button")
        .forEach(async (openFileButton) => {
            openFileButton.addEventListener(
                "click",
                async (openFileClickEvent) => {
                    await shell.openPath(
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

async function fileExists(path) {
    try {
        return await access(path);
    } catch (error) {
        // console.log(error);
    }
    return false;
}

export { listFiles, fileExists };
