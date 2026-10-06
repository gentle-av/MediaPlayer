import { Config } from '../config/Config.js';
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
        this.isAdvancing = false;
        this.musicApiClient = new MusicApiClient();
        this.videoApiClient = new VideoApiClient();
    }
    syncInitialType(type) {
        this.currentType = type;
        if (type !== 'none') {
            this.mediaPlayer.setVisibility(true);
        }
    }
    syncInitialVideoPath(path) {
        this.currentVideoPath = path;
    }
    async seek(seconds) {
        if (this.currentType === 'music') {
            await this.musicApiClient.seekAudioPlayback(seconds);
        }
        else if (this.currentType === 'video') {
            try {
                await fetch(`${Config.getConfig().baseUrl}/api/mpv/seek`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ time: seconds }),
                });
            }
            catch (error) {
                console.error(error);
            }
        }
    }
    async playVideo(videoItem) {
        this.stopCurrentPlayback();
        this.currentType = 'video';
        this.currentVideoPath = videoItem.path;
        this.mediaPlayer.setVisibility(true);
        this.mediaPlayer.updateMediaInfo(videoItem.name, 'Video-translation', videoItem.path, 'video');
        this.mediaPlayer.setPlayState(true);
        await this.videoStore.openVideo(videoItem);
        this.startPolling(videoItem.path);
    }
    async playMusic(track, playlistContext = []) {
        if (playlistContext.length === 0 &&
            this.currentType === 'music' &&
            this.currentPlaylist.some((t) => t.filePath === track.filePath)) {
            playlistContext = this.currentPlaylist;
        }
        const isSameContext = playlistContext.length > 0 &&
            this.currentPlaylist.length === playlistContext.length &&
            this.currentPlaylist[0]?.filePath === playlistContext[0]?.filePath;
        if (!isSameContext) {
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
            this.mediaPlayer.updateMediaInfo(track.title, track.artist, undefined, 'music', track.album);
            this.musicStore.setCurrentTrack(track);
            const paths = this.currentPlaylist.map((t) => t.filePath);
            const isSuccess = await this.musicApiClient.playAudioPlaylist(paths, this.currentTrackIndex);
            if (isSuccess) {
                this.mediaPlayer.setPlayState(true);
            }
            this.startPolling(track.filePath);
        }
        else {
            const newIndex = this.currentPlaylist.findIndex((t) => t.filePath === track.filePath);
            if (newIndex < 0) {
                console.warn('[PlaybackManager] Track not found in current playlist:', track.filePath);
                return this.playMusic(track, []);
            }
            this.currentTrackIndex = newIndex;
            this.mediaPlayer.updateMediaInfo(track.title, track.artist, undefined, 'music', track.album);
            this.musicStore.setCurrentTrack(track);
            const isSuccess = await this.musicApiClient.changeAudioTrackByIndex(this.currentTrackIndex);
            if (isSuccess) {
                this.isAudioPaused = false;
                this.mediaPlayer.setPlayState(true);
            }
            this.startPolling(track.filePath);
        }
    }
    async togglePlay() {
        if (this.currentType === 'music') {
            const isSuccess = await this.musicApiClient.toggleAudioPlayback(this.isAudioPaused);
            if (isSuccess) {
                this.isAudioPaused = !this.isAudioPaused;
                this.mediaPlayer.setPlayState(!this.isAudioPaused);
            }
        }
        else if (this.currentType === 'video') {
            const isSuccess = await this.videoApiClient.toggleVideoPlayback();
            if (isSuccess) {
                const status = await this.videoApiClient.getVideoStatus(this.currentVideoPath);
                if (status) {
                    this.mediaPlayer.setPlayState(!status.paused);
                }
            }
        }
    }
    async stop() {
        if (this.currentType === 'video') {
            await this.videoApiClient.closeVideo();
        }
        else if (this.currentType === 'music') {
            const playlistStore = window.app?.playlistStore;
            if (playlistStore) {
                const activePlaylistName = playlistStore.getActivePlaylistName();
                if (activePlaylistName) {
                    playlistStore.clearPlaylist(activePlaylistName);
                    this.currentPlaylist = [];
                    this.currentTrackIndex = -1;
                    await playlistStore
                        .syncWithServer(activePlaylistName)
                        .catch((err) => {
                        console.error(err);
                    });
                }
            }
            await this.musicApiClient.stopAudioPlayback();
        }
        this.stopCurrentPlayback();
    }
    playNextTrack() {
        if (this.isAdvancing) {
            return;
        }
        if (this.currentType !== 'music' || this.currentPlaylist.length === 0) {
            return;
        }
        const nextIndex = this.currentTrackIndex + 1;
        if (nextIndex < this.currentPlaylist.length) {
            this.isAdvancing = true;
            this.playMusic(this.currentPlaylist[nextIndex], this.currentPlaylist)
                .catch((error) => {
                console.warn(error);
            })
                .finally(() => {
                this.isAdvancing = false;
            });
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
            clearTimeout(this.pollingIntervalId);
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
        if (this.pollingIntervalId) {
            clearTimeout(this.pollingIntervalId);
            this.pollingIntervalId = null;
        }
        const executePollTick = async () => {
            if (this.currentType === 'none') {
                return;
            }
            try {
                const responseData = this.currentType === 'video'
                    ? await this.videoApiClient.getVideoStatus(targetPath)
                    : await this.musicApiClient.getPlaybackState();
                if (responseData) {
                    const metrics = responseData.data || responseData;
                    const current = metrics.currentTime;
                    const total = metrics.duration;
                    if (current !== undefined && total !== undefined) {
                        this.mediaPlayer.updateProgress(current, total);
                        const reachedEnd = total > 0 && current >= total - 2;
                        if (this.currentType === 'music' && reachedEnd) {
                            this.playNextTrack();
                        }
                    }
                    if (this.currentType === 'video' && metrics.paused !== undefined) {
                        this.mediaPlayer.setPlayState(!metrics.paused);
                    }
                    if (this.currentType === 'music' &&
                        typeof metrics.currentIndex === 'number' &&
                        metrics.currentIndex !== this.currentTrackIndex &&
                        metrics.currentIndex >= 0 &&
                        metrics.currentIndex < this.currentPlaylist.length) {
                        const newTrack = this.currentPlaylist[metrics.currentIndex];
                        if (newTrack) {
                            this.currentTrackIndex = metrics.currentIndex;
                            this.musicStore.setCurrentTrack(newTrack);
                            this.mediaPlayer.updateMediaInfo(newTrack.title, newTrack.artist, undefined, 'music', newTrack.album);
                        }
                    }
                }
            }
            catch (error) {
                console.warn(error);
            }
            this.pollingIntervalId = window.setTimeout(executePollTick, 1000);
        };
        this.pollingIntervalId = window.setTimeout(executePollTick, 600);
    }
}
//# sourceMappingURL=PlaybackManager.js.map