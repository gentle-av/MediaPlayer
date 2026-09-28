import { MusicApiClient } from '../api/MusicApiClient.js';
import { VideoApiClient } from '../api/VideoApiClient.js';
export class InitialPlaybackSyncService {
    constructor(playbackManager, musicStore, playlistStore) {
        this.playbackManager = playbackManager;
        this.musicStore = musicStore;
        this.playlistStore = playlistStore;
        this.musicApiClient = new MusicApiClient();
        this.videoApiClient = new VideoApiClient();
    }
    async syncPlaybackState() {
        try {
            console.log('🔍 [SyncService] Запрос статуса плейбека...');
            await this.loadPlaylistsFromServer();
            const [videoStatus, musicStatus] = await Promise.all([
                this.videoApiClient.getVideoStatus(''),
                this.musicApiClient.getPlaybackState(),
            ]);
            console.log('📡 [SyncService] Ответ видео:', videoStatus);
            console.log('📡 [SyncService] Ответ аудио:', musicStatus);
            if (videoStatus && (videoStatus.playing || videoStatus.isPlaying)) {
                const videoPath = videoStatus.path || videoStatus.currentFile || '';
                console.log('🎬 [SyncService] Активное видеовещание:', videoPath);
                this.playbackManager.syncInitialType('video');
                this.playbackManager.syncInitialVideoPath(videoPath);
                this.playbackManager['mediaPlayer'].updateMediaInfo(videoStatus.name || 'Видео-трансляция', 'Видео-трансляция', videoPath, 'video');
                this.playbackManager['mediaPlayer'].setPlayState(true);
                this.playbackManager.startPolling(videoPath);
                return;
            }
            const audioMetrics = musicStatus?.data || musicStatus;
            if (audioMetrics &&
                audioMetrics.currentTime > 0 &&
                audioMetrics.duration > 0) {
                console.log('🎵 [SyncService] Активный аудиопоток:', audioMetrics);
                this.playbackManager.syncInitialType('music');
                let trackPath = audioMetrics.currentTrackPath;
                if (!trackPath && audioMetrics.currentTrack) {
                    trackPath = audioMetrics.currentTrack;
                }
                if (!trackPath && musicStatus.currentTrackPath) {
                    trackPath = musicStatus.currentTrackPath;
                }
                if (!trackPath && musicStatus.currentTrack) {
                    trackPath = musicStatus.currentTrack;
                }
                if (!trackPath) {
                    console.log('🗒️ [SyncService] Путь к треку отсутствует, пропуск синхронизации');
                    return;
                }
                const track = this.findTrackByNormalizedPath(trackPath);
                console.log('🗂️ [SyncService] Поиск метаданных трека:', track);
                if (!track) {
                    console.warn('⚠️ [SyncService] Метаданные трека не найдены');
                    return;
                }
                this.musicStore.setCurrentTrack(track);
                await this.hydratePlaylistForTrack(track);
                this.playbackManager['mediaPlayer'].updateMediaInfo(track.title, track.artist, undefined, 'music', track.album);
                this.playbackManager['mediaPlayer'].setPlayState(audioMetrics.isPlaying ?? true);
                this.playbackManager['mediaPlayer'].updateProgress(audioMetrics.currentTime, audioMetrics.duration);
                this.playbackManager.startPolling(track.filePath);
            }
            else {
                console.log('🗒️ [SyncService] Активного воспроизведения нет.');
            }
        }
        catch (error) {
            console.error('❌ [SyncService] Ошибка синхронизации:', error);
        }
    }
    normalizePath(p) {
        return p.replace(/\\/g, '/').replace(/\/+/g, '/').toLowerCase();
    }
    findTrackByNormalizedPath(path) {
        const target = this.normalizePath(path);
        return this.musicStore
            .getAllTracks()
            .find((t) => this.normalizePath(t.filePath) === target);
    }
    async loadPlaylistsFromServer() {
        try {
            const playlists = await this.musicApiClient.getPlaylists();
            console.log('📚 [SyncService] Получено плейлистов с сервера:', playlists.length);
            for (const pl of playlists) {
                if (!this.playlistStore.getPlaylist(pl.name)) {
                    try {
                        this.playlistStore.createPlaylist(pl.name);
                    }
                    catch (e) {
                        console.warn(e);
                    }
                }
                const full = await this.musicApiClient.getPlaylist(pl.name);
                if (!full?.tracks)
                    continue;
                const paths = full.tracks.map((t) => t.file_path);
                if (paths.length === 0)
                    continue;
                try {
                    this.playlistStore.clearPlaylist(pl.name);
                }
                catch (e) {
                    console.warn(e);
                }
                const validPaths = [];
                for (const p of paths) {
                    const track = this.findTrackByNormalizedPath(p);
                    if (track) {
                        validPaths.push(track.filePath);
                    }
                }
                if (validPaths.length > 0) {
                    try {
                        this.playlistStore.addTracksToPlaylist(pl.name, validPaths);
                    }
                    catch (e) {
                        console.warn(e);
                    }
                }
            }
        }
        catch (error) {
            console.warn('⚠️ [SyncService] Ошибка загрузки плейлистов:', error);
        }
    }
    async hydratePlaylistForTrack(track) {
        try {
            const playlists = await this.musicApiClient.getPlaylists();
            for (const pl of playlists) {
                const full = await this.musicApiClient.getPlaylist(pl.name);
                if (!full?.tracks)
                    continue;
                const paths = full.tracks.map((t) => t.file_path);
                const target = this.normalizePath(track.filePath);
                const idx = paths.findIndex((p) => this.normalizePath(p) === target);
                if (idx < 0)
                    continue;
                const tracks = [];
                for (const p of paths) {
                    const meta = this.findTrackByNormalizedPath(p);
                    if (meta)
                        tracks.push(meta);
                }
                if (tracks.length === 0)
                    continue;
                const realIndex = tracks.findIndex((t) => this.normalizePath(t.filePath) === target);
                if (realIndex < 0)
                    continue;
                this.playlistStore.setActivePlaylistName(pl.name);
                this.playbackManager['currentPlaylist'] = tracks;
                this.playbackManager['currentTrackIndex'] = realIndex;
                console.log('📚 [SyncService] Плейлист восстановлен:', pl.name, 'индекс', realIndex);
                return;
            }
            console.log('🗒️ [SyncService] Активный трек не найден ни в одном плейлисте:', track.filePath);
        }
        catch (e) {
            console.warn('⚠️ [SyncService] Не удалось восстановить плейлист:', e);
        }
    }
}
//# sourceMappingURL=InitialPlaybackSyncService.js.map