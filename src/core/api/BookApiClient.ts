import { BaseApiClient } from './BaseApiClient.js';
import { BookLibrary } from '../entities/book/BookLibrary.js';

export interface BookAuthor {
  author: string;
  count: number;
}

export class BookApiClient extends BaseApiClient<unknown> {
  constructor() {
    super('api/books');
  }

  public async listBooks(path: string = '/mnt/books'): Promise<BookLibrary> {
    try {
      const response = await this.request<unknown>('api/books/list', {
        method: 'POST',
        body: JSON.stringify({ path }),
      });
      return BookLibrary.fromJson(response.data);
    } catch (error) {
      console.error('❌ [BookApiClient] listBooks failed:', error);
      return new BookLibrary({ items: [], path, success: false });
    }
  }

  public async getBookContent(path: string): Promise<string | null> {
    try {
      const response = await this.request<{ success: boolean; content: string }>(
        'api/books/content',
        {
          method: 'POST',
          body: JSON.stringify({ path }),
        },
      );
      if (!response.data?.success) return null;
      return response.data.content ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async getBookMeta(path: string): Promise<{
    title?: string;
    author?: string;
    pages?: number;
    format?: string;
  } | null> {
    try {
      const response = await this.request<{
        success: boolean;
        data: {
          title?: string;
          author?: string;
          pages?: number;
          format?: string;
        };
      }>('api/books/meta', {
        method: 'POST',
        body: JSON.stringify({ path }),
      });
      if (!response.data?.success) return null;
      return response.data.data ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async saveProgress(path: string, position: number): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>(
        'api/books/progress',
        {
          method: 'POST',
          body: JSON.stringify({ path, position }),
        },
      );
      return response.status === 200 && (response.data?.success ?? false);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async getProgress(path: string): Promise<number | null> {
    try {
      const response = await this.request<{
        success: boolean;
        position: number;
      }>('api/books/progress', {
        method: 'POST',
        body: JSON.stringify({ path }),
      });
      if (!response.data?.success) return null;
      return response.data.position ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async getAuthors(): Promise<BookAuthor[]> {
    try {
      const response = await this.request<{
        success: boolean;
        authors: BookAuthor[];
      }>('api/books/authors', { method: 'GET' });
      if (!response.data?.success) return [];
      return response.data.authors ?? [];
    } catch (error) {
      console.error('[BookApiClient] getAuthors failed:', error);
      return [];
    }
  }
}
