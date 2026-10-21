export class BookItem {
    constructor(data) {
        this.icon = data.icon;
        this.isDirectory = data.isDirectory;
        this.isBook = data.isBook;
        this.name = data.name;
        this.path = data.path;
        this.size = data.size;
        this.format = data.format;
        this.hasCover = data.hasCover;
        this.author = data.author;
    }
    static fromJson(json) {
        return new BookItem({
            icon: json.icon,
            isDirectory: json.isDirectory,
            isBook: json.isBook,
            name: json.name,
            path: json.path,
            size: json.size,
            format: json.format,
            hasCover: json.has_cover,
            author: json.author,
        });
    }
    toJson() {
        return {
            icon: this.icon,
            isDirectory: this.isDirectory,
            isBook: this.isBook,
            name: this.name,
            path: this.path,
            size: this.size,
            format: this.format,
            hasCover: this.hasCover,
            author: this.author,
        };
    }
}
//# sourceMappingURL=BookItem.js.map