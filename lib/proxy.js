/**
 * @file lib/proxy.js
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

const fetch = require('node-fetch');
const { Response } = require('puppeteer/lib/NetworkManager');

const buildCookieHeader = (cookies) => {
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
};

const interceptRequest = (responseHandler, urlPatterns, page) => {
    return async (request) => {
        const url    = request.url(),
              method = request.method();

        if (!urlPatterns.includes(url)) {
            request.continue();
            return;
        }

        const cookies = await page.cookies(url);

        const headers = request.headers();
        headers['cookie'] = buildCookieHeader(cookies);

        const rawResponse = await fetch(url, {
            method: method,
            body: request.postData(),
            headers: headers,
        });

        const response = new Response(
            request._client,
            request,
            rawResponse.status,
            rawResponse.headers,
        );

        response.body = await rawResponse.buffer();

        await request.respond(
            responseHandler(response),
        );
    }
};

module.exports = {
    interceptRequest,
};
