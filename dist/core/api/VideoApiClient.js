"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoApiClient = void 0;
const VideoLibrary_1 = require("../entities/video/VideoLibrary");
const Config_js_1 = require("../config/Config.js");
class VideoApiClient {
    baseUrl;
    constructor() {
        this.baseUrl = Config_js_1.Config.getConfig().baseUrl;
    }
    async listVideos(path = '/mnt/video') {
        try {
            const response = await fetch(`${this.baseUrl}/api/video/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return VideoLibrary_1.VideoLibrary.fromJson(data);
        }
        catch (error) {
            console.error('Error loading video library:', error);
            return new VideoLibrary_1.VideoLibrary({
                items: [],
                path: path,
                success: false
            });
        }
    }
}
exports.VideoApiClient = VideoApiClient;
