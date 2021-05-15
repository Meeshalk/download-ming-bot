/**
 * Author: Meeshal k
 * Github: https://github.com/meeshalk
 * Part of a electron based desktop/native application
 *
 */
import { dialog } from "electron";

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openDialog(options, win = null) {
    if (win === null) return await dialog.showOpenDialog(options);
    return await dialog.showOpenDialog(win, options);
}

async function showMessageBox(options, win = null) {
    if (win === null) return await dialog.showMessageBox(options);
    return await dialog.showMessageBox(win, options);
}

async function isValidUrl(str) {
    try {
        return new URL(str);
    } catch (urlPaseError) {
        return false;
    }
}

// async function getAlbumLinksFromPage(pageData) {
//     if (pageData instanceof Array) {
//         console.log("yes");
//         for (const page in pageData) {
//             if (
//                 pageData[page]["@type"] == "CollectionPage" &&
//                 pageData[page].hasOwnProperty("hasPart") &&
//                 pageData[page]['hasPart'] instanceof Array &&
//                 pageData[page]['hasPart'].length > 0
//             ) {
//                 console.log(page);
//                 console.log(pageData[page]);
//                 console.log(pageData[page]['hasPart']);
//             }
//         }
//     } else {
//         console.log("false");
//     }

//     console.log("end");
// }

async function getPagedUrl(url, page){
    url = new URL(url);
    if(page < 2)
        return url.href;
    
    url.pathname = `${url.pathname}/page/${page}`;
    return url.href;
}

function lowerTrim(str) {
    return str.replace(/\s+/g, " ").trim().toLowerCase();
}

function getKeyByValue(object, value) {
    for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
            if (object[prop] === value.toLowerCase()) return prop;
        }
    }
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function showSpinner() {
    document.querySelector("#cover-spin").classList.remove("hidden");
}

function hideSpinner() {
    document.querySelector("#cover-spin").classList.add("hidden");
}

export {
    sleep,
    openDialog,
    showMessageBox,
    getPagedUrl,
    isValidUrl,
    lowerTrim,
    getKeyByValue,
    toTitleCase,
    showSpinner,
    hideSpinner,
};
