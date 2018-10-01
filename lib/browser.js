/**
 * @file lib/browser.js
 *
 * Copyright (C) 2018 | Giacomo Trudu aka `Wicker25`
 *
 * This file is part of WhatsTrapp.
 *
 * WhatsTrapp is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * WhatsTrapp is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WhatsTrapp. If not, see <https://www.gnu.org/licenses/>.
 */

const fs = require('fs');
const puppeteer = require('puppeteer');

const proxy = require('./proxy');

/**
 * The Browser handles the Chrome instance.
 */
class Browser {
    constructor(targetUrl) {
        this._targetUrl = targetUrl;
        this._browser = null;
        this._page = null;
    }

    async launch() {
        this._browser = await puppeteer.launch({
           headless: true,
           args: [
               '--no-sandbox',
               '--disable-setuid-sandbox',
               '--disable-dev-shm-usage',
               '--window-size=1366,1024',
           ],
        });

        this._browser.on('disconnected', async () => {
            await this._browser.close();
        });

        await this._openPage(this._targetUrl);
    };

    async injectJS(filePath, trigger) {
        const source = fs.readFileSync(filePath).toString();

        return this._page.evaluate(async ({ source, trigger }) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = source + '; ' + trigger;

            document.body.appendChild(script);
        }, { source, trigger });
    }

    async stop() {
        try {
            await this._browser.disconnect();
            await this._browser.close();
        } catch (e) {
            // pass
        }
    }

    async _openPage(url) {
        this._page = await this._browser.newPage();

        await this._page.setViewport({ width: 1366, height: 1024 });
        await this._page.setRequestInterception(true);
        await this._page.setUserAgent('Mozilla/5.0 Chrome/68.0.3440.84 Safari/537.36');

        this._page.on('request', proxy.interceptRequest((response) => {
            // Remove all the security headers (for supporting cross-origin WebSockets)
            const headers = response.headers();
            headers['content-security-policy'] = 'default-src * \'unsafe-inline\' \'unsafe-eval\' data: blob:;';
            headers['access-control-allow-origin'] = '*';

            return response;
        }, [url], this._page));

        return this._page.goto(url, {waitUntil: 'networkidle2'});
    }
}

module.exports = Browser;
