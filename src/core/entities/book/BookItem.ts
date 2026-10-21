export class BookItem {
  icon: string;
  isDirectory: boolean;
  isBook: boolean;
  name: string;
  path: string;
  size?: string;
  format?: string;
  hasCover?: boolean;
  author?: string;

  constructor(data: {
    icon: string;
    isDirectory: boolean;
    isBook: boolean;
    name: string;
    path: string;
    size?: string;
    format?: string;
    hasCover?: boolean;
    author?: string;
  }) {
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

  static fromJson(json: any): BookItem {
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

  toJson(): any {
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
