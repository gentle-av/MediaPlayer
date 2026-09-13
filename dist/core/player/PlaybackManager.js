import { Config } from '../config/Config.js';
export class PlaybackManager {
    constructor(mediaPlayer, musicStore, videoStore) {
        this.mediaPlayer = mediaPlayer;
        this.musicStore = musicStore;
        this.videoStore = videoStore;
        this.currentType = 'none';
        this.pollingIntervalId = null;
        this.unsubscribeMusic = null;
        this.isAudioPaused = false;
        this.currentVideoPath = '';
        this.initSubscriptions();
    }
    async playVideo(videoItem) {
        this.stopCurrentPlayback();
        this.currentType = 'video';
        this.currentVideoPath = videoItem.path;
        this.mediaPlayer.setVisibility(true);
        this.mediaPlayer.updateMediaInfo(videoItem.name, 'Видео-трансляция', videoItem.path);
        this.mediaPlayer.setPlayState(true);
        await this.videoStore.openVideo(videoItem);
        this.startVideoPolling(videoItem.path);
    }
    playMusic(track) {
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
    async togglePlay() {
        if (this.currentType === 'music') {
            if (this.isAudioPaused) {
                this.mediaPlayer.audioEngine
                    .play()
                    .catch((error) => console.error(error));
                this.isAudioPaused = false;
                this.mediaPlayer.setPlayState(true);
            }
            else {
                this.mediaPlayer.audioEngine.pause();
                this.isAudioPaused = true;
                this.mediaPlayer.setPlayState(false);
            }
        }
        else if (this.currentType === 'video') {
            try {
                const response = await fetch(`${Config.getConfig().baseUrl}/api/video/toggle-play`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: this.currentVideoPath }),
                });
                if (response.ok) {
                    const status = await response.json();
                    this.mediaPlayer.setPlayState(status.isPlaying);
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    }
    async stop() {
        if (this.currentType === 'video') {
            try {
                await fetch(`${Config.getConfig().baseUrl}/api/video/close`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            catch (error) {
                console.error(error);
            }
        }
        this.stopCurrentPlayback();
    }
    playNextTrack() {
        if (this.currentType !== 'music')
            return;
        const track = this.musicStore.getCurrentTrack();
        if (!track)
            return;
        const nextIndex = this.musicStore.getTrackIndex(track) + 1;
        if (nextIndex < this.musicStore.getLibrarySize()) {
            const nextTrack = this.musicStore.getTrackByIndex(nextIndex);
            if (nextTrack)
                this.playMusic(nextTrack);
        }
    }
    playPreviousTrack() {
        if (this.currentType !== 'music')
            return;
        const track = this.musicStore.getCurrentTrack();
        if (!track)
            return;
        const previousIndex = this.musicStore.getTrackIndex(track) - 1;
        if (previousIndex >= 0) {
            const previousTrack = this.musicStore.getTrackByIndex(previousIndex);
            if (previousTrack)
                this.playMusic(previousTrack);
        }
    }
    stopCurrentPlayback() {
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
    dispose() {
        if (this.unsubscribeMusic)
            this.unsubscribeMusic();
        this.stopCurrentPlayback();
    }
    initSubscriptions() {
        this.unsubscribeMusic = this.musicStore.subscribe(() => {
            const track = this.musicStore.getCurrentTrack();
            if (track && this.currentType !== 'music') {
                this.playMusic(track);
            }
        });
    }
    startVideoPolling(videoPath) {
        if (this.pollingIntervalId)
            clearInterval(this.pollingIntervalId);
        this.pollingIntervalId = window.setInterval(async () => {
            try {
                const response = await fetch(`${Config.getConfig().baseUrl}/api/video/status?path=` +
                    `${encodeURIComponent(videoPath)}`);
                const status = await response.json();
                if (status.currentTime !== undefined && status.duration !== undefined) {
                    this.mediaPlayer.updateProgress(status.currentTime, status.duration);
                }
                if (status.ended || status.isPlaying === false) {
                    this.stopCurrentPlayback();
                }
            }
            catch (error) {
                console.error(error);
            }
        }, 1000);
    }
}
//# sourceMappingURL=PlaybackManager.js.map