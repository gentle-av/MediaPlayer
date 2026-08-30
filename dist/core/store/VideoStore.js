"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoStore = void 0;
const VideoApiClient_1 = require("../api/VideoApiClient");
class VideoStore {
    client;
    currentLibrary = null;
    currentPath = '/mnt/video';
    listeners = [];
    constructor() {
        this.client = new VideoApiClient_1.VideoApiClient();
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
exports.VideoStore = VideoStore;
