export class UiStateStore {
    constructor() {
        this.state = {
            currentTab: 'video',
            searchQuery: '',
            currentPath: '/mnt/video',
        };
        this.listeners = [];
    }
    static getInstance() {
        if (!UiStateStore.instance) {
            UiStateStore.instance = new UiStateStore();
        }
        return UiStateStore.instance;
    }
    getState() {
        return { ...this.state };
    }
    setSearchQuery(query) {
        this.state.searchQuery = query;
        this.notify();
    }
    setTab(tab) {
        this.state.currentTab = tab;
        this.state.searchQuery = '';
        this.notify();
    }
    setCurrentPath(path) {
        this.state.currentPath = path;
        this.notify();
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
    notify() {
        this.listeners.forEach((listener) => listener({ ...this.state }));
    }
}
UiStateStore.instance = null;
//# sourceMappingURL=UiStateStore.js.map