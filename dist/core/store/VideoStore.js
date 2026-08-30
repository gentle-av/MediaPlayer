import { VideoApiClient } from "../api/VideoApiClient.js";
export class VideoStore {
    constructor() {
        this.currentLibrary = null;
        this.currentPath = '/mnt/video';
        this.listeners = [];
        this.client = new VideoApiClient();
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
    async loadLibrary(path) {
        if (path) {
            this.currentPath = path;
        }
        this.currentLibrary = await this.client.listVideos(this.currentPath);
        this.notifyListeners();
    }
    getItems() {
        return this.currentLibrary?.items || [];
    }
    getFolders() {
        return this.currentLibrary?.getFolders() || [];
    }
    getVideos() {
        return this.currentLibrary?.getVideos() || [];
    }
    getCurrentPath() {
        return this.currentPath;
    }
    getLibrary() {
        return this.currentLibrary;
    }
    getStatistics() {
        if (!this.currentLibrary) {
            return { total: 0, folders: 0, videos: 0 };
        }
        return {
            total: this.currentLibrary.items.length,
            folders: this.currentLibrary.getFolders().length,
            videos: this.currentLibrary.getVideos().length
        };
    }
    async navigateToFolder(item) {
        if (item.isDirectory) {
            await this.loadLibrary(item.path);
        }
    }
    search(term) {
        if (!this.currentLibrary)
            return [];
        return this.currentLibrary.items.filter(item => item.name.toLowerCase().includes(term.toLowerCase()));
    }
    clear() {
        this.currentLibrary = null;
        this.notifyListeners();
    }
}
//# sourceMappingURL=VideoStore.js.map