import * as cheerio from "cheerio";

async function getAlbumDetailsFromDOM(html) {
    const DOM = cheerio.load(html);
    let details = [];
    DOM("#content-full article[id^='post-'] h2 a").each((count, element) => {
        details.push({
            title: DOM(element).text(),
            link: DOM(element).attr("href"),
        });
    });
    return details;
}

async function getPagesArray(html) {
    const DOM = cheerio.load(html);
    const str = DOM("div.wp-pagenavi span.pages").text()
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

export {
    getAlbumDetailsFromDOM,
    getPagesArray
}
