import { VideoItem } from "./VideoItem.js";

export class VideoLibrary {
  items: VideoItem[];
  path: string;
  success: boolean;

  constructor(data: {
    items: VideoItem[];
    path: string;
    success: boolean;
  }) {
    this.items = data.items;
    this.path = data.path;
    this.success = data.success;
  }

  static fromJson(json: any): VideoLibrary {
    const items = (json.items || []).map((item: any) => VideoItem.fromJson(item));
    return new VideoLibrary({
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

  getFolders(): VideoItem[] {
    return this.items.filter((item) => item.isDirectory);
  }

  getVideos(): VideoItem[] {
    return this.items.filter((item) => item.isVideo);
  }
}
