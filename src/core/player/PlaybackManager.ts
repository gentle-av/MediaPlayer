import { Player } from '../../gui/Player.js';
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
    private player: Player,
    private musicStore: MusicStore,
    private videoStore: VideoStore,
  ) {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.unsubscribeMusic = this.musicStore.subscribe(() => {
      const activeTrack = this.musicStore.getCurrentTrack();
      if (activeTrack && this.currentType !== 'music') {
        this.playMusic(activeTrack);
      }
    });
  }

  public async playVideo(videoItem: VideoItem): Promise<void> {
    this.stopCurrentPlayback();
    this.currentType = 'video';
    this.currentVideoPath = videoItem.path;
    this.player.setVisibility(true);
    this.player.updateMediaInfo(videoItem.name, 'Видео-трансляция');
    this.player.setPlayState(true);
    await this.videoStore.openVideo(videoItem);
    this.startVideoPolling(videoItem.path);
  }

  public playMusic(track: Metadata): void {
    this.stopCurrentPlayback();
    this.currentType = 'music';
    this.isAudioPaused = false;
    this.player.setVisibility(true);
    this.player.updateMediaInfo(track.title, track.artist);
    const audioUrl = `${Config.getConfig().baseUrl}/api/music/file?path=${encodeURIComponent(track.filePath)}`;
    this.player.playAudio(
      audioUrl,
      (elapsedSeconds, totalSeconds) => {
        this.player.updateProgress(elapsedSeconds, totalSeconds);
      },
      () => {
        this.handleMusicFinished();
      },
    );
    if (this.musicStore.getCurrentTrack() !== track) {
      this.musicStore.setCurrentTrack(track);
    }
  }

  public async togglePlay(): Promise<void> {
    if (this.currentType === 'music') {
      if (this.isAudioPaused) {
        (this.player as any).audioEngine.play().catch((playbackError: Error) => console.error(playbackError));
        this.isAudioPaused = false;
        this.player.setPlayState(true);
      } else {
        (this.player as any).audioEngine.pause();
        this.isAudioPaused = true;
        this.player.setPlayState(false);
      }
    } else if (this.currentType === 'video') {
      try {
        const toggleResponse = await fetch(`${Config.getConfig().baseUrl}/api/video/toggle-play`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: this.currentVideoPath }),
        });
        if (toggleResponse.ok) {
          const playbackStatus = await toggleResponse.json();
          this.player.setPlayState(playbackStatus.isPlaying);
        }
      } catch (networkError) {
        console.error(networkError);
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
      } catch (networkError) {
        console.error(networkError);
      }
    }
    this.stopCurrentPlayback();
  }

  public playNextTrack(): void {
    if (this.currentType !== 'music') {
      return;
    }
    const activeTrack = this.musicStore.getCurrentTrack();
    if (!activeTrack) {
      return;
    }
    const currentTrackIndex = this.musicStore.getTrackIndex(activeTrack);
    const nextTrackIndex = currentTrackIndex + 1;
    if (nextTrackIndex < this.musicStore.getLibrarySize()) {
      const nextTrack = this.musicStore.getTrackByIndex(nextTrackIndex);
      if (nextTrack) {
        this.playMusic(nextTrack);
      }
    }
  }

  public playPreviousTrack(): void {
    if (this.currentType !== 'music') {
      return;
    }
    const activeTrack = this.musicStore.getCurrentTrack();
    if (!activeTrack) {
      return;
    }
    const currentTrackIndex = this.musicStore.getTrackIndex(activeTrack);
    const previousTrackIndex = currentTrackIndex - 1;
    if (previousTrackIndex >= 0) {
      const previousTrack = this.musicStore.getTrackByIndex(previousTrackIndex);
      if (previousTrack) {
        this.playMusic(previousTrack);
      }
    }
  }

  private startVideoPolling(videoPath: string): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }
    this.pollingIntervalId = window.setInterval(async () => {
      try {
        const statusResponse = await fetch(`${Config.getConfig().baseUrl}/api/video/status?path=${encodeURIComponent(videoPath)}`);
        const remoteStatus = await statusResponse.json();
        if (remoteStatus.currentTime !== undefined && remoteStatus.duration !== undefined) {
          this.player.updateProgress(remoteStatus.currentTime, remoteStatus.duration);
        }
        if (remoteStatus.ended || remoteStatus.isPlaying === false) {
          this.stopCurrentPlayback();
        }
      } catch (pollingError) {
        console.error(pollingError);
      }
    }, 1000);
  }

  private handleMusicFinished(): void {
    this.playNextTrack();
  }

  public stopCurrentPlayback(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
    if (this.currentType === 'music') {
      this.player.stopAudio();
      this.musicStore.setCurrentTrack(null);
    }
    this.currentType = 'none';
    this.currentVideoPath = '';
    this.isAudioPaused = false;
    this.player.setVisibility(false);
  }

  public dispose(): void {
    if (this.unsubscribeMusic) {
      this.unsubscribeMusic();
    }
    this.stopCurrentPlayback();
  }
}
