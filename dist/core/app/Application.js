import { MusicStore } from "../store/MusicStore.js";
import { PlaylistStore } from "../store/PlaylistStore.js";
import { VideoStore } from "../store/VideoStore.js";
import { MainFrame } from "../../gui/MainFrame.js";
export class Application {
    constructor() {
        this.mainContainer = document.getElementById('main');
        this.musicStore = new MusicStore();
        this.playlistStore = new PlaylistStore(this.musicStore);
        this.videoStore = new VideoStore();
        this.mainFrame = new MainFrame();
        this.initialize();
    }
    async initialize() {
        try {
            await this.musicStore.loadTracksFromServer();
            console.log(`✅ Loaded ${this.musicStore.getLibrarySize()} tracks from server`);
        }
        catch (error) {
            console.error('Failed to load tracks:', error);
        }
    }
    getMusicStore() {
        return this.musicStore;
    }
    getPlaylistStore() {
        return this.playlistStore;
    }
    getVideoStore() {
        return this.videoStore;
    }
}
//# sourceMappingURL=Application.js.map