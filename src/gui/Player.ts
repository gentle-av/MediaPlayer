export class Player {
  private playerElement: HTMLElement | null = null;
  private trackNameElement: HTMLElement | null = null;
  private trackArtistElement: HTMLElement | null = null;
  private timeCurrentElement: HTMLElement | null = null;
  private timeTotalElement: HTMLElement | null = null;
  private progressFillElement: HTMLElement | null = null;
  private playButtonIcon: HTMLElement | null = null;
  private audioEngine: HTMLAudioElement;

  constructor() {
    this.audioEngine = new Audio();
  }

  public setVisibility(isVisible: boolean): void {
    if (this.playerElement) {
      this.playerElement.style.display = isVisible ? 'flex' : 'none';
    }
  }

  public updateMediaInfo(mediaTitle: string, mediaArtist: string): void {
    if (this.trackNameElement) {
      this.trackNameElement.textContent = mediaTitle;
    }
    if (this.trackArtistElement) {
      this.trackArtistElement.textContent = mediaArtist;
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
      const completionPercentage = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;
      this.progressFillElement.style.width = `${completionPercentage}%`;
    }
  }

  public setPlayState(isPlaying: boolean): void {
    if (this.playButtonIcon) {
      this.playButtonIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
  }

  public playAudio(sourceUrl: string, onPlaybackTick: (elapsed: number, duration: number) => void, onPlaybackEnd: () => void): void {
    this.audioEngine.src = sourceUrl;
    this.audioEngine.load();
    this.audioEngine.ontimeupdate = () => {
      onPlaybackTick(this.audioEngine.currentTime, this.audioEngine.duration || 0);
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
    return `${calculatedMinutes}:${calculatedSeconds < 10 ? '0' : ''}${calculatedSeconds}`;
  }

  render(): HTMLElement {
    const rootPlayerElement = document.createElement('div');
    rootPlayerElement.className = 'universal-bottom-player';
    rootPlayerElement.style.display = 'none';
    this.playerElement = rootPlayerElement;
    const contentWrapperElement = document.createElement('div');
    contentWrapperElement.className = 'universal-bottom-player-content';
    const metadataContainerElement = document.createElement('div');
    metadataContainerElement.className = 'universal-bottom-player-info';
    const previewArtElement = document.createElement('div');
    previewArtElement.className = 'universal-bottom-player-preview';
    const standardPreviewIcon = document.createElement('i');
    standardPreviewIcon.className = 'fas fa-music';
    previewArtElement.appendChild(standardPreviewIcon);
    metadataContainerElement.appendChild(previewArtElement);
    const textualTrackInfoContainer = document.createElement('div');
    textualTrackInfoContainer.className = 'universal-bottom-player-track-info';
    this.trackNameElement = document.createElement('div');
    this.trackNameElement.className = 'universal-bottom-player-track-name';
    this.trackNameElement.textContent = 'Нет трека';
    textualTrackInfoContainer.appendChild(this.trackNameElement);
    this.trackArtistElement = document.createElement('div');
    this.trackArtistElement.className = 'universal-bottom-player-track-artist';
    this.trackArtistElement.textContent = '—';
    textualTrackInfoContainer.appendChild(this.trackArtistElement);
    metadataContainerElement.appendChild(textualTrackInfoContainer);
    contentWrapperElement.appendChild(metadataContainerElement);
    const timelineContainerElement = document.createElement('div');
    timelineContainerElement.className = 'universal-bottom-player-progress';
    const flexProgressBarContainer = document.createElement('div');
    flexProgressBarContainer.className = 'universal-bottom-player-progress-bar-container';
    this.timeCurrentElement = document.createElement('span');
    this.timeCurrentElement.className = 'universal-bottom-player-time-current';
    this.timeCurrentElement.textContent = '0:00';
    flexProgressBarContainer.appendChild(this.timeCurrentElement);
    const backgroundProgressBarTrack = document.createElement('div');
    backgroundProgressBarTrack.className = 'universal-bottom-player-progress-bar';
    this.progressFillElement = document.createElement('div');
    this.progressFillElement.className = 'universal-bottom-player-progress-fill';
    backgroundProgressBarTrack.appendChild(this.progressFillElement);
    flexProgressBarContainer.appendChild(backgroundProgressBarTrack);
    this.timeTotalElement = document.createElement('span');
    this.timeTotalElement.className = 'universal-bottom-player-time-total';
    this.timeTotalElement.textContent = '0:00';
    flexProgressBarContainer.appendChild(this.timeTotalElement);
    timelineContainerElement.appendChild(flexProgressBarContainer);
    contentWrapperElement.appendChild(timelineContainerElement);
    const controlButtonsContainer = document.createElement('div');
    controlButtonsContainer.className = 'universal-bottom-player-controls';
    const skipBackwardButton = document.createElement('button');
    skipBackwardButton.className = 'universal-bottom-player-btn';
    const backwardButtonIcon = document.createElement('i');
    backwardButtonIcon.className = 'fas fa-step-backward';
    skipBackwardButton.appendChild(backwardButtonIcon);
    controlButtonsContainer.appendChild(skipBackwardButton);
    const standardPlayButton = document.createElement('button');
    standardPlayButton.className = 'universal-bottom-player-btn universal-bottom-player-play';
    this.playButtonIcon = document.createElement('i');
    this.playButtonIcon.className = 'fas fa-play';
    standardPlayButton.appendChild(this.playButtonIcon);
    controlButtonsContainer.appendChild(standardPlayButton);
    const stopButton = document.createElement('button');
    stopButton.className = 'universal-bottom-player-btn universal-bottom-player-stop';
    const stopButtonIcon = document.createElement('i');
    stopButtonIcon.className = 'fas fa-stop';
    stopButton.appendChild(stopButtonIcon);
    controlButtonsContainer.appendChild(stopButton);
    const skipForwardButton = document.createElement('button');
    skipForwardButton.className = 'universal-bottom-player-btn';
    const forwardButtonIcon = document.createElement('i');
    forwardButtonIcon.className = 'fas fa-step-forward';
    skipForwardButton.appendChild(forwardButtonIcon);
    controlButtonsContainer.appendChild(skipForwardButton);
    contentWrapperElement.appendChild(controlButtonsContainer);
    rootPlayerElement.appendChild(contentWrapperElement);
    return rootPlayerElement;
  }
}
