import { BookItem } from '../entities/book/BookItem.js';
import { BookApiClient } from '../api/BookApiClient.js';
import { BookLibrary } from '../entities/book/BookLibrary.js';

export class BookStore {
  private currentLibrary: BookLibrary | null = null;
  private currentPath: string = '/mnt/books';
  private listeners: (() => void)[] = [];
  private bookApiClient: BookApiClient;

  constructor() {
    this.bookApiClient = new BookApiClient();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  async loadLibrary(path?: string): Promise<void> {
    if (path) {
      this.currentPath = path;
    }
    this.currentLibrary = await this.bookApiClient.listBooks(this.currentPath);
    this.notifyListeners();
  }

  getItems(): BookItem[] {
    return this.currentLibrary?.items || [];
  }

  getFolders(): BookItem[] {
    return this.currentLibrary?.getFolders() || [];
  }

  getBooks(): BookItem[] {
    return this.currentLibrary?.getBooks() || [];
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  getLibrary(): BookLibrary | null {
    return this.currentLibrary;
  }

  isLoaded(): boolean {
    return this.currentLibrary !== null;
  }

  search(term: string): BookItem[] {
    if (!this.currentLibrary) return [];
    return this.currentLibrary.items.filter((item) =>
      item.name.toLowerCase().includes(term.toLowerCase()),
    );
  }

  clear(): void {
    this.currentLibrary = null;
    this.notifyListeners();
  }

  async openBook(item: BookItem): Promise<string | null> {
    if (!item.isBook) return null;
    return this.bookApiClient.getBookContent(item.path);
  }

  async getBookMeta(item: BookItem) {
    return this.bookApiClient.getBookMeta(item.path);
  }

  async saveProgress(path: string, position: number): Promise<boolean> {
    return this.bookApiClient.saveProgress(path, position);
  }

  async getProgress(path: string): Promise<number | null> {
    return this.bookApiClient.getProgress(path);
  }

  navigateToFolder(item: BookItem): void {
    if (item.isDirectory) {
      this.loadLibrary(item.path);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}
