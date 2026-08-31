export class MainFrame {
  private container: HTMLElement;
  private activeTab: 'video' | 'audio' = 'video';

  constructor() {
    this.container = document.getElementById('main') as HTMLElement;
    if (!this.container) {
      throw new Error('Element with id "main" not found');
    }
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    const layout = document.createElement('div');
    layout.className = 'main-frame';
    const tabsPanel = this.createTabs();
    layout.appendChild(tabsPanel);
    const menuPanel = this.createMenu();
    layout.appendChild(menuPanel);
    const contentPanel = this.createContent();
    layout.appendChild(contentPanel);
    const footerPanel = this.createFooter();
    layout.appendChild(footerPanel);
    this.container.appendChild(layout);
  }

  private createTabs(): HTMLElement {
    const tabs = document.createElement('div');
    tabs.className = 'tabs-panel';
    const videoTab = document.createElement('button');
    videoTab.textContent = 'Видео';
    videoTab.dataset.tab = 'video';
    const audioTab = document.createElement('button');
    audioTab.textContent = 'Аудио';
    audioTab.dataset.tab = 'audio';
    videoTab.addEventListener('click', () => {
      this.activeTab = 'video';
      this.updateContent('video');
    });
    audioTab.addEventListener('click', () => {
      this.activeTab = 'audio';
      this.updateContent('audio');
    });
    tabs.appendChild(videoTab);
    tabs.appendChild(audioTab);
    return tabs;
  }

  private createMenu(): HTMLElement {
    const menu = document.createElement('div');
    menu.className = 'menu-panel';
    const items = ['Плейлист', 'Избранное', 'История', 'Настройки'];
    items.forEach(text => {
      const item = document.createElement('div');
      item.textContent = text;
      menu.appendChild(item);
    });
    return menu;
  }

  private createContent(): HTMLElement {
    const content = document.createElement('div');
    content.className = 'content-area';
    content.textContent = 'Контент для Видео';
    return content;
  }

  private createFooter(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'footer-player';
    footer.textContent = 'Область плеера';
    return footer;
  }

  private updateContent(tab: 'video' | 'audio'): void {
    const contentArea = this.container.querySelector('.content-area');
    if (contentArea) {
      contentArea.textContent = tab === 'video' ? 'Контент для Видео' : 'Контент для Аудио';
    }
  }
}
