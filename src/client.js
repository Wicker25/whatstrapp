/**
 * @file src/client.js
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

class Client {
    constructor() {
        this._client = null;
        this._container = document.getElementById('root');
    }

    connect() {
        this._client = new window.WebSocket(`ws://${location.hostname}:8080/`);
        this._client.addEventListener('open', () => {
            this._showMessage('Connected');

            this._setupConnection();
            this._startSession();
        });
    }

    _setupConnection() {
        this._client.addEventListener('message', (event) => {
            this._handleMessage(event);
        });

        this._client.addEventListener('close', () => {
            this._showMessage('Disconnected');
        });
    }

    _handleMessage(event) {
        const message = JSON.parse(event.data);

        switch (message.type) {
            case 'auth_challenge': { this._showQRCode(message.body);  break; }
            case 'auth_completed': { this._showMessage('Completed'); break; }

            default: {
                throw 'Unknown message type';
            }
        }
    }

    _startSession() {
        this._send('start_session');
    }

    _showMessage(message) {
        this._container.innerText = message;
    };

    _showQRCode(data) {
        const image = document.createElement('IMG');
        image.src = data;

        // Empty the container element
        while (this._container.firstChild) {
            this._container.removeChild(this._container.firstChild);
        }

        this._container.appendChild(image);
    };

    _send(type, body) {
        this._client.send(
            JSON.stringify({ type, body })
        );
    }
}

const client = new Client();
client.connect();
