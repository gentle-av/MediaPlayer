import { VideoItem } from "./VideoItem.js";
export class VideoLibrary {
    constructor(data) {
        this.items = data.items;
        this.path = data.path;
        this.success = data.success;
    }
    static fromJson(json) {
        const items = (json.items || []).map((item) => VideoItem.fromJson(item));
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
//# sourceMappingURL=VideoLibrary.js.map