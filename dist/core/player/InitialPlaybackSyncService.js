import { MusicApiClient } from '../api/MusicApiClient.js';
import { VideoApiClient } from '../api/VideoApiClient.js';
export class InitialPlaybackSyncService {
    constructor(playbackManager, musicStore) {
        this.playbackManager = playbackManager;
        this.musicStore = musicStore;
        this.musicApiClient = new MusicApiClient();
        this.videoApiClient = new VideoApiClient();
    }
    async syncPlaybackState() {
        try {
            console.log('🔍 [SyncService] Запрос текущего статуса плейбека с бэкенда...');
            const [videoStatus, musicStatus] = await Promise.all([
                this.videoApiClient.getVideoStatus(''),
                this.musicApiClient.getAudioTimeInfo(),
            ]);
            console.log('📡 [SyncService] Ответ от видео-сервера:', videoStatus);
            console.log('📡 [SyncService] Ответ от аудио-сервера:', musicStatus);
            if (videoStatus && (videoStatus.playing || videoStatus.isPlaying)) {
                console.log('🎬 [SyncService] Обнаружено активное видеовещание:', videoStatus.path);
                this.playbackManager.syncInitialType('video');
                this.playbackManager.syncInitialVideoPath(videoStatus.path || '');
                this.playbackManager['mediaPlayer'].updateMediaInfo(videoStatus.name || 'Видео-трансляция', 'Видео-трансляция', videoStatus.path);
                this.playbackManager['mediaPlayer'].setPlayState(true);
                this.playbackManager.startPolling(videoStatus.path || '');
                return;
            }
            const audioMetrics = musicStatus?.data || musicStatus;
            if (audioMetrics &&
                audioMetrics.currentTime > 0 &&
                audioMetrics.duration > 0) {
                console.log('🎵 [SyncService] Обнаружен активный аудиопоток по метрикам времени. Текущее время:', audioMetrics.currentTime);
                this.playbackManager.syncInitialType('music');
                let trackPath = audioMetrics.currentTrackPath;
                if (!trackPath && musicStatus.currentTrackPath) {
                    trackPath = musicStatus.currentTrackPath;
                }
                if (!trackPath) {
                    const matchedTrack = this.musicStore
                        .getAllTracks()
                        .find((t) => Math.abs(t.duration - audioMetrics.duration) < 2);
                    if (matchedTrack) {
                        trackPath = matchedTrack.filePath;
                    }
                }
                if (trackPath) {
                    const track = this.musicStore.getTrack(trackPath);
                    console.log('🗂️ [SyncService] Поиск метаданных трека в MusicStore:', track);
                    if (track) {
                        this.musicStore.setCurrentTrack(track);
                        this.playbackManager['currentPlaylist'] = [track];
                        this.playbackManager['currentTrackIndex'] = 0;
                        this.playbackManager['mediaPlayer'].updateMediaInfo(track.title, track.artist);
                        this.playbackManager['mediaPlayer'].setPlayState(audioMetrics.isPlaying ?? true);
                        this.playbackManager['mediaPlayer'].updateProgress(audioMetrics.currentTime, audioMetrics.duration);
                        this.playbackManager.startPolling(track.filePath);
                        return;
                    }
                }
                console.warn('⚠️ [SyncService] Путь к файлу трека не определен, инициализируем плеер в базовом режиме.');
                this.playbackManager['mediaPlayer'].updateMediaInfo('Активное воспроизведение', 'Аудио-поток');
                this.playbackManager['mediaPlayer'].updateProgress(audioMetrics.currentTime, audioMetrics.duration);
                this.playbackManager.startPolling('');
            }
            else {
                console.log('🗒️ [SyncService] На бэкенде действительно нет активного воспроизведения. Время и длительность равны нулю.');
            }
        }
        catch (error) {
            console.error('❌ [SyncService] Ошибка при выполнении запросов синхронизации:', error);
        }
    }
}
//# sourceMappingURL=InitialPlaybackSyncService.js.map