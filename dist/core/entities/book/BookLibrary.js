import { BookItem } from './BookItem.js';
export class BookLibrary {
    constructor(data) {
        this.items = data.items;
        this.path = data.path;
        this.success = data.success;
    }
    static fromJson(json) {
        const items = (json.items || []).map((item) => BookItem.fromJson(item));
        return new BookLibrary({
            items: items,
            path: json.path,
            success: json.success,
        });
    }
    toJson() {
        return {
            items: this.items.map((item) => item.toJson()),
            path: this.path,
            success: this.success,
        };
    }
    getFolders() {
        return this.items.filter((item) => item.isDirectory);
    }
    getBooks() {
        return this.items.filter((item) => item.isBook);
    }
}
//# sourceMappingURL=BookLibrary.js.map