import { MainFrame } from '../../gui/MainFrame.js';
import { MusicStore } from '../store/MusicStore.js';
import { VideoStore } from '../store/VideoStore.js';
import { PlaylistStore } from '../store/PlaylistStore.js';
import { PlaybackManager } from '../player/PlaybackManager.js';
import { Player } from '../../gui/Player.js';

export class Application {
  private mainContainer: HTMLElement | null;
  private mainFrame: MainFrame;
  private musicStore: MusicStore;
  private videoStore: VideoStore;
  private playlistStore: PlaylistStore;
  private playbackManager: PlaybackManager;
  private player: Player;

  constructor() {
    this.mainContainer = document.getElementById('main');
    this.musicStore = new MusicStore();
    this.videoStore = new VideoStore();
    this.playlistStore = new PlaylistStore(this.musicStore);
    this.player = new Player();
    this.playbackManager = new PlaybackManager(this.player, this.musicStore, this.videoStore);
    this.mainFrame = new MainFrame(this.musicStore, this.videoStore, this.playlistStore, this.playbackManager, this.player);
    this.initialize();
    this.render();
  }

  private render(): void {
    if (this.mainContainer) {
      this.mainContainer.innerHTML = '';
      const appElement = this.mainFrame.render();
      this.mainContainer.appendChild(appElement);
    } else {
      console.error('Main container not found');
    }
  }

  private async initialize(): Promise<void> {
    return await this.mainFrame.initialize();
  }
}
