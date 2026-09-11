import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { ContentManager } from './ContentManager.js';
import { Player } from './Player.js';
import { Settings } from './Settings.js';
import { MusicStore } from '../core/store/MusicStore.js';
import { VideoStore } from '../core/store/VideoStore.js';
import { PlaylistStore } from '../core/store/PlaylistStore.js';
import { PlaybackManager } from '../core/player/PlaybackManager.js';
export class MainFrame {
    constructor() {
        this.currentTab = 'video';
        this.contentArea = null;
        this.musicStore = new MusicStore();
        this.videoStore = new VideoStore();
        this.playlistStore = new PlaylistStore(this.musicStore);
        this.player = new Player();
        this.settings = new Settings();
        this.playbackManager = new PlaybackManager(this.player, this.musicStore, this.videoStore);
        this.contentManager = new ContentManager(this.musicStore, this.videoStore, this.playlistStore, this.playbackManager);
        this.header = new Header();
        this.sidebar = new Sidebar((selectedTab) => {
            this.switchTab(selectedTab);
        });
    }
    async switchTab(targetTab) {
        this.currentTab = targetTab;
        const tabConfigurations = {
            video: { icon: 'fa-film', text: 'Видео' },
            audio: { icon: 'fa-music', text: 'Аудио' },
            settings: { icon: 'fa-cog', text: 'Настройки' },
        };
        const activeConfiguration = tabConfigurations[targetTab];
        this.header.setTitle(activeConfiguration.icon, activeConfiguration.text);
        const isAudioTab = targetTab === 'audio';
        this.header.togglePlaylistButtonVisibility(isAudioTab);
        await this.updateContent(targetTab);
    }
    async updateContent(activeTab) {
        if (!this.contentArea) {
            return;
        }
        let tabPlaceholderElement = null;
        switch (activeTab) {
            case 'video':
                await this.contentManager.getVideoContent(this.contentArea);
                break;
            case 'audio':
                this.contentArea.innerHTML = '';
                tabPlaceholderElement = this.createPlaceholderContent('audio', '🎵 Аудио');
                this.contentArea.appendChild(tabPlaceholderElement);
                break;
            case 'settings':
                this.contentArea.innerHTML = '';
                tabPlaceholderElement = this.createPlaceholderContent('settings', '⚙️ Настройки');
                this.contentArea.appendChild(tabPlaceholderElement);
                break;
        }
    }
    createPlaceholderContent(contentType, placeholderText) {
        const fallbackContainerElement = document.createElement('div');
        fallbackContainerElement.className = 'content-grid';
        fallbackContainerElement.textContent = placeholderText;
        return fallbackContainerElement;
    }
    bindPlayerControls(renderedAppElement) {
        const playPauseButtonElement = renderedAppElement.querySelector('.universal-bottom-player-play');
        if (playPauseButtonElement) {
            playPauseButtonElement.addEventListener('click', () => {
                this.playbackManager.togglePlay();
            });
        }
        const stopButtonElement = renderedAppElement.querySelector('.universal-bottom-player-stop');
        if (stopButtonElement) {
            stopButtonElement.addEventListener('click', () => {
                this.playbackManager.stop();
            });
        }
    }
    render() {
        const applicationContainerElement = document.createElement('div');
        applicationContainerElement.className = 'app-container';
        const renderedHeaderElement = this.header.render();
        applicationContainerElement.appendChild(renderedHeaderElement);
        const bodyWrapperElement = document.createElement('div');
        bodyWrapperElement.className = 'body-wrapper';
        const mainContentLayoutElement = document.createElement('div');
        mainContentLayoutElement.className = 'main-content';
        const renderedSidebarElement = this.sidebar.render();
        mainContentLayoutElement.appendChild(renderedSidebarElement);
        this.contentArea = document.createElement('div');
        this.contentArea.className = 'content-area';
        mainContentLayoutElement.appendChild(this.contentArea);
        bodyWrapperElement.appendChild(mainContentLayoutElement);
        const renderedPlayerElement = this.player.render();
        renderedPlayerElement.classList.add('visible');
        bodyWrapperElement.appendChild(renderedPlayerElement);
        applicationContainerElement.appendChild(bodyWrapperElement);
        this.updateContent(this.currentTab);
        this.bindPlayerControls(applicationContainerElement);
        setTimeout(() => {
            const isAudioTab = this.currentTab === 'audio';
            this.header.togglePlaylistButtonVisibility(isAudioTab);
        }, 0);
        return applicationContainerElement;
    }
    async initialize() {
        try {
            await this.musicStore.loadTracksFromServer();
            console.log(`✅ Loaded ${this.musicStore.getLibrarySize()} tracks from server`);
        }
        catch (initializationError) {
            console.error(initializationError);
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
    getPlaybackManager() {
        return this.playbackManager;
    }
}
//# sourceMappingURL=MainFrame.js.map