# Telegram bot using Bind image generator
Telegram bot created on JS using Cloudflare Workers to generate images on text.

Special thanks to this [repository](https://github.com/nociza/Bimg).

# Used
- Cloudflare Workers
- Supabase
- Some code of [Bimg](https://github.com/nociza/Bimg)
- Some code of [Hitokoto_bot](https://github.com/my-telegram-bots/hitokoto_bot)

# Usage
Set your supabase, telegram bot tokens and bind account cookie to authorize on website in order to generate and get those images.

The cookie you need from Bing is the _U cookie, this could be aquired using a [chrome-extension](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc) or by using the [Network tab](https://developers.google.com/web/tools/chrome-devtools/network/) in Chrome DevTools.

# Deploy using cmd
- `npm install wrangler`
- `wrangler deploy [src to worker.js] --name [worker name on cloudflare]`
- Done!

# TODO
- to find other way to get generated images
- error handlers when images are not generated or bind blocks the request due to banned words
- add Firefly image generator as an option
