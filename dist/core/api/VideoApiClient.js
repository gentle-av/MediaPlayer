import { BaseApiClient } from './BaseApiClient.js';
import { VideoLibrary } from '../entities/video/VideoLibrary.js';
export class VideoApiClient extends BaseApiClient {
    constructor() {
        super('api/video');
    }
    async listVideos(path = '/mnt/video') {
        try {
            const response = await this.request('api/video/list', {
                method: 'POST',
                body: JSON.stringify({ path }),
            });
            return VideoLibrary.fromJson(response.data);
        }
        catch (error) {
            console.error(error);
            return new VideoLibrary({ items: [], path, success: false });
        }
    }
    async openVideo(path) {
        try {
            const response = await this.request('api/video/open', {
                method: 'POST',
                body: JSON.stringify({ path }),
            });
            return response.data.success;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    async moveToTrash(targetFilePath) {
        try {
            const response = await this.request('api/trash', {
                method: 'POST',
                body: JSON.stringify({ path: targetFilePath }),
            });
            return response.status === 200;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    async deleteDirectory(targetDirectoryPath) {
        try {
            const response = await this.request('api/delete-directory', {
                method: 'POST',
                body: JSON.stringify({ path: targetDirectoryPath }),
            });
            return response.status === 200;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    async toggleVideoPlayback() {
        try {
            const response = await this.request('api/video/toggle-play', { method: 'POST' });
            return response.status === 200;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
    async getVideoStatus(videoPath) {
        try {
            const path = `api/video/status?path=${encodeURIComponent(videoPath)}`;
            const response = await this.request(path, { method: 'GET' });
            return response.data;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async closeVideo() {
        try {
            const response = await this.request('api/video/close', {
                method: 'POST',
            });
            return response.status === 200;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }
}
//# sourceMappingURL=VideoApiClient.js.map