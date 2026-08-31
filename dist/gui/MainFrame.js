export class MainFrame {
    constructor() {
        this.activeTab = 'video';
        this.container = document.getElementById('main');
        if (!this.container) {
            throw new Error('Element with id "main" not found');
        }
        this.render();
    }
    render() {
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
    createTabs() {
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
    createMenu() {
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
    createContent() {
        const content = document.createElement('div');
        content.className = 'content-area';
        content.textContent = 'Контент для Видео';
        return content;
    }
    createFooter() {
        const footer = document.createElement('div');
        footer.className = 'footer-player';
        footer.textContent = 'Область плеера';
        return footer;
    }
    updateContent(tab) {
        const contentArea = this.container.querySelector('.content-area');
        if (contentArea) {
            contentArea.textContent = tab === 'video' ? 'Контент для Видео' : 'Контент для Аудио';
        }
    }
}
//# sourceMappingURL=MainFrame.js.map