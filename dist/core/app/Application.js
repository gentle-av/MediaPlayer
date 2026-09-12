import { MainFrame } from '../../gui/MainFrame.js';
import { MusicStore } from '../store/MusicStore.js';
import { VideoStore } from '../store/VideoStore.js';
import { PlaylistStore } from '../store/PlaylistStore.js';
import { PlaybackManager } from '../player/PlaybackManager.js';
import { Player } from '../../gui/Player.js';
export class Application {
    constructor() {
        this.mainContainer = document.getElementById('main');
        this.musicStore = new MusicStore();
        this.videoStore = new VideoStore();
        this.playlistStore = new PlaylistStore(this.musicStore);
        this.player = new Player();
        this.playbackManager = new PlaybackManager(this.player, this.musicStore, this.videoStore);
        this.mainFrame = new MainFrame(this.musicStore, this.videoStore, this.playlistStore, this.playbackManager, this.player);
        this.initialize();
        this.render();
    }
    render() {
        if (this.mainContainer) {
            this.mainContainer.innerHTML = '';
            const appElement = this.mainFrame.render();
            this.mainContainer.appendChild(appElement);
        }
        else {
            console.error('Main container not found');
        }
    }
    async initialize() {
        return await this.mainFrame.initialize();
    }
}
//# sourceMappingURL=Application.js.map