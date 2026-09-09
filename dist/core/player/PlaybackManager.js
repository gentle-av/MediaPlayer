import { Config } from '../config/Config.js';
export class PlaybackManager {
    constructor(player, musicStore, videoStore) {
        this.player = player;
        this.musicStore = musicStore;
        this.videoStore = videoStore;
        this.currentType = 'none';
        this.pollingIntervalId = null;
        this.unsubscribeMusic = null;
        this.isAudioPaused = false;
        this.currentVideoPath = '';
        this.initSubscriptions();
    }
    initSubscriptions() {
        this.unsubscribeMusic = this.musicStore.subscribe(() => {
            const activeTrack = this.musicStore.getCurrentTrack();
            if (activeTrack && this.currentType !== 'music') {
                this.playMusic(activeTrack);
            }
        });
    }
    async playVideo(videoItem) {
        this.stopCurrentPlayback();
        this.currentType = 'video';
        this.currentVideoPath = videoItem.path;
        this.player.setVisibility(true);
        this.player.updateMediaInfo(videoItem.name, 'Видео-трансляция');
        this.player.setPlayState(true);
        await this.videoStore.openVideo(videoItem);
        this.startVideoPolling(videoItem.path);
    }
    playMusic(track) {
        this.stopCurrentPlayback();
        this.currentType = 'music';
        this.isAudioPaused = false;
        this.player.setVisibility(true);
        this.player.updateMediaInfo(track.title, track.artist);
        const audioUrl = `${Config.getConfig().baseUrl}/api/music/file?path=${encodeURIComponent(track.filePath)}`;
        this.player.playAudio(audioUrl, (elapsedSeconds, totalSeconds) => {
            this.player.updateProgress(elapsedSeconds, totalSeconds);
        }, () => {
            this.handleMusicFinished();
        });
        if (this.musicStore.getCurrentTrack() !== track) {
            this.musicStore.setCurrentTrack(track);
        }
    }
    async togglePlay() {
        if (this.currentType === 'music') {
            if (this.isAudioPaused) {
                this.player.audioEngine.play().catch((playbackError) => console.error(playbackError));
                this.isAudioPaused = false;
                this.player.setPlayState(true);
            }
            else {
                this.player.audioEngine.pause();
                this.isAudioPaused = true;
                this.player.setPlayState(false);
            }
        }
        else if (this.currentType === 'video') {
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
            }
            catch (networkError) {
                console.error(networkError);
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
            catch (networkError) {
                console.error(networkError);
            }
        }
        this.stopCurrentPlayback();
    }
    playNextTrack() {
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
    playPreviousTrack() {
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
    startVideoPolling(videoPath) {
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
            }
            catch (pollingError) {
                console.error(pollingError);
            }
        }, 1000);
    }
    handleMusicFinished() {
        this.playNextTrack();
    }
    stopCurrentPlayback() {
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
    dispose() {
        if (this.unsubscribeMusic) {
            this.unsubscribeMusic();
        }
        this.stopCurrentPlayback();
    }
}
//# sourceMappingURL=PlaybackManager.js.map