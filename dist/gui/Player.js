import { PlayerMetadata } from './player/PlayerMetadata.js';
import { PlayerTimeline } from './player/PlayerTimeline.js';
import { PlayerControls } from './player/PlayerControls.js';
export class Player {
    constructor() {
        this.playerElement = null;
        this.metadata = new PlayerMetadata();
        this.timeline = new PlayerTimeline();
        this.controls = new PlayerControls();
        this.onPlayPauseCallback = null;
        this.onStopCallback = null;
        this.onSeekCallback = null;
        this.audioEngine = new Audio();
    }
    setVisibility(isVisible) {
        if (this.playerElement) {
            if (isVisible) {
                this.playerElement.classList.add('visible');
            }
            else {
                this.playerElement.classList.remove('visible');
            }
        }
    }
    bindControls(onPlayPause, onStop, onSeek) {
        this.onPlayPauseCallback = onPlayPause;
        this.onStopCallback = onStop;
        if (onSeek) {
            this.onSeekCallback = onSeek;
        }
    }
    updateMediaInfo(mediaTitle, mediaArtist, videoPath, playbackType, albumName) {
        this.metadata.update(mediaTitle, mediaArtist, playbackType, albumName);
        this.controls.updateStreamButton(videoPath, playbackType);
        this.updateProgress(0, 0);
    }
    updateProgress(elapsedSeconds, totalSeconds) {
        this.timeline.update(elapsedSeconds, totalSeconds);
    }
    setPlayState(isPlaying) {
        this.controls.setPlayState(isPlaying);
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
    render() {
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
        const controlsContainer = this.controls.render(() => {
            if (this.onPlayPauseCallback) {
                this.onPlayPauseCallback();
            }
        }, () => {
            if (this.onStopCallback) {
                this.onStopCallback();
            }
        });
        contentWrapperElement.append(metadataContainer, timelineContainer, controlsContainer);
        rootPlayerElement.appendChild(contentWrapperElement);
        return rootPlayerElement;
    }
}
//# sourceMappingURL=Player.js.map