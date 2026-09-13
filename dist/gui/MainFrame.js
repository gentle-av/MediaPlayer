import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { Settings } from './Settings.js';
import { VideoContentContainer } from './containers/VideoContentContainer.js';
import { MusicContentContainer } from './containers/MusicContentContainer.js';
import { ComponentFactory } from './components/ComponentFactory.js';
export class MainFrame {
    constructor(musicStore, videoStore, playlistStore, playbackManager, player) {
        this.musicStore = musicStore;
        this.videoStore = videoStore;
        this.playlistStore = playlistStore;
        this.playbackManager = playbackManager;
        this.player = player;
        this.currentTab = 'video';
        this.contentArea = null;
        this.activeSearchTerm = '';
        this.currentLiveComponent = null;
        this.settings = new Settings();
        this.componentFactory = new ComponentFactory();
        this.initFactory();
        this.header = new Header(this.musicStore, this.playlistStore, this.playbackManager);
        this.sidebar = new Sidebar((selectedTab) => {
            this.switchTab(selectedTab);
        });
    }
    render() {
        const appContainer = document.createElement('div');
        appContainer.className = 'app-container';
        appContainer.appendChild(this.header.render());
        const bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'body-wrapper';
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        mainContent.appendChild(this.sidebar.render());
        this.contentArea = document.createElement('div');
        this.contentArea.className = 'content-area';
        mainContent.appendChild(this.contentArea);
        bodyWrapper.appendChild(mainContent);
        const renderedPlayer = this.player.render();
        renderedPlayer.classList.add('visible');
        bodyWrapper.appendChild(renderedPlayer);
        appContainer.appendChild(bodyWrapper);
        this.updateContent(this.currentTab);
        this.bindPlayerControls(appContainer);
        setTimeout(() => {
            this.header.togglePlaylistButtonVisibility(this.currentTab === 'audio');
        }, 0);
        this.bindHeaderEvents(appContainer);
        return appContainer;
    }
    async initialize() {
        try {
            await this.musicStore.loadTracksFromServer();
        }
        catch (error) {
            console.error(error);
        }
    }
    initFactory() {
        this.componentFactory.register('video', () => new VideoContentContainer(this.videoStore, this.playbackManager));
        this.componentFactory.register('audio', () => new MusicContentContainer(this.musicStore, this.playlistStore, this.playbackManager));
        this.componentFactory.register('settings', () => this.settings);
    }
    async switchTab(targetTab) {
        this.currentTab = targetTab;
        this.activeSearchTerm = '';
        const searchInput = document.getElementById('globalSearchInput');
        const clearButton = document.querySelector('.search-clear-btn');
        if (searchInput)
            searchInput.value = '';
        if (clearButton)
            clearButton.style.display = 'none';
        const tabConfigs = {
            video: { icon: 'fa-film', text: 'Видео' },
            audio: { icon: 'fa-music', text: 'Аудио' },
            settings: { icon: 'fa-cog', text: 'Настройки' },
        };
        const config = tabConfigs[targetTab];
        this.header.setTitle(config.icon, config.text);
        this.header.togglePlaylistButtonVisibility(targetTab === 'audio');
        await this.updateContent(targetTab);
    }
    async updateContent(activeTab) {
        if (!this.contentArea)
            return;
        if (this.currentLiveComponent) {
            this.currentLiveComponent.dispose();
        }
        this.currentLiveComponent = this.componentFactory.create(activeTab);
        await this.currentLiveComponent.render(this.contentArea, this.activeSearchTerm);
    }
    bindPlayerControls(renderedAppElement) {
        const playPauseBtn = renderedAppElement.querySelector('.universal-bottom-player-play');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                this.playbackManager.togglePlay();
            });
        }
        const stopBtn = renderedAppElement.querySelector('.universal-bottom-player-stop');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.playbackManager.stop();
            });
        }
    }
    bindHeaderEvents(containerElement) {
        this.header.bindSearch(async (searchTerm) => {
            this.activeSearchTerm = searchTerm;
            if (this.currentLiveComponent && this.contentArea) {
                await this.currentLiveComponent.render(this.contentArea, this.activeSearchTerm);
            }
        }, containerElement);
    }
}
//# sourceMappingURL=MainFrame.js.map