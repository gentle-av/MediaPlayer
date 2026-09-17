import { BaseApiClient } from './BaseApiClient.js';

export class AudioOutputApiClient extends BaseApiClient<unknown> {
  constructor() {
    super('api/audio');
  }

  public async getVolume(): Promise<number | null> {
    try {
      const response = await this.request<{
        success: boolean;
        data: { volume: number };
      }>('api/audio/volume', { method: 'GET' });
      if (!response.data?.success) return null;
      return response.data.data?.volume ?? null;
    } catch (error) {
      console.error('[AudioOutputApiClient] getVolume failed:', error);
      return null;
    }
  }

  public async setVolume(volume: number): Promise<boolean> {
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    try {
      const response = await this.request<{ success: boolean }>(
        'api/audio/volume',
        {
          method: 'POST',
          body: JSON.stringify({ volume: clamped }),
        },
      );
      return response.status === 200 && (response.data?.success ?? false);
    } catch (error) {
      console.error('[AudioOutputApiClient] setVolume failed:', error);
      return false;
    }
  }

  public async toggleMute(): Promise<boolean | null> {
    try {
      const response = await this.request<{
        success: boolean;
        data: { muted: boolean };
      }>('api/audio/mute', { method: 'POST' });
      if (!response.data?.success) return null;
      return response.data.data?.muted ?? null;
    } catch (error) {
      console.error('[AudioOutputApiClient] toggleMute failed:', error);
      return null;
    }
  }

  public async getOutput(): Promise<{
    current: string;
    available: string[];
  } | null> {
    try {
      const response = await this.request<{
        success: boolean;
        data: { current: string; available: string[] };
      }>('api/audio/output', { method: 'GET' });
      if (!response.data?.success) return null;
      return {
        current: response.data.data?.current ?? 'speakers',
        available: response.data.data?.available ?? [],
      };
    } catch (error) {
      console.error('[AudioOutputApiClient] getOutput failed:', error);
      return null;
    }
  }

  public async setOutput(output: string): Promise<boolean> {
    try {
      const response = await this.request<{
        success: boolean;
        error?: string;
      }>('api/audio/output', {
        method: 'POST',
        body: JSON.stringify({ output }),
      });
      return response.status === 200 && (response.data?.success ?? false);
    } catch (error) {
      console.error('[AudioOutputApiClient] setOutput failed:', error);
      return false;
    }
  }
}
