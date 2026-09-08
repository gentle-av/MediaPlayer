import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { ContentManager } from './ContentManager.js';
import { Player } from './Player.js';
import { Settings } from './Settings.js';
import { MusicStore } from '../core/store/MusicStore.js';
import { VideoStore } from '../core/store/VideoStore.js';
import { PlaylistStore } from '../core/store/PlaylistStore.js';
export class MainFrame {
    constructor() {
        this.currentTab = 'video';
        this.contentArea = null;
        this.musicStore = new MusicStore();
        this.videoStore = new VideoStore();
        this.playlistStore = new PlaylistStore(this.musicStore);
        this.header = new Header();
        this.contentManager = new ContentManager(this.musicStore, this.videoStore, this.playlistStore);
        this.player = new Player();
        this.settings = new Settings();
        this.sidebar = new Sidebar((tab) => {
            this.switchTab(tab);
        });
    }
    async switchTab(tab) {
        this.currentTab = tab;
        const tabConfig = {
            video: { icon: 'fa-film', text: 'Видео' },
            audio: { icon: 'fa-music', text: 'Аудио' },
            settings: { icon: 'fa-cog', text: 'Настройки' },
        };
        const config = tabConfig[tab];
        this.header.setTitle(config.icon, config.text);
        await this.updateContent(tab);
    }
    async updateContent(tab) {
        if (!this.contentArea)
            return;
        let contentElement = null;
        switch (tab) {
            case 'video':
                await this.contentManager.getVideoContent(this.contentArea);
                break;
            case 'audio':
                this.contentArea.innerHTML = '';
                contentElement = this.createPlaceholderContent('audio', '🎵 Аудио');
                this.contentArea.appendChild(contentElement);
                break;
            case 'settings':
                this.contentArea.innerHTML = '';
                contentElement = this.createPlaceholderContent('settings', '⚙️ Настройки');
                this.contentArea.appendChild(contentElement);
                break;
        }
    }
    createPlaceholderContent(type, text) {
        const placeholder = document.createElement('div');
        placeholder.className = 'content-grid';
        placeholder.textContent = text;
        return placeholder;
    }
    render() {
        const app = document.createElement('div');
        app.className = 'app-container';
        const headerElement = this.header.render();
        app.appendChild(headerElement);
        const bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'body-wrapper';
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        const sidebarElement = this.sidebar.render();
        mainContent.appendChild(sidebarElement);
        this.contentArea = document.createElement('div');
        this.contentArea.className = 'content-area';
        mainContent.appendChild(this.contentArea);
        bodyWrapper.appendChild(mainContent);
        const playerElement = this.player.render();
        playerElement.classList.add('visible');
        bodyWrapper.appendChild(playerElement);
        app.appendChild(bodyWrapper);
        this.updateContent(this.currentTab);
        console.log('=== DOM STRUCTURE ===');
        console.log('app:', app);
        console.log('app children:', app.children);
        console.log('bodyWrapper:', bodyWrapper);
        console.log('bodyWrapper children:', bodyWrapper.children);
        console.log('mainContent:', mainContent);
        console.log('mainContent children:', mainContent.children);
        console.log('sidebarElement:', sidebarElement);
        console.log('sidebarElement styles:', window.getComputedStyle(sidebarElement));
        console.log('contentArea:', this.contentArea);
        console.log('playerElement:', playerElement);
        console.log('playerElement styles:', window.getComputedStyle(playerElement));
        console.log('=====================');
        return app;
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
//# sourceMappingURL=MainFrame.js.map