import { IMediaPlayer } from '../core/player/IMediaPlayer.js';
import { AudioTrackMenu } from './menu/AudioTrackMenu.js';

export class Player implements IMediaPlayer {
  private playerElement: HTMLElement | null = null;
  private trackNameElement: HTMLElement | null = null;
  private trackArtistElement: HTMLElement | null = null;
  private timeCurrentElement: HTMLElement | null = null;
  private timeTotalElement: HTMLElement | null = null;
  private progressFillElement: HTMLElement | null = null;
  private playButtonIcon: HTMLElement | null = null;
  private audioStreamButton: HTMLButtonElement | null = null;
  private audioEngine: HTMLAudioElement;
  private audioTrackMenu = new AudioTrackMenu();
  private activeVideoPath = '';

  constructor() {
    this.audioEngine = new Audio();
  }

  public setVisibility(isVisible: boolean): void {
    if (this.playerElement) {
      this.playerElement.style.display = isVisible ? 'flex' : 'none';
    }
  }

  public updateMediaInfo(
    mediaTitle: string,
    mediaArtist: string,
    videoPath?: string,
  ): void {
    if (this.trackNameElement) this.trackNameElement.textContent = mediaTitle;
    if (this.trackArtistElement) {
      this.trackArtistElement.textContent = mediaArtist;
    }
    if (videoPath) {
      this.activeVideoPath = videoPath;
      if (this.audioStreamButton) {
        this.audioStreamButton.style.setProperty(
          'display',
          'flex',
          'important',
        );
      }
    } else {
      this.activeVideoPath = '';
      if (this.audioStreamButton) {
        this.audioStreamButton.style.setProperty(
          'display',
          'none',
          'important',
        );
      }
    }
    this.updateProgress(0, 0);
  }

  public updateProgress(elapsedSeconds: number, totalSeconds: number): void {
    if (this.timeCurrentElement) {
      this.timeCurrentElement.textContent = this.formatTime(elapsedSeconds);
    }
    if (this.timeTotalElement) {
      this.timeTotalElement.textContent = this.formatTime(totalSeconds);
    }
    if (this.progressFillElement) {
      const completionPercentage =
        totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;
      this.progressFillElement.style.width = `${completionPercentage}%`;
    }
  }

  public setPlayState(isPlaying: boolean): void {
    if (!this.playButtonIcon) return;
    if (isPlaying) {
      this.playButtonIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
    } else {
      this.playButtonIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
    }
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

  private formatTime(totalSeconds: number): string {
    if (isNaN(totalSeconds) || totalSeconds === Infinity || totalSeconds < 0) {
      return '0:00';
    }
    const calculatedMinutes = Math.floor(totalSeconds / 60);
    const calculatedSeconds = Math.floor(totalSeconds % 60);
    return (
      `${calculatedMinutes}:` +
      `${calculatedSeconds < 10 ? '0' : ''}` +
      `${calculatedSeconds}`
    );
  }

  public render(): HTMLElement {
    const rootPlayerElement = document.createElement('div');
    rootPlayerElement.className = 'universal-bottom-player';
    rootPlayerElement.style.display = 'none';
    this.playerElement = rootPlayerElement;
    const contentWrapperElement = document.createElement('div');
    contentWrapperElement.className = 'universal-bottom-player-content';
    const metadataContainer = this.createMetadataContainer();
    const timelineContainer = this.createTimelineContainer();
    const controlsContainer = this.createControlsContainer();
    contentWrapperElement.append(
      metadataContainer,
      timelineContainer,
      controlsContainer,
    );
    rootPlayerElement.appendChild(contentWrapperElement);
    return rootPlayerElement;
  }

  private createMetadataContainer(): HTMLElement {
    const metadataContainer = document.createElement('div');
    metadataContainer.className = 'universal-bottom-player-info';
    const previewArt = document.createElement('div');
    previewArt.className = 'universal-bottom-player-preview';
    previewArt.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="var(--yellow)" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `;
    metadataContainer.appendChild(previewArt);
    const trackInfoContainer = document.createElement('div');
    trackInfoContainer.className = 'universal-bottom-player-track-info';
    this.trackNameElement = document.createElement('div');
    this.trackNameElement.className = 'universal-bottom-player-track-name';
    this.trackNameElement.textContent = 'Нет трека';
    trackInfoContainer.appendChild(this.trackNameElement);
    this.trackArtistElement = document.createElement('div');
    this.trackArtistElement.className = 'universal-bottom-player-track-artist';
    this.trackArtistElement.textContent = '—';
    trackInfoContainer.appendChild(this.trackArtistElement);
    metadataContainer.appendChild(trackInfoContainer);
    return metadataContainer;
  }

  private createTimelineContainer(): HTMLElement {
    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'universal-bottom-player-progress';
    const flexProgressBar = document.createElement('div');
    flexProgressBar.className =
      'universal-bottom-player-progress-bar-container';
    this.timeCurrentElement = document.createElement('span');
    this.timeCurrentElement.className = 'universal-bottom-player-time-current';
    this.timeCurrentElement.textContent = '0:00';
    flexProgressBar.appendChild(this.timeCurrentElement);
    const backgroundProgressBar = document.createElement('div');
    backgroundProgressBar.className = 'universal-bottom-player-progress-bar';
    this.progressFillElement = document.createElement('div');
    this.progressFillElement.className =
      'universal-bottom-player-progress-fill';
    backgroundProgressBar.appendChild(this.progressFillElement);
    flexProgressBar.appendChild(backgroundProgressBar);
    this.timeTotalElement = document.createElement('span');
    this.timeTotalElement.className = 'universal-bottom-player-time-total';
    this.timeTotalElement.textContent = '0:00';
    flexProgressBar.appendChild(this.timeTotalElement);
    timelineContainer.appendChild(flexProgressBar);
    return timelineContainer;
  }

  private createControlsContainer(): HTMLElement {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'universal-bottom-player-controls';
    this.audioStreamButton = this.createAudioStreamButton();
    const skipBackwardBtn = this.createControlButton(
      `<polygon points="19 20 9 12 19 4 19 20"></polygon>
       <line x1="5" y1="19" x2="5" y2="5"></line>`,
    );
    const standardPlayBtn = document.createElement('button');
    standardPlayBtn.className =
      'universal-bottom-player-btn universal-bottom-player-play';
    const playIconHolder = document.createElement('span');
    playIconHolder.className = 'play-icon-holder';
    playIconHolder.style.display = 'flex';
    standardPlayBtn.appendChild(playIconHolder);
    this.playButtonIcon = playIconHolder;
    this.setPlayState(false);
    const stopBtn = this.createControlButton(
      '<rect x="4" y="4" width="16" height="16"></rect>',
      'universal-bottom-player-stop',
    );
    const skipForwardBtn = this.createControlButton(
      `<polygon points="5 4 15 12 5 20 5 4"></polygon>
       <line x1="19" y1="5" x2="19" y2="19"></line>`,
    );
    controlsContainer.append(
      this.audioStreamButton,
      skipBackwardBtn,
      standardPlayBtn,
      stopBtn,
      skipForwardBtn,
    );
    return controlsContainer;
  }

  private createAudioStreamButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'universal-bottom-player-btn audio-stream-btn';
    Object.assign(btn.style, {
      display: 'none',
      background: 'var(--bg2)',
      border: '1px solid var(--bg3)',
      borderRadius: '50%',
    });
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.activeVideoPath) {
        this.audioTrackMenu.show(e, this.activeVideoPath);
      }
    });
    return btn;
  }

  private createControlButton(
    svgContent: string,
    additionalClass?: string,
  ): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'universal-bottom-player-btn';
    if (additionalClass) {
      btn.classList.add(additionalClass);
    }
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        ${svgContent}
      </svg>
    `;
    return btn;
  }
}
