const querystring = require('querystring-browser')
const delay = ms => new Promise(res => setTimeout(res, ms));
const authCookie = '' // Bind account "_U" cookie

const options = async (authCookie) => {
    return {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh;q=0.6",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "Referrer-Policy": "origin-when-cross-origin",
        referrer: "https://www.bing.com/images/create/",
        origin: "https://www.bing.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54",
        cookie: `_U=${authCookie}`,
        "sec-ch-ua": `"Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"`,
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
    }
}
const getImages = async (options, prompt) => {
    const urlEncodedPrompt = querystring.escape(prompt)
    const url = `https://www.bing.com/images/create?q=${urlEncodedPrompt}&rt=4&FORM=GENCRE`; // force use rt=4

    const response = await fetch(url, {
        method: 'POST',
        headers: options,
        credentials: undefined
    });

    let redirectUrl
    if (response.status === 200) {
        redirectUrl = response.url.replace("&nfy=1", "")
    }
    else if (response.status !== 302) {
        throw new Error("Redirect failed");
    }

    const requestId = redirectUrl.split("id=")[1];
    await fetch(redirectUrl, {
        method:'GET',
        headers: options,
        credentials: undefined
    });

    let promptWords = prompt.split(' ')
    let prompts = ""
    for (let j=0; j < promptWords.length; j++) {
        prompts += promptWords[j] + '-'
    }
    const pollingUrl = `https://www.bing.com/images/create/${prompts}/${requestId}?FORM=GUH2CR`;

    let imagesResponse;

    await delay(30000); // creating delay cause it takes approx. 20-30 seconds to generate images
    while (true) {
        imagesResponse = await fetch(pollingUrl, {
            method: 'GET',
            headers: options,
            credentials: undefined
        });
        if (imagesResponse.status !== 200) {
            throw new Error("Could not get results");
        }
        if (imagesResponse.data === "") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
        } else {
            break;
        }
    }

    let imagesJson = await imagesResponse.text()
    const imageLinks = imagesJson
        .match(/src="([^"]+)"/g)
        .map((src) => src.slice(5, -1));
    let normImages = imageLinks.slice(29, 33) // thing to rewrite, cause this parsing is wrong sometimes

    return Array.from(new Set(normImages.map((link) => link.split("?w=")[0])));
};

export const generateImagesLinks = async (prompt) => {
    if (!authCookie || !prompt) {
        throw new Error("Missing parameters");
    }
    const option = await options(authCookie)
    return await getImages(option, prompt);
};