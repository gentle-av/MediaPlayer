import { IMediaPlayer } from '../core/player/IMediaPlayer.js';
import { PlayerMetadata } from '.player/PlayerMetadata.js';
import { PlayerTimeline } from '.player/PlayerTimeline.js';
import { PlayerControls } from '.player/PlayerControls.js';

export class Player implements IMediaPlayer {
  private playerElement: HTMLElement | null = null;
  private metadata = new PlayerMetadata();
  private timeline = new PlayerTimeline();
  private controls = new PlayerControls();
  private audioEngine: HTMLAudioElement;
  private onPlayPauseCallback: (() => void) | null = null;
  private onStopCallback: (() => void) | null = null;
  private onSeekCallback: ((seconds: number) => void) | null = null;

  constructor() {
    this.audioEngine = new Audio();
  }

  public setVisibility(isVisible: boolean): void {
    if (this.playerElement) {
      if (isVisible) {
        this.playerElement.classList.add('visible');
      } else {
        this.playerElement.classList.remove('visible');
      }
    }
  }

  public bindControls(
    onPlayPause: () => void,
    onStop: () => void,
    onSeek?: (seconds: number) => void,
  ): void {
    this.onPlayPauseCallback = onPlayPause;
    this.onStopCallback = onStop;
    if (onSeek) {
      this.onSeekCallback = onSeek;
    }
  }

  public updateMediaInfo(
    mediaTitle: string,
    mediaArtist: string,
    videoPath?: string,
  ): void {
    this.metadata.update(mediaTitle, mediaArtist);
    this.controls.updateStreamButton(videoPath);
    this.updateProgress(0, 0);
  }

  public updateProgress(elapsedSeconds: number, totalSeconds: number): void {
    this.timeline.update(elapsedSeconds, totalSeconds);
  }

  public setPlayState(isPlaying: boolean): void {
    this.controls.setPlayState(isPlaying);
  }

  public playAudio(
    sourceUrl: string,
    onPlaybackTick: (elapsed: number, duration: number) => void,
    onPlaybackEnd: () => void,
  ): void {
    this.audioEngine.src = sourceUrl;
    this.audioEngine.load();
    this.audioEngine.ontimeupdate = () => {
      onPlaybackTick(
        this.audioEngine.currentTime,
        this.audioEngine.duration || 0,
      );
    };
    this.audioEngine.onended = () => {
      onPlaybackEnd();
    };
    this.audioEngine.play().catch((playbackError) => {
      console.error(playbackError);
    });
    this.setPlayState(true);
  }

  public stopAudio(): void {
    this.audioEngine.pause();
    this.audioEngine.src = '';
    this.audioEngine.ontimeupdate = null;
    this.audioEngine.onended = null;
    this.setPlayState(false);
  }

  public render(): HTMLElement {
    const rootPlayerElement = document.createElement('div');
    rootPlayerElement.className = 'universal-bottom-player';
    this.playerElement = rootPlayerElement;
    const contentWrapperElement = document.createElement('div');
    contentWrapperElement.className = 'universal-bottom-player-content';
    const metadataContainer = this.metadata.render();
    const timelineContainer = this.timeline.render((seconds) => {
      if (this.onSeekCallback) {
        this.onSeekCallback(seconds);
      }
    });
    const controlsContainer = this.controls.render(
      () => {
        if (this.onPlayPauseCallback) {
          this.onPlayPauseCallback();
        }
      },
      () => {
        if (this.onStopCallback) {
          this.onStopCallback();
        }
      },
    );
    contentWrapperElement.append(
      metadataContainer,
      timelineContainer,
      controlsContainer,
    );
    rootPlayerElement.appendChild(contentWrapperElement);
    return rootPlayerElement;
  }
}
