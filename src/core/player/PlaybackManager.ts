import { IMediaPlayer } from './IMediaPlayer.js';
import { MusicStore } from '../store/MusicStore.js';
import { VideoStore } from '../store/VideoStore.js';
import { VideoItem } from '../entities/video/VideoItem.js';
import { Metadata } from '../entities/music/Metadata.js';
import { Config } from '../config/Config.js';

export type PlaybackType = 'none' | 'video' | 'music';

export class PlaybackManager {
  private currentType: PlaybackType = 'none';
  private pollingIntervalId: number | null = null;
  private unsubscribeMusic: (() => void) | null = null;
  private isAudioPaused: boolean = false;
  private currentVideoPath: string = '';

  constructor(
    private mediaPlayer: IMediaPlayer,
    private musicStore: MusicStore,
    private videoStore: VideoStore,
  ) {
    this.initSubscriptions();
  }

  public async playVideo(videoItem: VideoItem): Promise<void> {
    this.stopCurrentPlayback();
    this.currentType = 'video';
    this.currentVideoPath = videoItem.path;
    this.mediaPlayer.setVisibility(true);
    this.mediaPlayer.updateMediaInfo(
      videoItem.name,
      'Видео-трансляция',
      videoItem.path,
    );
    this.mediaPlayer.setPlayState(true);
    await this.videoStore.openVideo(videoItem);
    this.startVideoPolling(videoItem.path);
  }

  public playMusic(track: Metadata): void {
    this.stopCurrentPlayback();
    this.currentType = 'music';
    this.isAudioPaused = false;
    this.mediaPlayer.setVisibility(true);
    this.mediaPlayer.updateMediaInfo(track.title, track.artist);
    fetch(`${Config.getConfig().baseUrl}/api/open-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: track.filePath }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          this.mediaPlayer.setPlayState(true);
          this.startVideoPolling(track.filePath);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    if (this.musicStore.getCurrentTrack() !== track) {
      this.musicStore.setCurrentTrack(track);
    }
  }

  public async togglePlay(): Promise<void> {
    if (this.currentType === 'music') {
      if (this.isAudioPaused) {
        (this.mediaPlayer as any).audioEngine
          .play()
          .catch((error: Error) => console.error(error));
        this.isAudioPaused = false;
        this.mediaPlayer.setPlayState(true);
      } else {
        (this.mediaPlayer as any).audioEngine.pause();
        this.isAudioPaused = true;
        this.mediaPlayer.setPlayState(false);
      }
    } else if (this.currentType === 'video') {
      try {
        const response = await fetch(
          `${Config.getConfig().baseUrl}/api/video/toggle-play`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: this.currentVideoPath }),
          },
        );
        if (response.ok) {
          const status = await response.json();
          this.mediaPlayer.setPlayState(status.isPlaying);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  public async stop(): Promise<void> {
    if (this.currentType === 'video') {
      try {
        await fetch(`${Config.getConfig().baseUrl}/api/video/close`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error(error);
      }
    }
    this.stopCurrentPlayback();
  }

  public playNextTrack(): void {
    if (this.currentType !== 'music') return;
    const track = this.musicStore.getCurrentTrack();
    if (!track) return;
    const nextIndex = this.musicStore.getTrackIndex(track) + 1;
    if (nextIndex < this.musicStore.getLibrarySize()) {
      const nextTrack = this.musicStore.getTrackByIndex(nextIndex);
      if (nextTrack) this.playMusic(nextTrack);
    }
  }

  public playPreviousTrack(): void {
    if (this.currentType !== 'music') return;
    const track = this.musicStore.getCurrentTrack();
    if (!track) return;
    const previousIndex = this.musicStore.getTrackIndex(track) - 1;
    if (previousIndex >= 0) {
      const previousTrack = this.musicStore.getTrackByIndex(previousIndex);
      if (previousTrack) this.playMusic(previousTrack);
    }
  }

  public stopCurrentPlayback(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
    if (this.currentType === 'music') {
      this.mediaPlayer.stopAudio();
      this.musicStore.setCurrentTrack(null);
    }
    this.currentType = 'none';
    this.currentVideoPath = '';
    this.isAudioPaused = false;
    this.mediaPlayer.setVisibility(false);
  }

  public dispose(): void {
    if (this.unsubscribeMusic) this.unsubscribeMusic();
    this.stopCurrentPlayback();
  }

  private initSubscriptions(): void {
    this.unsubscribeMusic = this.musicStore.subscribe(() => {
      const track = this.musicStore.getCurrentTrack();
      if (track && this.currentType !== 'music') {
        this.playMusic(track);
      }
    });
  }

  private startVideoPolling(videoPath: string): void {
    if (this.pollingIntervalId) clearInterval(this.pollingIntervalId);
    this.pollingIntervalId = window.setInterval(async () => {
      try {
        const response = await fetch(
          `${Config.getConfig().baseUrl}/api/video/status?path=` +
            `${encodeURIComponent(videoPath)}`,
        );
        const status = await response.json();
        if (status.currentTime !== undefined && status.duration !== undefined) {
          this.mediaPlayer.updateProgress(status.currentTime, status.duration);
        }
        if (status.ended || status.isPlaying === false) {
          this.stopCurrentPlayback();
        }
      } catch (error) {
        console.error(error);
      }
    }, 1000);
  }
}
