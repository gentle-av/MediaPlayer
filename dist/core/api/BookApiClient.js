import { BaseApiClient } from './BaseApiClient.js';
import { BookLibrary } from '../entities/book/BookLibrary.js';
export class BookApiClient extends BaseApiClient {
    constructor() {
        super('api/books');
    }
    async listBooks(path = '/mnt/books') {
        try {
            const response = await this.request('api/books/list', {
                method: 'POST',
                body: JSON.stringify({ path }),
            });
            return BookLibrary.fromJson(response.data);
        }
        catch (error) {
            console.error('❌ [BookApiClient] listBooks failed:', error);
            return new BookLibrary({ items: [], path, success: false });
        }
    }
    async getBookContent(path) {
        try {
            const response = await this.request('api/books/content', {
                method: 'POST',
                body: JSON.stringify({ path }),
            });
            if (!response.data?.success)
                return null;
            return response.data.content ?? null;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async getBookMeta(path) {
        try {
            const response = await this.request('api/books/meta', {
                method: 'POST',
                body: JSON.stringify({ path }),
            });
            if (!response.data?.success)
                return null;
            return response.data.data ?? null;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async saveProgress(path, position) {
        try {
            const response = await this.request('api/books/progress', {
                method: 'POST',
                body: JSON.stringify({ path, position }),
            });
            return response.status === 200 && (response.data?.success ?? false);
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    async getProgress(path) {
        try {
            const response = await this.request('api/books/progress', {
                method: 'POST',
                body: JSON.stringify({ path }),
            });
            if (!response.data?.success)
                return null;
            return response.data.position ?? null;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async getAuthors() {
        try {
            const response = await this.request('api/books/authors', { method: 'GET' });
            if (!response.data?.success)
                return [];
            return response.data.authors ?? [];
        }
        catch (error) {
            console.error('[BookApiClient] getAuthors failed:', error);
            return [];
        }
    }
}
//# sourceMappingURL=BookApiClient.js.map