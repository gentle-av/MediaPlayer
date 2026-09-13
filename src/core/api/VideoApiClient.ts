import { BaseApiClient } from './BaseApiClient.js';
import { VideoLibrary } from '../entities/video/VideoLibrary.js';

export class VideoApiClient extends BaseApiClient<unknown> {
  constructor() {
    super('api/video');
  }

  public async listVideos(path: string = '/mnt/video'): Promise<VideoLibrary> {
    try {
      const response = await this.request<unknown>('api/video/list', {
        method: 'POST',
        body: JSON.stringify({ path }),
      });
      return VideoLibrary.fromJson(response.data);
    } catch (error) {
      console.error(error);
      return new VideoLibrary({ items: [], path, success: false });
    }
  }

  public async openVideo(path: string): Promise<boolean> {
    try {
      const response = await this.request<{ success: boolean }>(
        'api/video/open',
        {
          method: 'POST',
          body: JSON.stringify({ path }),
        },
      );
      return response.data.success;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async moveToTrash(targetFilePath: string): Promise<boolean> {
    try {
      const response = await this.request<unknown>('api/trash', {
        method: 'POST',
        body: JSON.stringify({ path: targetFilePath }),
      });
      return response.status === 200;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async deleteDirectory(targetDirectoryPath: string): Promise<boolean> {
    try {
      const response = await this.request<unknown>('api/delete-directory', {
        method: 'POST',
        body: JSON.stringify({ path: targetDirectoryPath }),
      });
      return response.status === 200;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
