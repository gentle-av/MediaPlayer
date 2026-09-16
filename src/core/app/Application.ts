import { MainFrame } from '../../gui/MainFrame.js';
import { MusicStore } from '../store/MusicStore.js';
import { VideoStore } from '../store/VideoStore.js';
import { PlaylistStore } from '../store/PlaylistStore.js';
import { PlaybackManager } from '../player/PlaybackManager.js';
import { Player } from '../../gui/Player.js';
import { HashRouter } from '../player/HashRouter.js';
import { InitialPlaybackSyncService } from '../player/InitialPlaybackSyncService.js';

export class Application {
  private mainContainer: HTMLElement | null;
  private mainFrame: MainFrame;
  private musicStore: MusicStore;
  private videoStore: VideoStore;
  private playlistStore: PlaylistStore;
  private playbackManager: PlaybackManager;
  private player: Player;
  private hashRouter: HashRouter;
  private initialPlaybackSyncService: InitialPlaybackSyncService;

  constructor() {
    console.log('🚀 [Application] Инициализация конструктора...');
    this.mainContainer = document.getElementById('main');
    console.log('📌 [Application] Контейнер #main:', this.mainContainer);
    this.musicStore = new MusicStore();
    this.videoStore = new VideoStore();
    this.playlistStore = new PlaylistStore(this.musicStore);
    this.player = new Player();
    this.playbackManager = new PlaybackManager(
      this.player,
      this.musicStore,
      this.videoStore,
    );
    this.mainFrame = new MainFrame(
      this.musicStore,
      this.videoStore,
      this.playlistStore,
      this.playbackManager,
      this.player,
    );
    this.initialPlaybackSyncService = new InitialPlaybackSyncService(
      this.playbackManager,
      this.musicStore,
    );
    this.hashRouter = new HashRouter();
    this.render();
    this.initialize().catch((error) =>
      console.error('❌ [Application] Ошибка инициализации:', error),
    );
  }

  private render(): void {
    console.log('🎨 [Application] Запуск синхронного рендеринга интерфейса...');
    if (this.mainContainer) {
      this.mainContainer.innerHTML = '';
      const appElement = this.mainFrame.render();
      this.mainContainer.appendChild(appElement);
      console.log(
        '✅ [Application] Разметка MainFrame успешно добавлена в DOM-дерево.',
      );
    } else {
      console.error(
        '❌ [Application] Критическая ошибка: Контейнер #main не обнаружен на странице!',
      );
    }
  }

  private async initialize(): Promise<void> {
    console.log('⏳ [Application] Ожидание загрузки данных с серверов...');
    await this.mainFrame.initialize();
    console.log(
      '📦 [Application] Данные MainFrame загружены. Запуск InitialPlaybackSyncService...',
    );
    await this.initialPlaybackSyncService.syncPlaybackState();
    console.log(
      '✨ [Application] Асинхронная синхронизация плейбека завершена.',
    );
  }
}
