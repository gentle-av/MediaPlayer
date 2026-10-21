export class BookItem {
    constructor(data) {
        this.icon = data.icon;
        this.isDirectory = data.isDirectory;
        this.isBook = data.isBook;
        this.name = data.name;
        this.path = data.path;
        this.size = data.size;
        this.format = data.format;
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
        };
    }
}
//# sourceMappingURL=BookItem.js.map