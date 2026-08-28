"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseApiClient = void 0;
const Config_1 = require("../config/Config");
class BaseApiClient {
    endpoint;
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    async getAll() {
        const response = await fetch(`${Config_1.Config.getConfig().baseUrl}/${this.endpoint}`);
        const data = await response.json();
        return {
            data,
            status: response.status
        };
    }
    async getById(id) {
        const response = await fetch(`${Config_1.Config.getConfig().baseUrl}/${this.endpoint}/${id}`);
        const data = await response.json();
        return {
            data,
            status: response.status
        };
    }
    async create(entity) {
        const response = await fetch(`${Config_1.Config.getConfig().baseUrl}/${this.endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entity),
        });
        const data = await response.json();
        return {
            data,
            status: response.status
        };
    }
    async update(id, entity) {
        const response = await fetch(`${Config_1.Config.getConfig().baseUrl}/${this.endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entity),
        });
        const data = await response.json();
        return {
            data,
            status: response.status
        };
    }
    async delete(id) {
        const response = await fetch(`${Config_1.Config.getConfig().baseUrl}/${this.endpoint}/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        return {
            data,
            status: response.status
        };
    }
}
exports.BaseApiClient = BaseApiClient;
