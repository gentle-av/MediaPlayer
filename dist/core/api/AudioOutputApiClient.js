import { BaseApiClient } from './BaseApiClient.js';
export class AudioOutputApiClient extends BaseApiClient {
    constructor() {
        super('api/audio');
    }
    async getVolume() {
        try {
            const response = await this.request('api/audio/volume', { method: 'GET' });
            if (!response.data?.success)
                return null;
            return response.data.data?.volume ?? null;
        }
        catch (error) {
            console.error('[AudioOutputApiClient] getVolume failed:', error);
            return null;
        }
    }
    async setVolume(volume) {
        const clamped = Math.max(0, Math.min(100, Math.round(volume)));
        try {
            const response = await this.request('api/audio/volume', {
                method: 'POST',
                body: JSON.stringify({ volume: clamped }),
            });
            return response.status === 200 && (response.data?.success ?? false);
        }
        catch (error) {
            console.error('[AudioOutputApiClient] setVolume failed:', error);
            return false;
        }
    }
    async toggleMute() {
        try {
            const response = await this.request('api/audio/mute', { method: 'POST' });
            if (!response.data?.success)
                return null;
            return response.data.data?.muted ?? null;
        }
        catch (error) {
            console.error('[AudioOutputApiClient] toggleMute failed:', error);
            return null;
        }
    }
    async getOutput() {
        try {
            const response = await this.request('api/audio/output', { method: 'GET' });
            if (!response.data?.success)
                return null;
            return {
                current: response.data.data?.current ?? 'speakers',
                available: response.data.data?.available ?? [],
            };
        }
        catch (error) {
            console.error('[AudioOutputApiClient] getOutput failed:', error);
            return null;
        }
    }
    async setOutput(output) {
        try {
            const response = await this.request('api/audio/output', {
                method: 'POST',
                body: JSON.stringify({ output }),
            });
            return response.status === 200 && (response.data?.success ?? false);
        }
        catch (error) {
            console.error('[AudioOutputApiClient] setOutput failed:', error);
            return false;
        }
    }
}
//# sourceMappingURL=AudioOutputApiClient.js.map