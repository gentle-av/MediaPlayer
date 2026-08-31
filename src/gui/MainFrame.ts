import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { Player } from './Player.js';
import { ContentManager } from './ContentManager.js';
import { Settings } from './Settings.js';

export class MainFrame {
  private container: HTMLElement;
  private header: Header;
  private sidebar: Sidebar;
  private player: Player;
  private contentManager: ContentManager;
  private settings: Settings;
  private activeTab: 'video' | 'audio' | 'settings' = 'video';

  constructor() {
    this.container = document.getElementById('main') as HTMLElement;
    if (!this.container) {
      throw new Error('Element with id "main" not found');
    }
    this.header = new Header();
    this.sidebar = new Sidebar(this.onTabChange.bind(this));
    this.player = new Player();
    this.contentManager = new ContentManager();
    this.settings = new Settings();
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    const app = document.createElement('div');
    app.className = 'app';
    app.appendChild(this.sidebar.render());
    app.appendChild(this.createOverlay());
    app.appendChild(this.createMainContent());
    app.appendChild(this.createMenuToggle());
    this.container.appendChild(app);
    const defaultBtn = app.querySelector('[data-tab="video"]') as HTMLElement;
    if (defaultBtn) defaultBtn.classList.add('active');
    this.updateContent('video');
  }

  private createMainContent(): HTMLElement {
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    mainContent.appendChild(this.header.render());
    const scrollable = document.createElement('div');
    scrollable.className = 'scrollable-content';
    mainContent.appendChild(scrollable);
    mainContent.appendChild(this.player.render());
    return mainContent;
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    return overlay;
  }

  private createMenuToggle(): HTMLElement {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    const menuIcon = document.createElement('i');
    menuIcon.className = 'fas fa-bars';
    menuToggle.appendChild(menuIcon);
    return menuToggle;
  }

  private onTabChange(tab: 'video' | 'audio' | 'settings'): void {
    this.updateContent(tab);
  }

  private updateContent(tab: 'video' | 'audio' | 'settings'): void {
    const scrollable = this.container.querySelector('.scrollable-content');
    if (!scrollable) return;
    scrollable.innerHTML = '';
    if (tab === 'video') {
      scrollable.appendChild(this.contentManager.getVideoContent());
    } else if (tab === 'audio') {
      scrollable.appendChild(this.contentManager.getAudioContent());
    } else if (tab === 'settings') {
      scrollable.appendChild(this.settings.render());
    }
  }
}
