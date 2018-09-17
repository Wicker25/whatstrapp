/**
 * @file src/types.js
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

export class Contact {
    static parse(payload) {
        const instance = new Contact();
        instance.id   = payload.id.user;
        instance.name = payload.name;
        instance.pushname = payload.pushname;

        return instance;
    }
}

export class Message {
    static parse(payload) {
        const instance = new Message();
        instance.body = payload.body;

        return instance;
    }
}

export class MessageQuery {
    static parse(payload) {
        const [fromMe, remote, id] = payload.split('_');

        return new MessageQuery({ id, remote, fromMe });
    }

    constructor({ id = '', remote = '', fromMe = true, count = 1000 }) {
        this.id     = id;
        this.remote = remote;
        this.fromMe = fromMe;

        this.count = count;
    }
}
