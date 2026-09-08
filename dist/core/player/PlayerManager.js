export class PlaybackManager {
    constructor(player, musicStore, videoStore) {
        this.player = player;
        this.musicStore = musicStore;
        this.videoStore = videoStore;
        this.currentType = 'none';
        this.pollingIntervalId = null;
        this.setupMusicSubscription();
    }
    setupMusicSubscription() { }
    async playVideo(videoItem) {
        this.stopCurrentPlayback();
        this.currentType = 'video';
        this.player.setVisibility(true);
        await this.videoStore.openVideo(videoItem);
        this.startVideoPolling(videoItem.path);
    }
    playMusic(track) {
        this.stopCurrentPlayback();
        this.currentType = 'music';
        this.player.setVisibility(true);
    }
    startVideoPolling(videoPath) {
        if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
        }
        this.pollingIntervalId = window.setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:9093/api/video/status?path=${encodeURIComponent(videoPath)}`);
                const status = await response.json();
                if (status.ended || !status.isPlaying) {
                    this.handleVideoFinished();
                }
            }
            catch (error) {
                console.error('Error polling video status:', error);
            }
        }, 1000);
    }
    handleVideoFinished() {
        if (this.currentType === 'video') {
            this.stopCurrentPlayback();
        }
    }
    stopCurrentPlayback() {
        if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
            this.pollingIntervalId = null;
        }
        this.currentType = 'none';
        this.player.setVisibility(false);
    }
}
//# sourceMappingURL=PlayerManager.js.map