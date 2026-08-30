import { VideoLibrary } from "../entities/video/VideoLibrary.js";
import { Config } from "../config/Config.js";
export class VideoApiClient {
    constructor() {
        this.baseUrl = Config.getConfig().baseUrl;
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
            return VideoLibrary.fromJson(data);
        }
        catch (error) {
            console.error('Error loading video library:', error);
            return new VideoLibrary({
                items: [],
                path: path,
                success: false
            });
        }
    }
}
//# sourceMappingURL=VideoApiClient.js.map