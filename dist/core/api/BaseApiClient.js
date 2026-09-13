import { Config } from '../config/Config.js';
export class BaseApiClient {
    constructor(endpoint = '') {
        this.endpoint = endpoint;
        this.baseUrl = Config.getConfig().baseUrl;
    }
    async getAll() {
        return this.request(this.endpoint);
    }
    async getById(id) {
        return this.request(`${this.endpoint}/${id}`);
    }
    async create(entity) {
        return this.request(this.endpoint, {
            method: 'POST',
            body: JSON.stringify(entity),
        });
    }
    async update(id, entity) {
        return this.request(`${this.endpoint}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(entity),
        });
    }
    async delete(id) {
        return this.request(`${this.endpoint}/${id}`, {
            method: 'DELETE',
        });
    }
    buildUrl(path) {
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${this.baseUrl}/${cleanPath}`;
    }
    async request(path, options = {}) {
        const url = this.buildUrl(path);
        const headers = new Headers(options.headers);
        if (!headers.has('Content-Type') && options.body) {
            headers.set('Content-Type', 'application/json');
        }
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} url: ${url}`);
        }
        const data = await response.json();
        return { data, status: response.status };
    }
}
//# sourceMappingURL=BaseApiClient.js.map