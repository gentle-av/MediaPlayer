import { MusicStore } from '../core/store/MusicStore.js';
import { VideoStore } from '../core/store/VideoStore.js';
import { PlaylistStore } from '../core/store/PlaylistStore.js';
import { PlaybackManager } from '../core/player/PlaybackManager.js';
import { VideoContentContainer } from './containers/VideoContentContainer.js';
import { VideoItem } from '../core/entities/video/VideoItem.js';

export class ContentManager {
  private videoContentContainer: VideoContentContainer;

  constructor(
    private musicStore: MusicStore,
    private videoStore: VideoStore,
    private playlistStore: PlaylistStore,
    private playbackManager: PlaybackManager,
  ) {
    this.videoContentContainer = new VideoContentContainer(this.videoStore, this.playbackManager);
  }

  async getVideoContent(contentArea: HTMLElement): Promise<HTMLElement | null> {
    await this.videoContentContainer.render(contentArea);
    return contentArea;
  }

  async renderVideoContent(contentArea: HTMLElement, filteredItems?: VideoItem[]): Promise<HTMLElement | null> {
    await this.videoContentContainer.render(contentArea, filteredItems);
    return contentArea;
  }
}
