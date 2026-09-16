import { BaseApiClient } from './BaseApiClient.js';

export class TvApiClient extends BaseApiClient<unknown> {
  private static readonly KEYCODE_POWER = 26;

  constructor() {
    super('api');
  }

  public async powerOn(): Promise<boolean> {
    try {
      const response = await this.request<{
        success: boolean;
        screen_on?: boolean;
        error?: string;
      }>('api/power/tv-on', { method: 'POST' });
      return response.status === 200 && response.data?.success === true;
    } catch (error) {
      console.error('[TvApiClient] powerOn failed:', error);
      return false;
    }
  }

  public async powerOff(): Promise<boolean> {
    return this.sendKeyEvent(TvApiClient.KEYCODE_POWER);
  }

  public async getTvState(): Promise<{
    connected: boolean;
    screen_on: boolean;
    wakefulness: string;
    error?: string;
  } | null> {
    try {
      const response = await this.request<{
        success: boolean;
        data: {
          connected: boolean;
          screen_on: boolean;
          wakefulness: string;
          error?: string;
        };
      }>('api/power/tv-state', { method: 'GET' });
      return response.data?.data ?? null;
    } catch (error) {
      console.error('[TvApiClient] getTvState failed:', error);
      return null;
    }
  }

  public async getPowerStatus(): Promise<{
    tv_connected: boolean;
    tv_address: string;
    media_player_running: boolean;
  } | null> {
    try {
      const response = await this.request<{
        success: boolean;
        data: {
          tv_connected: boolean;
          tv_address: string;
          media_player_running: boolean;
        };
      }>('api/power/status', { method: 'GET' });
      return response.data?.data ?? null;
    } catch (error) {
      console.error('[TvApiClient] getPowerStatus failed:', error);
      return null;
    }
  }

  public async adbConnect(address: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>(
        'api/adb/connect',
        {
          method: 'POST',
          body: JSON.stringify({ address }),
        },
      );
      return response.status === 200 && (response.data?.success ?? false);
    } catch (error) {
      console.error('[TvApiClient] adbConnect failed:', error);
      return false;
    }
  }

  public async adbStartServer(): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>(
        'api/adb/start-server',
        { method: 'POST' },
      );
      return response.status === 200 && (response.data?.success ?? false);
    } catch (error) {
      console.error('[TvApiClient] adbStartServer failed:', error);
      return false;
    }
  }

  public async sendKeyEvent(keycode: number): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>(
        'api/adb/keyevent',
        {
          method: 'POST',
          body: JSON.stringify({ keycode }),
        },
      );
      return response.status === 200 && (response.data?.success ?? false);
    } catch (error) {
      console.error(`[TvApiClient] sendKeyEvent(${keycode}) failed:`, error);
      return false;
    }
  }

  public async systemSleep(): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>(
        'api/system/sleep',
        { method: 'POST' },
      );
      return response.status === 200 && (response.data?.success ?? false);
    } catch (error) {
      console.error('[TvApiClient] systemSleep failed:', error);
      return false;
    }
  }
}
