
const globalOptions = {
    headers: {
        Referer: "https://downloadming4.com/",
    },
};

async function getPage(url){
    let headers = {};
    return {
        url: url,
        method: 'GET',
        headers: { ...globalOptions.headers, ...headers }
    };
}

export {
    getPage
}