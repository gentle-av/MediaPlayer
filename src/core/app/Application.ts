import { VideoStore } from "../store/VideoStore"

export class Application {
  private mainContainer: HTMLElement | null;
  private videoStore: VideoStore;

  constructor() {
    this.mainContainer = document.getElementById('main');
    this.videoStore = new VideoStore();
  }
}
