import { MusicApiClient } from '../api/MusicApiClient.js';
import { VideoApiClient } from '../api/VideoApiClient.js';
import { PlaybackManager } from './PlaybackManager.js';
import { MusicStore } from '../store/MusicStore.js';
import { PlaylistStore } from '../store/PlaylistStore.js';
import { Metadata } from '../entities/music/Metadata.js';

export class InitialPlaybackSyncService {
  private readonly musicApiClient = new MusicApiClient();
  private readonly videoApiClient = new VideoApiClient();

  constructor(
    private readonly playbackManager: PlaybackManager,
    private readonly musicStore: MusicStore,
    private readonly playlistStore: PlaylistStore,
  ) {}

  public async syncPlaybackState(): Promise<void> {
    try {
      console.log('🔍 [SyncService] Запрос статуса плейбека...');
      await this.loadPlaylistsFromServer();
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
          const track = this.findTrackByNormalizedPath(trackPath);
          console.log('🗂️ [SyncService] Поиск метаданных трека:', track);
          if (track) {
            this.musicStore.setCurrentTrack(track);
            await this.hydratePlaylistForTrack(track);
            this.playbackManager['mediaPlayer'].updateMediaInfo(
              track.title,
              track.artist,
              undefined,
              'music',
              track.album,
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

  private normalizePath(p: string): string {
    return p.replace(/\\/g, '/').replace(/\/+/g, '/').toLowerCase();
  }

  private findTrackByNormalizedPath(path: string): Metadata | undefined {
    const target = this.normalizePath(path);
    return this.musicStore
      .getAllTracks()
      .find((t) => this.normalizePath(t.filePath) === target);
  }

  private async loadPlaylistsFromServer(): Promise<void> {
    try {
      const playlists = await this.musicApiClient.getPlaylists();
      console.log(
        '📚 [SyncService] Получено плейлистов с сервера:',
        playlists.length,
      );
      for (const pl of playlists) {
        if (!this.playlistStore.getPlaylist(pl.name)) {
          try {
            this.playlistStore.createPlaylist(pl.name);
          } catch (e) {
            console.warn(e);
          }
        }
        const full = await this.musicApiClient.getPlaylist(pl.name);
        if (!full?.tracks) continue;
        const paths: string[] = full.tracks.map((t: any) => t.file_path);
        if (paths.length === 0) continue;
        try {
          this.playlistStore.clearPlaylist(pl.name);
        } catch (e) {
          console.warn(e);
        }
        const validPaths: string[] = [];
        for (const p of paths) {
          const track = this.findTrackByNormalizedPath(p);
          if (track) {
            validPaths.push(track.filePath);
          }
        }
        if (validPaths.length > 0) {
          try {
            this.playlistStore.addTracksToPlaylist(pl.name, validPaths);
          } catch (e) {
            console.warn(e);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ [SyncService] Ошибка загрузки плейлистов:', error);
    }
  }

  private async hydratePlaylistForTrack(track: Metadata): Promise<void> {
    try {
      const playlists = await this.musicApiClient.getPlaylists();
      for (const pl of playlists) {
        const full = await this.musicApiClient.getPlaylist(pl.name);
        if (!full?.tracks) continue;
        const paths: string[] = full.tracks.map((t: any) => t.file_path);
        const target = this.normalizePath(track.filePath);
        const idx = paths.findIndex(
          (p: string) => this.normalizePath(p) === target,
        );
        if (idx < 0) continue;
        const tracks: Metadata[] = [];
        for (const p of paths) {
          const meta = this.findTrackByNormalizedPath(p);
          if (meta) tracks.push(meta);
        }
        if (tracks.length === 0) continue;
        const realIndex = tracks.findIndex(
          (t) => this.normalizePath(t.filePath) === target,
        );
        if (realIndex < 0) continue;
        const backendState = await this.musicApiClient.getPlaybackState();
        const backendData = backendState?.data || backendState;
        const backendTrack = backendData?.currentTrack || '';
        const backendTotal = backendData?.totalTracks || 0;
        const needsSync =
          backendTotal !== tracks.length ||
          this.normalizePath(backendTrack) !== target;
        if (needsSync) {
          console.log(
            '🔄 [SyncService] Синхронизация плейлиста с mpv:',
            pl.name,
          );
          const pathsToSend = tracks.map((t) => t.filePath);
          const ok = await this.musicApiClient.playAudioPlaylist(pathsToSend);
          if (ok && realIndex > 0) {
            await this.musicApiClient.changeAudioTrackByIndex(realIndex);
          }
        }
        this.playbackManager['currentPlaylist'] = tracks;
        this.playbackManager['currentTrackIndex'] = realIndex;
        console.log(
          '📚 [SyncService] Плейлист восстановлен:',
          pl.name,
          'индекс',
          realIndex,
        );
        return;
      }
      console.log(
        '🗒️ [SyncService] Активный трек не найден ни в одном плейлисте:',
        track.filePath,
      );
    } catch (e) {
      console.warn('⚠️ [SyncService] Не удалось восстановить плейлист:', e);
    }
  }
}
