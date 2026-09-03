export class ContentManager {
    constructor(musicStore, videoStore, playlistStore) {
        this.musicStore = musicStore;
        this.videoStore = videoStore;
        this.playlistStore = playlistStore;
    }
    createContent(label, icon) {
        const container = document.createElement('div');
        Object.assign(container.style, {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '0'
        });
        const grid = document.createElement('div');
        grid.className = 'content-grid';
        grid.textContent = `${icon} ${label}`;
        Object.assign(grid.style, {
            flex: '1',
            overflowY: 'auto',
            padding: '20px'
        });
        container.appendChild(grid);
        return container;
    }
    getVideoContent() {
        return this.createContent('Контент для Видео', '🎬');
    }
    getAudioContent() {
        return this.createContent('Контент для Аудио', '🎵');
    }
    getSettingsContent() {
        return this.createContent('Контент для Настройки', '⚙');
    }
}
//# sourceMappingURL=ContentManager.js.map