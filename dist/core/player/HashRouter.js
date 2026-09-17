import { UiStateStore } from '../store/UiStateStore.js';
export class HashRouter {
    constructor() {
        this.isUpdatingFromStore = false;
        this.init();
    }
    init() {
        window.addEventListener('hashchange', () => this.handleHashChange());
        UiStateStore.getInstance().subscribe((state) => {
            if (this.isUpdatingFromStore)
                return;
            this.updateHashFromState(state.currentTab, state.currentPath);
        });
        this.handleHashChange();
    }
    handleHashChange() {
        const hash = window.location.hash || '#/video';
        const [rawPath, queryString] = hash.slice(1).split('?');
        const tab = rawPath.replace('/', '');
        const store = UiStateStore.getInstance();
        const params = new URLSearchParams(queryString || '');
        const path = params.get('path') || store.getState().currentPath || '/mnt/video';
        this.isUpdatingFromStore = true;
        if (store.getState().currentTab !== tab) {
            store.setTab(tab);
        }
        if (store.getState().currentPath !== path) {
            store.setCurrentPath(path);
        }
        this.isUpdatingFromStore = false;
    }
    updateHashFromState(tab, currentPath) {
        let newHash = `#/${tab}`;
        if (tab === 'video' && currentPath !== '/mnt/video') {
            newHash += `?path=${encodeURIComponent(currentPath)}`;
        }
        if (window.location.hash !== newHash) {
            window.location.hash = newHash;
        }
    }
}
//# sourceMappingURL=HashRouter.js.map