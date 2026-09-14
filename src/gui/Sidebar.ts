import { TabType } from './components/ComponentFactory.js';

export class Sidebar {
  constructor(private readonly onTabChange: (tab: TabType) => void) {}

  public render(): HTMLElement {
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
      {
        svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" class="sidebar-svg-icon">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
          <line x1="7" y1="2" x2="7" y2="22"></line>
          <line x1="17" y1="2" x2="17" y2="22"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <line x1="2" y1="7" x2="7" y2="7"></line>
          <line x1="2" y1="17" x2="7" y2="17"></line>
          <line x1="17" y1="17" x2="22" y2="17"></line>
          <line x1="17" y1="7" x2="22" y2="7"></line>
        </svg>`,
        text: 'Видео',
        tab: 'video',
      },
      {
        svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" class="sidebar-svg-icon">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>`,
        text: 'Аудио',
        tab: 'audio',
      },
      {
        svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" class="sidebar-svg-icon">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83
            2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2
            2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06
            .06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65
            0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0
            0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0
            1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0
            0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06
            .06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1
            0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>`,
        text: 'Настройки',
        tab: 'settings',
      },
    ];
    navItems.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'sidebar-btn';
      if (item.tab === 'video') {
        btn.classList.add('active');
      }
      btn.dataset.tab = item.tab;
      btn.addEventListener('click', () => {
        this.onTabChange(item.tab as TabType);
        nav
          .querySelectorAll('.sidebar-btn')
          .forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
      const iconWrapper = document.createElement('span');
      iconWrapper.className = 'sidebar-icon-wrapper';
      iconWrapper.innerHTML = item.svg;
      const textNode = document.createElement('span');
      textNode.className = 'sidebar-btn-text';
      textNode.textContent = item.text;
      btn.append(iconWrapper, textNode);
      nav.appendChild(btn);
    });
    sidebar.appendChild(nav);
    return sidebar;
  }
}
