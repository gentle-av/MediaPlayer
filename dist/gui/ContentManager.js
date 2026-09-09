import { VideoContentContainer } from './containers/VideoContentContainer.js';
export class ContentManager {
    constructor(musicStore, videoStore, playlistStore, playbackManager) {
        this.musicStore = musicStore;
        this.videoStore = videoStore;
        this.playlistStore = playlistStore;
        this.playbackManager = playbackManager;
        this.videoContentContainer = new VideoContentContainer(this.videoStore, this.playbackManager);
    }
    async getVideoContent(contentArea) {
        await this.videoContentContainer.render(contentArea);
        return contentArea;
    }
}
//# sourceMappingURL=ContentManager.js.map