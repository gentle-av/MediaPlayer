export class Sidebar {
  private onTabChange: (tab: 'video' | 'audio' | 'settings') => void;

  constructor(onTabChange: (tab: 'video' | 'audio' | 'settings') => void) {
    this.onTabChange = onTabChange;
  }

  render(): HTMLElement {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'sidebar-header';
    const h2 = document.createElement('h2');
    h2.textContent = 'MediaServer';
    sidebarHeader.appendChild(h2);
    sidebar.appendChild(sidebarHeader);
    const nav = document.createElement('div');
    nav.className = 'sidebar-nav';
    const navItems = [
      { icon: 'fa-film', text: 'Видео', tab: 'video' },
      { icon: 'fa-music', text: 'Аудио', tab: 'audio' },
      { icon: 'fa-cog', text: 'Настройки', tab: 'settings' },
    ];
    navItems.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'sidebar-btn';
      if (item.tab) {
        btn.dataset.tab = item.tab;
        btn.addEventListener('click', () => {
          if (item.tab) {
            this.onTabChange(item.tab as 'video' | 'audio' | 'settings');
            nav.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          }
        });
      }
      const icon = document.createElement('i');
      icon.className = `fas ${item.icon}`;
      btn.appendChild(icon);
      btn.appendChild(document.createTextNode(' ' + item.text));
      nav.appendChild(btn);
    });
    sidebar.appendChild(nav);
    return sidebar;
  }
}
