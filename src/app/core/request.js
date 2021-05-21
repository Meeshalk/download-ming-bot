/**
 * Author: Meeshal k
 * Github: https://github.com/meeshalk
 * Part of a electron based desktop/native application
 *
 * Handles HTTP requests 
 */

import { net } from "electron";
import { download } from "electron-dl";
import { fileExists, joinPath, makeFolder } from "./fileSystem";

function request(options) {
    return new Promise((resolve, reject) => {
        const headers = options.headers || null;
        const body = options.body || null;

        // request init
        const request = net.request({
            method: options.method,
            url: options.url,
        });

        // setting headers
        if (headers !== null) {
            for (const header in headers) {
                request.setHeader(header, headers[header]);
            }
        }

        // set data when its passed
        if (body !== null) {
            request.write(body);
        }

        // sends the rest of the data
        request.end();

        // handles response
        request.on("response", (response) => {
            // local variable init
            let responseData = {};
            let chunktemp = "";
            let resCodeAt0 = (response.statusCode).toString().charAt(0);

            // handle net errors
            if (resCodeAt0 != '2') {
                responseData['error'] = true;

                switch (resCodeAt0) {
                    case '3':
                        responseData['errorType'] = '3xx Redirect Error!';
                        break;

                    case '4':
                        responseData['errorType'] = '4xx Client Error!';
                        break;

                    case '5':
                        responseData['errorType'] = '5xx Server Error!';
                        break;
                    default:
                        responseData['errorType'] = 'Unknown Error!';
                        break;
                }

            }else{
                responseData['error'] = false;
            }

            // collect response headers
            responseData["headers"] = response.headers;

            // get response data/body 
            response.on("data", (chunk) => {
                chunktemp = chunktemp + chunk.toString();
            });

            // check if request finished
            response.on("end", () => {
                // No more data in response, read chunk
                responseData["body"] = chunktemp;

                // send response back via callback
                resolve(responseData);
            });
        });
    });
}

async function donwnloadFile(window, options){
    // console.log(options);
    const {url, folder, subFolder, file } = options;
    let storeAt = folder;
    if (subFolder != null) {
        if(!await fileExists(folder, subFolder))
            storeAt = await makeFolder(folder, subFolder);
        else
            storeAt = await joinPath(folder, subFolder);
    }

    if(await fileExists(storeAt, file)){
        return true;
    }

    try {
        await download(window, url, {
            directory: storeAt,
            filename: file
        });
    } catch (error) {
        console.log(error);
    }
}

export { request, donwnloadFile };
