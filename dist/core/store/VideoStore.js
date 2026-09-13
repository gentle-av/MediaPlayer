import { VideoApiClient } from '../api/VideoApiClient.js';
export class VideoStore {
    constructor() {
        this.currentLibrary = null;
        this.currentPath = '/mnt/video';
        this.listeners = [];
        this.videoApiClient = new VideoApiClient();
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
    async loadLibrary(path) {
        if (path) {
            this.currentPath = path;
        }
        this.currentLibrary = await this.videoApiClient.listVideos(this.currentPath);
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
            videos: this.currentLibrary.getVideos().length,
        };
    }
    async navigateToFolder(item) {
        if (item.isDirectory) {
            await this.loadLibrary(item.path);
        }
    }
    isLoaded() {
        return this.currentLibrary !== null;
    }
    search(term) {
        if (!this.currentLibrary)
            return [];
        return this.currentLibrary.items.filter((item) => item.name.toLowerCase().includes(term.toLowerCase()));
    }
    clear() {
        this.currentLibrary = null;
        this.notifyListeners();
    }
    async openVideo(item) {
        if (item.isVideo) {
            await this.videoApiClient.openVideo(item.path);
        }
    }
    async removeFileSystemItem(itemPath, isDirectoryItem) {
        if (isDirectoryItem) {
            await this.videoApiClient.deleteDirectory(itemPath);
        }
        else {
            await this.videoApiClient.moveToTrash(itemPath);
        }
        await this.loadLibrary(this.currentPath);
    }
    notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }
}
//# sourceMappingURL=VideoStore.js.map