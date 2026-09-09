import { Player } from '../../gui/Player.js';
import { MusicStore } from '../store/MusicStore.js';
import { VideoStore } from '../store/VideoStore.js';
import { VideoItem } from '../entities/video/VideoItem.js';
import { Metadata } from '../entities/music/Metadata.js';

export type PlaybackType = 'none' | 'video' | 'music';

export class PlaybackManager {
  private currentType: PlaybackType = 'none';
  private pollingIntervalId: number | null = null;

  // Храним функции отписки, чтобы избежать утечек памяти
  private unsubscribeMusic: (() => void) | null = null;
  private unsubscribeVideo: (() => void) | null = null;

  constructor(
    private player: Player,
    private musicStore: MusicStore,
    private videoStore: VideoStore,
  ) {
    this.initSubscriptions();
  }

  /**
   * Инициализация подписок на изменения в хранилищах
   */
  private initSubscriptions(): void {
    // 1. Подписка на MusicStore
    this.unsubscribeMusic = this.musicStore.subscribe(() => {
      this.handleMusicStoreChange();
    });

    // 2. Подписка на VideoStore
    this.unsubscribeVideo = this.videoStore.subscribe(() => {
      this.handleVideoStoreChange();
    });
  }

  /**
   * Реакция на изменение состояния музыкального хранилища
   */
  private handleMusicStoreChange(): void {
    // Концепт: Если в будущем в MusicStore появится понятие "currentTrack",
    // менеджер сможет автоматически реагировать на его изменение здесь.
    console.log('🎵 PlaybackManager: MusicStore обновился');
  }

  /**
   * Реакция на изменение состояния видео хранилища
   */
  private handleVideoStoreChange(): void {
    console.log('🎬 PlaybackManager: VideoStore обновился');
  }

  /**
   * Запуск воспроизведения Видео
   */
  public async playVideo(videoItem: VideoItem): Promise<void> {
    // Важно: Сначала останавливаем все, что играло до этого
    this.stopCurrentPlayback();

    this.currentType = 'video';
    this.player.setVisibility(true); // Показываем плеер

    // Передаем команду в стор на открытие видео через API
    await this.videoStore.openVideo(videoItem);
    this.startVideoPolling(videoItem.path); // Начинаем опрос статуса
  }

  /**
   * Запуск воспроизведения Музыки
   */
  public playMusic(track: Metadata): void {
    this.stopCurrentPlayback();

    this.currentType = 'music';
    this.player.setVisibility(true); // Показываем плеер

    // Здесь будет логика обновления GUI плеере под метаданные трека
    // Например: this.player.updateTrackInfo(track.title, track.artist);
    console.log(`Now playing music: ${track.title} - ${track.artist}`);
  }

  /**
   * Опрос статуса внешнего видеоплеера (сервера)
   */
  private startVideoPolling(videoPath: string): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }

    this.pollingIntervalId = window.setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:9093/api/video/status?path=${encodeURIComponent(videoPath)}`);
        const status = await response.json();

        // Если видео завершилось или остановлено на сервере — тушим плеер в UI
        if (status.ended || !status.isPlaying) {
          this.handleVideoFinished();
        }
      } catch (error) {
        console.error('Error polling video status:', error);
      }
    }, 1000);
  }

  private handleVideoFinished(): void {
    if (this.currentType === 'video') {
      this.stopCurrentPlayback();
    }
  }

  /**
   * Полная остановка любого текущего воспроизведения
   */
  public stopCurrentPlayback(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }

    // Если играла музыка, здесь можно вызвать метод остановки аудио-движка

    this.currentType = 'none';
    this.player.setVisibility(false);
  }

  public dispose(): void {
    if (this.unsubscribeMusic) this.unsubscribeMusic();
    if (this.unsubscribeVideo) this.unsubscribeVideo();
    if (this.pollingIntervalId) clearInterval(this.pollingIntervalId);
  }
}
