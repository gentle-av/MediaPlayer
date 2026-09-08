import { MusicStore } from '../core/store/MusicStore.js';
import { VideoStore } from '../core/store/VideoStore.js';
import { PlaylistStore } from '../core/store/PlaylistStore.js';
import { VideoContentContainer } from './containers/VideoContentContainer.js';

export class ContentManager {
  private videoContentContainer: VideoContentContainer;

  constructor(
    private musicStore: MusicStore,
    private videoStore: VideoStore,
    private playlistStore: PlaylistStore,
  ) {
    this.videoContentContainer = new VideoContentContainer(this.videoStore);
  }

  async getVideoContent(contentArea: HTMLElement): Promise<HTMLElement | null> {
    await this.videoContentContainer.render(contentArea);
    return contentArea;
  }
}
