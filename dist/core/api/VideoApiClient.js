import { Config } from '../config/Config.js';
import { VideoLibrary } from '../entities/video/VideoLibrary.js';
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
                throw new Error(`HTTP error status ${response.status}`);
            }
            const data = await response.json();
            return VideoLibrary.fromJson(data);
        }
        catch (error) {
            console.error(error);
            return new VideoLibrary({
                items: [],
                path: path,
                success: false,
            });
        }
    }
    async openVideo(path) {
        try {
            const response = await fetch(`${this.baseUrl}/api/video/open`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error status ${response.status}`);
            }
            const data = await response.json();
            return data.success;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    async moveToTrash(targetFilePath) {
        const response = await fetch('/api/trash', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: targetFilePath }),
        });
        return response.ok;
    }
    async deleteDirectory(targetDirectoryPath) {
        const response = await fetch('/api/delete-directory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: targetDirectoryPath }),
        });
        return response.ok;
    }
}
//# sourceMappingURL=VideoApiClient.js.map