/**
 * @file lib/stores/elasticsearch-store.js
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

const _ = require('lodash');
const elasticsearch = require('elasticsearch');

/**
 * The Elasticsearch store.
 */
class ElasticsearchStore {
    constructor() {
        this._client = new elasticsearch.Client({
            host: '127.0.0.1:9200',
            log: 'error',
        });
    }

    async dump(client, data) {
        if (data.objects.length === 0) {
            return;
        }

        switch (data.type) {
            case 'contact': { this.pushContact(data.objects); break; }
            case 'message': { this.pushMessage(data.objects); break; }

            default: {
                throw 'Unknown object type';
            }
        }
    }

    async pushContact(contacts) {
        await this._client.bulk({
            body: _.flatMap(contacts, (contact) => [
                { index: { _index: 'wt-contact', _type: 'contact', _id: contact.id } },
                contact,
            ]),
        });
    }

    async pushMessage(messages) {
        await this._client.bulk({
            body: _.flatMap(messages, (message) => [
                { index: { _index: 'wt-message', _type: 'message', _id: message.id } },
                message,
            ]),
        });
    }
}

module.exports = ElasticsearchStore;
