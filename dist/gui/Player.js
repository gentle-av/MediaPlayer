import { AudioTrackMenu } from './menu/AudioTrackMenu.js';
export class Player {
    constructor() {
        this.playerElement = null;
        this.trackNameElement = null;
        this.trackArtistElement = null;
        this.timeCurrentElement = null;
        this.timeTotalElement = null;
        this.progressFillElement = null;
        this.playButtonIcon = null;
        this.audioStreamButton = null;
        this.audioTrackMenu = new AudioTrackMenu();
        this.activeVideoPath = '';
        this.audioEngine = new Audio();
    }
    setVisibility(isVisible) {
        if (this.playerElement) {
            this.playerElement.style.display = isVisible ? 'flex' : 'none';
        }
    }
    updateMediaInfo(mediaTitle, mediaArtist, videoPath) {
        if (this.trackNameElement) {
            this.trackNameElement.textContent = mediaTitle;
        }
        if (this.trackArtistElement) {
            this.trackArtistElement.textContent = mediaArtist;
        }
        if (videoPath) {
            this.activeVideoPath = videoPath;
            if (this.audioStreamButton) {
                this.audioStreamButton.style.setProperty('display', 'flex', 'important');
            }
        }
        else {
            this.activeVideoPath = '';
            if (this.audioStreamButton) {
                this.audioStreamButton.style.setProperty('display', 'none', 'important');
            }
        }
        this.updateProgress(0, 0);
    }
    updateProgress(elapsedSeconds, totalSeconds) {
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
    setPlayState(isPlaying) {
        if (this.playButtonIcon) {
            if (isPlaying) {
                this.playButtonIcon.innerHTML = `
          <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        `;
            }
            else {
                this.playButtonIcon.innerHTML = `
          <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
            }
        }
    }
    playAudio(sourceUrl, onPlaybackTick, onPlaybackEnd) {
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
    stopAudio() {
        this.audioEngine.pause();
        this.audioEngine.src = '';
        this.audioEngine.ontimeupdate = null;
        this.audioEngine.onended = null;
        this.setPlayState(false);
    }
    formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds === Infinity || totalSeconds < 0) {
            return '0:00';
        }
        const calculatedMinutes = Math.floor(totalSeconds / 60);
        const calculatedSeconds = Math.floor(totalSeconds % 60);
        return (`${calculatedMinutes}:` +
            `${calculatedSeconds < 10 ? '0' : ''}` +
            `${calculatedSeconds}`);
    }
    render() {
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
        previewArtElement.innerHTML = `
      <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--yellow)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `;
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
        flexProgressBarContainer.className =
            'universal-bottom-player-progress-bar-container';
        this.timeCurrentElement = document.createElement('span');
        this.timeCurrentElement.className = 'universal-bottom-player-time-current';
        this.timeCurrentElement.textContent = '0:00';
        flexProgressBarContainer.appendChild(this.timeCurrentElement);
        const backgroundProgressBarTrack = document.createElement('div');
        backgroundProgressBarTrack.className =
            'universal-bottom-player-progress-bar';
        this.progressFillElement = document.createElement('div');
        this.progressFillElement.className =
            'universal-bottom-player-progress-fill';
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
        this.audioStreamButton = document.createElement('button');
        this.audioStreamButton.className =
            'universal-bottom-player-btn audio-stream-btn';
        this.audioStreamButton.style.setProperty('display', 'none');
        this.audioStreamButton.style.setProperty('background', 'var(--bg2)');
        this.audioStreamButton.style.setProperty('border', '1px solid var(--bg3)');
        this.audioStreamButton.style.setProperty('border-radius', '50%');
        this.audioStreamButton.innerHTML = `
      <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;
        this.audioStreamButton.addEventListener('click', (clickEvent) => {
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            if (this.activeVideoPath) {
                this.audioTrackMenu.show(clickEvent, this.activeVideoPath);
            }
        });
        controlButtonsContainer.appendChild(this.audioStreamButton);
        const skipBackwardButton = document.createElement('button');
        skipBackwardButton.className = 'universal-bottom-player-btn';
        skipBackwardButton.innerHTML = `
      <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
        <polygon points="19 20 9 12 19 4 19 20"></polygon>
        <line x1="5" y1="19" x2="5" y2="5"></line>
      </svg>
    `;
        controlButtonsContainer.appendChild(skipBackwardButton);
        const standardPlayButton = document.createElement('button');
        standardPlayButton.className =
            'universal-bottom-player-btn universal-bottom-player-play';
        const playIconHolder = document.createElement('span');
        playIconHolder.className = 'play-icon-holder';
        playIconHolder.style.display = 'flex';
        standardPlayButton.appendChild(playIconHolder);
        this.playButtonIcon = playIconHolder;
        this.setPlayState(false);
        controlButtonsContainer.appendChild(standardPlayButton);
        const stopButton = document.createElement('button');
        stopButton.className =
            'universal-bottom-player-btn universal-bottom-player-stop';
        stopButton.innerHTML = `
      <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
        <rect x="4" y="4" width="16" height="16"></rect>
      </svg>
    `;
        controlButtonsContainer.appendChild(stopButton);
        const skipForwardButton = document.createElement('button');
        skipForwardButton.className = 'universal-bottom-player-btn';
        skipForwardButton.innerHTML = `
      <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
        <polygon points="5 4 15 12 5 20 5 4"></polygon>
        <line x1="19" y1="5" x2="19" y2="19"></line>
      </svg>
    `;
        controlButtonsContainer.appendChild(skipForwardButton);
        contentWrapperElement.appendChild(controlButtonsContainer);
        rootPlayerElement.appendChild(contentWrapperElement);
        return rootPlayerElement;
    }
}
//# sourceMappingURL=Player.js.map