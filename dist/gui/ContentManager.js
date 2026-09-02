import { Player } from './Player.js';
export class ContentManager {
    constructor() {
        this.playerElement = null;
        this.player = new Player();
    }
    getPlayer() {
        if (!this.playerElement) {
            this.playerElement = this.player.render();
            this.playerElement.classList.remove('visible');
        }
        return this.playerElement;
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
        const player = this.getPlayer();
        player.classList.add('visible');
        container.appendChild(player);
        return container;
    }
    getVideoContent() {
        return this.createContent('Контент для Видео', '🎬');
    }
    getAudioContent() {
        return this.createContent('Контент для Аудио', '🎵');
    }
    getSettingsContent() {
        if (this.playerElement) {
            this.playerElement.classList.remove('visible');
        }
        const settingsGrid = document.createElement('div');
        settingsGrid.className = 'content-grid';
        settingsGrid.textContent = '⚙️ Контент для Настроек';
        return settingsGrid;
    }
}
//# sourceMappingURL=ContentManager.js.map