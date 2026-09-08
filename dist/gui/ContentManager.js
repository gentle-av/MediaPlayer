import { VideoContentContainer } from './containers/VideoContentContainer.js';
export class ContentManager {
    constructor(musicStore, videoStore, playlistStore) {
        this.musicStore = musicStore;
        this.videoStore = videoStore;
        this.playlistStore = playlistStore;
        this.videoContentContainer = new VideoContentContainer(this.videoStore);
    }
    async getVideoContent(contentArea) {
        await this.videoContentContainer.render(contentArea);
        return contentArea;
    }
}
//# sourceMappingURL=ContentManager.js.map