import { BaseApiClient } from './BaseApiClient.js';
export class TvApiClient extends BaseApiClient {
    constructor() {
        super('api');
    }
    async powerOn() {
        try {
            const response = await this.request('api/power/tv-on', { method: 'POST' });
            return response.status === 200 && response.data?.success === true;
        }
        catch (error) {
            console.error('[TvApiClient] powerOn failed:', error);
            return false;
        }
    }
    async powerOff() {
        return this.sendKeyEvent(TvApiClient.KEYCODE_POWER);
    }
    async getTvState() {
        try {
            const response = await this.request('api/power/tv-state', { method: 'GET' });
            return response.data?.data ?? null;
        }
        catch (error) {
            console.error('[TvApiClient] getTvState failed:', error);
            return null;
        }
    }
    async getPowerStatus() {
        try {
            const response = await this.request('api/power/status', { method: 'GET' });
            return response.data?.data ?? null;
        }
        catch (error) {
            console.error('[TvApiClient] getPowerStatus failed:', error);
            return null;
        }
    }
    async adbConnect(address) {
        try {
            const response = await this.request('api/adb/connect', {
                method: 'POST',
                body: JSON.stringify({ address }),
            });
            return response.status === 200 && (response.data?.success ?? false);
        }
        catch (error) {
            console.error('[TvApiClient] adbConnect failed:', error);
            return false;
        }
    }
    async adbStartServer() {
        try {
            const response = await this.request('api/adb/start-server', { method: 'POST' });
            return response.status === 200 && (response.data?.success ?? false);
        }
        catch (error) {
            console.error('[TvApiClient] adbStartServer failed:', error);
            return false;
        }
    }
    async sendKeyEvent(keycode) {
        try {
            const response = await this.request('api/adb/keyevent', {
                method: 'POST',
                body: JSON.stringify({ keycode }),
            });
            return response.status === 200 && (response.data?.success ?? false);
        }
        catch (error) {
            console.error(`[TvApiClient] sendKeyEvent(${keycode}) failed:`, error);
            return false;
        }
    }
    async systemSleep() {
        try {
            const response = await this.request('api/system/sleep', { method: 'POST' });
            return response.status === 200 && (response.data?.success ?? false);
        }
        catch (error) {
            console.error('[TvApiClient] systemSleep failed:', error);
            return false;
        }
    }
}
TvApiClient.KEYCODE_POWER = 26;
//# sourceMappingURL=TvApiClient.js.map