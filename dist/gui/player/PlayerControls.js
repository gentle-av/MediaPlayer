import { AudioTrackMenu } from '../menu/AudioTrackMenu.js';
export class PlayerControls {
    constructor() {
        this.playButtonIcon = null;
        this.audioStreamButton = null;
        this.audioTrackMenu = new AudioTrackMenu();
        this.activeVideoPath = '';
    }
    setPlayState(isPlaying) {
        if (!this.playButtonIcon) {
            return;
        }
        if (isPlaying) {
            this.playButtonIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
        }
        else {
            this.playButtonIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
        }
    }
    updateStreamButton(videoPath) {
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
    }
    render(onPlayPause, onStop) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'universal-bottom-player-controls';
        this.audioStreamButton = this.createAudioStreamButton();
        const skipBackwardBtn = this.createControlButton(`<polygon points="19 20 9 12 19 4 19 20"></polygon>
       <line x1="5" y1="19" x2="5" y2="5"></line>`);
        const standardPlayBtn = document.createElement('button');
        standardPlayBtn.className =
            'universal-bottom-player-btn universal-bottom-player-play';
        const playIconHolder = document.createElement('span');
        playIconHolder.className = 'play-icon-holder';
        playIconHolder.style.display = 'flex';
        standardPlayBtn.appendChild(playIconHolder);
        this.playButtonIcon = playIconHolder;
        this.setPlayState(false);
        standardPlayBtn.addEventListener('click', () => {
            onPlayPause();
        });
        const stopBtn = this.createControlButton('<rect x="4" y="4" width="16" height="16"></rect>', 'universal-bottom-player-stop');
        stopBtn.addEventListener('click', () => {
            onStop();
        });
        const skipForwardBtn = this.createControlButton(`<polygon points="5 4 15 12 5 20 5 4"></polygon>
       <line x1="19" y1="5" x2="19" y2="19"></line>`);
        controlsContainer.append(this.audioStreamButton, skipBackwardBtn, standardPlayBtn, stopBtn, skipForwardBtn);
        return controlsContainer;
    }
    createAudioStreamButton() {
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
    createControlButton(svgContent, additionalClass) {
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
//# sourceMappingURL=PlayerControls.js.map