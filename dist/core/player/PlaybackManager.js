import { MusicApiClient } from '../api/MusicApiClient.js';
import { VideoApiClient } from '../api/VideoApiClient.js';
export class PlaybackManager {
    constructor(mediaPlayer, musicStore, videoStore) {
        this.mediaPlayer = mediaPlayer;
        this.musicStore = musicStore;
        this.videoStore = videoStore;
        this.currentType = 'none';
        this.pollingIntervalId = null;
        this.isAudioPaused = false;
        this.currentVideoPath = '';
        this.currentPlaylist = [];
        this.currentTrackIndex = -1;
        this.musicApiClient = new MusicApiClient();
        this.videoApiClient = new VideoApiClient();
    }
    async playVideo(videoItem) {
        this.stopCurrentPlayback();
        this.currentType = 'video';
        this.currentVideoPath = videoItem.path;
        this.mediaPlayer.setVisibility(true);
        this.mediaPlayer.updateMediaInfo(videoItem.name, 'Видео-трансляция', videoItem.path);
        this.mediaPlayer.setPlayState(true);
        await this.videoStore.openVideo(videoItem);
        this.startPolling(videoItem.path);
    }
    async playMusic(track, playlistContext = []) {
        this.stopCurrentPlayback();
        this.currentType = 'music';
        this.isAudioPaused = false;
        if (playlistContext.length > 0) {
            this.currentPlaylist = playlistContext;
            this.currentTrackIndex = playlistContext.findIndex((t) => t.filePath === track.filePath);
        }
        else {
            this.currentPlaylist = [track];
            this.currentTrackIndex = 0;
        }
        this.mediaPlayer.setVisibility(true);
        this.mediaPlayer.updateMediaInfo(track.title, track.artist);
        if (this.musicStore.getCurrentTrack() !== track) {
            this.musicStore.setCurrentTrack(track);
        }
        const success = await this.musicApiClient.playAudioFile(track.filePath);
        if (success) {
            this.mediaPlayer.setPlayState(true);
            this.startPolling(track.filePath);
        }
    }
    async togglePlay() {
        if (this.currentType === 'music') {
            const success = await this.musicApiClient.toggleAudioPlayback(this.isAudioPaused);
            if (success) {
                this.isAudioPaused = !this.isAudioPaused;
                this.mediaPlayer.setPlayState(!this.isAudioPaused);
            }
        }
        else if (this.currentType === 'video') {
            await this.videoApiClient.toggleVideoPlayback();
        }
    }
    async stop() {
        if (this.currentType === 'video') {
            await this.videoApiClient.closeVideo();
        }
        else if (this.currentType === 'music') {
            await this.musicApiClient.stopAudioPlayback();
        }
        this.stopCurrentPlayback();
    }
    playNextTrack() {
        if (this.currentType !== 'music' || this.currentPlaylist.length === 0) {
            return;
        }
        const nextIndex = this.currentTrackIndex + 1;
        if (nextIndex < this.currentPlaylist.length) {
            this.playMusic(this.currentPlaylist[nextIndex], this.currentPlaylist);
        }
    }
    playPreviousTrack() {
        if (this.currentType !== 'music' || this.currentPlaylist.length === 0) {
            return;
        }
        const prevIndex = this.currentTrackIndex - 1;
        if (prevIndex >= 0) {
            this.playMusic(this.currentPlaylist[prevIndex], this.currentPlaylist);
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
        this.stopCurrentPlayback();
    }
    startPolling(targetPath) {
        if (this.pollingIntervalId)
            clearInterval(this.pollingIntervalId);
        this.pollingIntervalId = window.setInterval(async () => {
            const response = this.currentType === 'video'
                ? await this.videoApiClient.getVideoStatus(targetPath)
                : await this.musicApiClient.getAudioTimeInfo();
            if (!response)
                return;
            const metrics = response.data || response;
            let current;
            let total;
            if (metrics.currentTime !== undefined) {
                current = metrics.currentTime;
                total = metrics.duration;
            }
            else if (metrics.data && metrics.data.currentTime !== undefined) {
                current = metrics.data.currentTime;
                total = metrics.data.duration;
            }
            if (current !== undefined && total !== undefined) {
                this.mediaPlayer.updateProgress(current, total);
            }
            if (metrics.ended || metrics.isPlaying === false) {
                this.stopCurrentPlayback();
            }
        }, 1000);
    }
}
//# sourceMappingURL=PlaybackManager.js.map