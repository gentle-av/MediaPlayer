import { MusicStore } from "../store/MusicStore.js";
import { PlaylistStore } from "../store/PlaylistStore.js";
import { VideoStore } from "../store/VideoStore.js";
import { MainFrame } from "../../gui/MainFrame.js"

export class Application {
  private mainContainer: HTMLElement | null;
  private musicStore: MusicStore;
  private playlistStore: PlaylistStore;
  private videoStore: VideoStore;
  private mainFrame: MainFrame;

  constructor() {
    this.mainContainer = document.getElementById('main');
    this.musicStore = new MusicStore();
    this.playlistStore = new PlaylistStore(this.musicStore);
    this.videoStore = new VideoStore();
    this.mainFrame = new MainFrame(this.musicStore, this.videoStore, this.playlistStore);
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
    try {
      await this.musicStore.loadTracksFromServer();
      console.log(`✅ Loaded ${this.musicStore.getLibrarySize()} tracks from server`);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    }
  }

  getMusicStore(): MusicStore {
    return this.musicStore;
  }

  getPlaylistStore(): PlaylistStore {
    return this.playlistStore;
  }

  getVideoStore(): VideoStore {
    return this.videoStore;
  }
}
