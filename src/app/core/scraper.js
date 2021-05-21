import * as cheerio from "cheerio";
import { sleep } from "./common";

async function getAlbumDetailsFromDOM(html) {
    const DOM = cheerio.load(html);
    let details = [];
    DOM("#content-full article[id^='post-'] h2 a").each((count, element) => {
        details.push({
            title: DOM(element).text().replace("MP3 Songs", "").trim(),
            url: DOM(element).attr("href"),
        });
    });
    return details;
}

async function getPagesArray(html) {
    const DOM = cheerio.load(html);
    const str = DOM("div.wp-pagenavi span.pages").text();
    const regex = /(page\s(?<current>[0-9]{1,4})\sof\s(?<total>[0-9]{1,4}))/i;
    const matched = str.match(regex);
    let pages = [];
    let current = null;
    if (matched && matched.groups !== undefined) {
        current = matched.groups.current;
        for (let page = 1; page <= matched.groups.total; page++) {
            pages.push(page);
        }
    }

    if (current !== null && pages.length > 0)
        return { pages: pages, current: +current };
    return false;
}

async function getSongLinks(html) {
    const DOM = cheerio.load(html);
    let songs = [];
    DOM('a[href$=".mp3"]').each(async (i, el) => {
        let thisUrl = DOM(el).attr("href");
        songs[i] = { url: thisUrl };
        songs[i].name = await getNameOfSong(thisUrl);
        songs[i].bitrate = await getBitrate(thisUrl);
        songs[i].filename = await getFileName(songs[i].name, songs[i].bitrate);
    });
    await sleep(1000);
    return songs;
}

async function getNameOfSong(unparsed) {
    if (unparsed === null) return false;
    const nameRegex = /(.+\/(?<name>.+\.mp3))/i;
    const symbolRegex = /(?<rep>\/|\\|\:|\*|\?|\"|\<|\>|\|)/ig;
    const matched = decodeURI(unparsed).match(nameRegex);
    if (matched !== null && matched.groups !== undefined){
        return matched.groups["name"].replaceAll(symbolRegex, "_");
    }
    return false;
}

async function getBitrate(unparsed) {
    if (unparsed === null) return false;
    const nameRegex = /(.+(?<bit_str>(?<bitrate>[0-9]128|320|480)\s?kbps).+)/i;
    const matched = decodeURI(unparsed).match(nameRegex);
    if (matched !== null && matched.groups !== undefined)
        return matched.groups["bitrate"];
    return 128;
}

async function getFileName(name, bitrate) {
    if (name.toLowerCase().indexOf("downloadming"))
        return name.replace(/((www\.)?downloadming.*?\.[a-z0-9]{2,})/i, `${bitrate} kbps`);
    else return name.replace(".mp3", `- ${bitrate} kbps.mp3`);
}

export { getAlbumDetailsFromDOM, getPagesArray, getSongLinks };
