import { Player } from '../../gui/Player.js';
import { MusicStore } from '../store/MusicStore.js';
import { VideoStore } from '../store/VideoStore.js';
import { VideoItem } from '../entities/video/VideoItem.js';
import { Metadata } from '../entities/music/Metadata.js';

export type PlaybackType = 'none' | 'video' | 'music';

export class PlaybackManager {
  private currentType: PlaybackType = 'none';
  private pollingIntervalId: number | null = null;

  constructor(
    private player: Player,
    private musicStore: MusicStore,
    private videoStore: VideoStore,
  ) {
    this.setupMusicSubscription();
  }

  private setupMusicSubscription(): void {}

  public async playVideo(videoItem: VideoItem): Promise<void> {
    this.stopCurrentPlayback();
    this.currentType = 'video';
    this.player.setVisibility(true);
    await this.videoStore.openVideo(videoItem);
    this.startVideoPolling(videoItem.path);
  }

  public playMusic(track: Metadata): void {
    this.stopCurrentPlayback();
    this.currentType = 'music';
    this.player.setVisibility(true);
  }

  private startVideoPolling(videoPath: string): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }
    this.pollingIntervalId = window.setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:9093/api/video/status?path=${encodeURIComponent(videoPath)}`);
        const status = await response.json();
        if (status.ended || !status.isPlaying) {
          this.handleVideoFinished();
        }
      } catch (error) {
        console.error('Error polling video status:', error);
      }
    }, 1000);
  }

  private handleVideoFinished(): void {
    if (this.currentType === 'video') {
      this.stopCurrentPlayback();
    }
  }

  public stopCurrentPlayback(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
    this.currentType = 'none';
    this.player.setVisibility(false);
  }
}
