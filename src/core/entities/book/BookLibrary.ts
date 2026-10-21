import { BookItem } from './BookItem.js';

export class BookLibrary {
  items: BookItem[];
  path: string;
  success: boolean;

  constructor(data: { items: BookItem[]; path: string; success: boolean }) {
    this.items = data.items;
    this.path = data.path;
    this.success = data.success;
  }

  static fromJson(json: any): BookLibrary {
    const items = (json.items || []).map((item: any) => BookItem.fromJson(item));
    return new BookLibrary({
      items: items,
      path: json.path,
      success: json.success,
    });
  }

  toJson(): any {
    return {
      items: this.items.map((item) => item.toJson()),
      path: this.path,
      success: this.success,
    };
  }

  getFolders(): BookItem[] {
    return this.items.filter((item) => item.isDirectory);
  }

  getBooks(): BookItem[] {
    return this.items.filter((item) => item.isBook);
  }
}
