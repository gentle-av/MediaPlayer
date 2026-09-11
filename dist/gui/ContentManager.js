import { VideoContentContainer } from './containers/VideoContentContainer.js';
import { MusicContentContainer } from './containers/MusicContentContainer.js';
export class ContentManager {
    constructor(musicStore, videoStore, playlistStore, playbackManager) {
        this.musicStore = musicStore;
        this.videoStore = videoStore;
        this.playlistStore = playlistStore;
        this.playbackManager = playbackManager;
        this.videoContentContainer = new VideoContentContainer(this.videoStore, this.playbackManager);
        this.musicContentContainer = new MusicContentContainer(this.musicStore, this.playbackManager);
    }
    async getVideoContent(contentArea) {
        await this.videoContentContainer.render(contentArea);
        return contentArea;
    }
    async renderVideoContent(contentArea, filteredItems) {
        await this.videoContentContainer.render(contentArea, filteredItems);
        return contentArea;
    }
    async getMusicContent(contentArea) {
        await this.musicContentContainer.render(contentArea);
        return contentArea;
    }
    async renderMusicContent(contentArea, filteredItems) {
        await this.musicContentContainer.render(contentArea, filteredItems);
        return contentArea;
    }
}
//# sourceMappingURL=ContentManager.js.map