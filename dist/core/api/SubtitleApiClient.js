import { BaseApiClient } from './BaseApiClient.js';
export class SubtitleApiClient extends BaseApiClient {
    constructor() {
        super('api/video/subtitles');
    }
    async getSubtitleTracks() {
        try {
            const response = await this.request('api/video/subtitles', { method: 'GET' });
            if (!response.data?.success)
                return [];
            return response.data.tracks ?? [];
        }
        catch (error) {
            console.error('[SubtitleApiClient] getSubtitleTracks failed:', error);
            return [];
        }
    }
    async getCurrentSubtitleTrack() {
        try {
            const response = await this.request('api/video/subtitles/current', { method: 'GET' });
            if (!response.data?.success || !response.data.hasTrack)
                return null;
            return response.data.track ?? null;
        }
        catch (error) {
            console.error('[SubtitleApiClient] getCurrentSubtitleTrack failed:', error);
            return null;
        }
    }
    async setSubtitleTrack(streamIndex) {
        try {
            const response = await this.request('api/video/subtitles/set', {
                method: 'POST',
                body: JSON.stringify({ streamIndex }),
            });
            return response.status === 200 && (response.data?.success ?? false);
        }
        catch (error) {
            console.error('[SubtitleApiClient] setSubtitleTrack failed:', error);
            return false;
        }
    }
    async disableSubtitles() {
        try {
            const response = await this.request('api/video/subtitles/disable', { method: 'POST' });
            return response.status === 200 && (response.data?.success ?? false);
        }
        catch (error) {
            console.error('[SubtitleApiClient] disableSubtitles failed:', error);
            return false;
        }
    }
}
//# sourceMappingURL=SubtitleApiClient.js.map