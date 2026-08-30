import { MusicStore } from "../store/MusicStore"
import { PlaylistStore } from "../store/PlaylistStore"
import { VideoStore } from "../store/VideoStore"

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
  }
}
