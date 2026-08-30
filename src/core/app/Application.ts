import { MusicStore } from "../store/MusicStore.js";
import { PlaylistStore } from "../store/PlaylistStore.js";
import { VideoStore } from "../store/VideoStore.js";

export class Application {
  private mainContainer: HTMLElement | null;
  private musicStore: MusicStore;
  private playlistStore: PlaylistStore;
  private videoStore: VideoStore;

  constructor() {
    this.mainContainer = document.getElementById('main');
    this.musicStore = new MusicStore();
    this.playlistStore = new PlaylistStore(this.musicStore);
    this.videoStore = new VideoStore();
    this.initialize();
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
