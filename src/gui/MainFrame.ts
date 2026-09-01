import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { ContentManager } from './ContentManager.js';
import { Player } from './Player.js';
import { Settings } from './Settings.js';

export class MainFrame {
  private header: Header;
  private sidebar: Sidebar;
  private contentManager: ContentManager;
  private player: Player;
  private settings: Settings;
  private currentTab: 'video' | 'audio' | 'settings' = 'video';

  constructor() {
    this.header = new Header();
    this.contentManager = new ContentManager();
    this.player = new Player();
    this.settings = new Settings();
    this.sidebar = new Sidebar((tab: 'video' | 'audio' | 'settings') => {
      this.switchTab(tab);
    });
  }

  private switchTab(tab: 'video' | 'audio' | 'settings'): void {
    this.currentTab = tab;
    const tabConfig = {
      video: { icon: 'fa-film', text: 'Видео' },
      audio: { icon: 'fa-music', text: 'Аудио' },
      settings: { icon: 'fa-cog', text: 'Настройки' },
    };
    const config = tabConfig[tab];
    this.header.setTitle(config.icon, config.text);
  }

  render(): HTMLElement {
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
