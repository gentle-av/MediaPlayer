export class VideoItem {
  icon: string;
  isDirectory: boolean;
  isVideo: boolean;
  name: string;
  path: string;
  size?: string;

  constructor(data: {
    icon: string;
    isDirectory: boolean;
    isVideo: boolean;
    name: string;
    path: string;
    size?: string;
  }) {
    this.icon = data.icon;
    this.isDirectory = data.isDirectory;
    this.isVideo = data.isVideo;
    this.name = data.name;
    this.path = data.path;
    this.size = data.size;
  }

  static fromJson(json: any): VideoItem {
    return new VideoItem({
      icon: json.icon,
      isDirectory: json.isDirectory,
      isVideo: json.isVideo,
      name: json.name,
      path: json.path,
      size: json.size,
    });
  }

  toJson(): any {
    return {
      icon: this.icon,
      isDirectory: this.isDirectory,
      isVideo: this.isVideo,
      name: this.name,
      path: this.path,
      size: this.size,
    };
  }
}
