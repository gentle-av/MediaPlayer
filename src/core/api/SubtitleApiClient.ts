import { BaseApiClient } from './BaseApiClient.js';

export interface SubtitleTrack {
  streamIndex: number;
  codec: string;
  language: string;
  title: string;
  isDefault: boolean;
  isForced: boolean;
}

export interface SubtitleTracksResponse {
  success: boolean;
  tracks: SubtitleTrack[];
  count: number;
}

export interface CurrentSubtitleResponse {
  success: boolean;
  hasTrack: boolean;
  track?: SubtitleTrack;
}

export class SubtitleApiClient extends BaseApiClient<unknown> {
  constructor() {
    super('api/video/subtitles');
  }

  public async getSubtitleTracks(): Promise<SubtitleTrack[]> {
    try {
      const response = await this.request<SubtitleTracksResponse>(
        'api/video/subtitles',
        { method: 'GET' },
      );
      if (!response.data?.success) return [];
      return response.data.tracks ?? [];
    } catch (error) {
      console.error('[SubtitleApiClient] getSubtitleTracks failed:', error);
      return [];
    }
  }

  public async getCurrentSubtitleTrack(): Promise<SubtitleTrack | null> {
    try {
      const response = await this.request<CurrentSubtitleResponse>(
        'api/video/subtitles/current',
        { method: 'GET' },
      );
      if (!response.data?.success || !response.data.hasTrack) return null;
      return response.data.track ?? null;
    } catch (error) {
      console.error(
        '[SubtitleApiClient] getCurrentSubtitleTrack failed:',
        error,
      );
      return null;
    }
  }

  public async setSubtitleTrack(streamIndex: number): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>(
        'api/video/subtitles/set',
        {
          method: 'POST',
          body: JSON.stringify({ streamIndex }),
        },
      );
      return response.status === 200 && (response.data?.success ?? false);
    } catch (error) {
      console.error('[SubtitleApiClient] setSubtitleTrack failed:', error);
      return false;
    }
  }

  public async disableSubtitles(): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>(
        'api/video/subtitles/disable',
        { method: 'POST' },
      );
      return response.status === 200 && (response.data?.success ?? false);
    } catch (error) {
      console.error('[SubtitleApiClient] disableSubtitles failed:', error);
      return false;
    }
  }
}
