import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { ContentManager } from './ContentManager.js';
import { Player } from './Player.js';
import { Settings } from './Settings.js';
export class MainFrame {
    constructor() {
        this.currentTab = 'video';
        this.header = new Header();
        this.contentManager = new ContentManager();
        this.player = new Player();
        this.settings = new Settings();
        this.sidebar = new Sidebar((tab) => {
            this.switchTab(tab);
        });
    }
    switchTab(tab) {
        this.currentTab = tab;
        const tabConfig = {
            video: { icon: 'fa-film', text: 'Видео' },
            audio: { icon: 'fa-music', text: 'Аудио' },
            settings: { icon: 'fa-cog', text: 'Настройки' },
        };
        const config = tabConfig[tab];
        this.header.setTitle(config.icon, config.text);
    }
    render() {
        const app = document.createElement('div');
        app.className = 'app-container';
        const headerElement = this.header.render();
        app.appendChild(headerElement);
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content';
        const sidebarElement = this.sidebar.render();
        mainContent.appendChild(sidebarElement);
        const contentArea = document.createElement('div');
        contentArea.className = 'content-area';
        const videoContent = this.contentManager.getVideoContent();
        contentArea.appendChild(videoContent);
        const settingsContent = this.settings.render();
        contentArea.appendChild(settingsContent);
        mainContent.appendChild(contentArea);
        app.appendChild(mainContent);
        const playerElement = this.player.render();
        app.appendChild(playerElement);
        return app;
    }
}
//# sourceMappingURL=MainFrame.js.map