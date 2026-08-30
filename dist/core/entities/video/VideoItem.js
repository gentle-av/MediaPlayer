"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoItem = void 0;
class VideoItem {
    icon;
    isDirectory;
    isVideo;
    name;
    path;
    size;
    constructor(data) {
        this.icon = data.icon;
        this.isDirectory = data.isDirectory;
        this.isVideo = data.isVideo;
        this.name = data.name;
        this.path = data.path;
        this.size = data.size;
    }
    static fromJson(json) {
        return new VideoItem({
            icon: json.icon,
            isDirectory: json.isDirectory,
            isVideo: json.isVideo,
            name: json.name,
            path: json.path,
            size: json.size,
        });
    }
    toJson() {
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
exports.VideoItem = VideoItem;
