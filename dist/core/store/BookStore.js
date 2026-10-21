import { BookApiClient } from '../api/BookApiClient.js';
export class BookStore {
    constructor() {
        this.currentLibrary = null;
        this.currentPath = '/mnt/books';
        this.listeners = [];
        this.bookApiClient = new BookApiClient();
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
    async loadLibrary(path) {
        if (path) {
            this.currentPath = path;
        }
        this.currentLibrary = await this.bookApiClient.listBooks(this.currentPath);
        this.notifyListeners();
    }
    getItems() {
        return this.currentLibrary?.items || [];
    }
    getFolders() {
        return this.currentLibrary?.getFolders() || [];
    }
    getBooks() {
        return this.currentLibrary?.getBooks() || [];
    }
    getCurrentPath() {
        return this.currentPath;
    }
    getLibrary() {
        return this.currentLibrary;
    }
    isLoaded() {
        return this.currentLibrary !== null;
    }
    search(term) {
        if (!this.currentLibrary)
            return [];
        return this.currentLibrary.items.filter((item) => item.name.toLowerCase().includes(term.toLowerCase()));
    }
    clear() {
        this.currentLibrary = null;
        this.notifyListeners();
    }
    async openBook(item) {
        if (!item.isBook)
            return null;
        return this.bookApiClient.getBookContent(item.path);
    }
    async getBookMeta(item) {
        return this.bookApiClient.getBookMeta(item.path);
    }
    async saveProgress(path, position) {
        return this.bookApiClient.saveProgress(path, position);
    }
    async getProgress(path) {
        return this.bookApiClient.getProgress(path);
    }
    navigateToFolder(item) {
        if (item.isDirectory) {
            this.loadLibrary(item.path);
        }
    }
    notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }
}
//# sourceMappingURL=BookStore.js.map