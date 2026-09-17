import { UiStateStore, TabType } from '../store/UiStateStore.js';

export class HashRouter {
  private isUpdatingFromStore = false;

  constructor() {
    this.init();
  }

  private init(): void {
    window.addEventListener('hashchange', () => this.handleHashChange());
    UiStateStore.getInstance().subscribe((state) => {
      if (this.isUpdatingFromStore) return;
      this.updateHashFromState(state.currentTab, state.currentPath);
    });
    this.handleHashChange();
  }

  private handleHashChange(): void {
    const hash = window.location.hash || '#/video';
    const [rawPath, queryString] = hash.slice(1).split('?');
    const tab = rawPath.replace('/', '') as TabType;
    const store = UiStateStore.getInstance();
    const params = new URLSearchParams(queryString || '');
    const path =
      params.get('path') || store.getState().currentPath || '/mnt/video';
    this.isUpdatingFromStore = true;
    if (store.getState().currentTab !== tab) {
      store.setTab(tab);
    }
    if (store.getState().currentPath !== path) {
      store.setCurrentPath(path);
    }
    this.isUpdatingFromStore = false;
  }

  private updateHashFromState(tab: TabType, currentPath: string): void {
    let newHash = `#/${tab}`;
    if (tab === 'video' && currentPath !== '/mnt/video') {
      newHash += `?path=${encodeURIComponent(currentPath)}`;
    }
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
  }
}
