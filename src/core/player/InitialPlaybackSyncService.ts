import { MusicApiClient } from '../api/MusicApiClient.js';
import { VideoApiClient } from '../api/VideoApiClient.js';
import { PlaybackManager } from './PlaybackManager.js';
import { MusicStore } from '../store/MusicStore.js';

export class InitialPlaybackSyncService {
  private readonly musicApiClient = new MusicApiClient();
  private readonly videoApiClient = new VideoApiClient();

  constructor(
    private readonly playbackManager: PlaybackManager,
    private readonly musicStore: MusicStore,
  ) {}

  public async syncPlaybackState(): Promise<void> {
    try {
      console.log('🔍 [SyncService] Запрос статуса плейбека...');
      const [videoStatus, musicStatus] = await Promise.all([
        this.videoApiClient.getVideoStatus(''),
        this.musicApiClient.getAudioTimeInfo(),
      ]);
      console.log('📡 [SyncService] Ответ видео:', videoStatus);
      console.log('📡 [SyncService] Ответ аудио:', musicStatus);
      if (videoStatus && (videoStatus.playing || videoStatus.isPlaying)) {
        const videoPath = videoStatus.path || videoStatus.currentFile || '';
        console.log('🎬 [SyncService] Активное видеовещание:', videoPath);
        this.playbackManager.syncInitialType('video');
        this.playbackManager.syncInitialVideoPath(videoPath);
        this.playbackManager['mediaPlayer'].updateMediaInfo(
          videoStatus.name || 'Видео-трансляция',
          'Видео-трансляция',
          videoPath,
          'video',
        );
        this.playbackManager['mediaPlayer'].setPlayState(true);
        this.playbackManager.startPolling(videoPath);
        return;
      }
      const audioMetrics = musicStatus?.data || musicStatus;
      if (
        audioMetrics &&
        audioMetrics.currentTime > 0 &&
        audioMetrics.duration > 0
      ) {
        console.log('🎵 [SyncService] Активный аудиопоток:', audioMetrics);
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
          console.log('🗂️ [SyncService] Поиск метаданных трека:', track);
          if (track) {
            this.musicStore.setCurrentTrack(track);
            this.playbackManager['currentPlaylist'] = [track];
            this.playbackManager['currentTrackIndex'] = 0;
            this.playbackManager['mediaPlayer'].updateMediaInfo(
              track.title,
              track.artist,
              undefined,
              'music',
            );
            this.playbackManager['mediaPlayer'].setPlayState(
              audioMetrics.isPlaying ?? true,
            );
            this.playbackManager['mediaPlayer'].updateProgress(
              audioMetrics.currentTime,
              audioMetrics.duration,
            );
            this.playbackManager.startPolling(track.filePath);
            return;
          }
        }
        console.warn('⚠️ [SyncService] Путь к треку не определен.');
        this.playbackManager['mediaPlayer'].updateMediaInfo(
          'Active Playback',
          'Audio Stream',
          undefined,
          'music',
        );
        this.playbackManager['mediaPlayer'].updateProgress(
          audioMetrics.currentTime,
          audioMetrics.duration,
        );
        this.playbackManager.startPolling('');
      } else {
        console.log('🗒️ [SyncService] Активного воспроизведения нет.');
      }
    } catch (error) {
      console.error('❌ [SyncService] Ошибка синхронизации:', error);
    }
  }
}
