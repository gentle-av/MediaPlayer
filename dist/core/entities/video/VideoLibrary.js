"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLibrary = void 0;
const VideoItem_1 = require("./VideoItem");
class VideoLibrary {
    items;
    path;
    success;
    constructor(data) {
        this.items = data.items;
        this.path = data.path;
        this.success = data.success;
    }
    static fromJson(json) {
        const items = (json.items || []).map((item) => VideoItem_1.VideoItem.fromJson(item));
        return new VideoLibrary({
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
    getVideos() {
        return this.items.filter((item) => item.isVideo);
    }
}
exports.VideoLibrary = VideoLibrary;
