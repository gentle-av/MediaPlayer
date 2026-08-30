"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicStore = void 0;
const MusicLibrary_1 = require("../entities/music/MusicLibrary");
class MusicStore {
    library;
    listeners;
    constructor() {
        this.library = new MusicLibrary_1.MusicLibrary();
        this.listeners = [];
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
    getTrack(filePath) {
        return this.library.allTracks.find(track => track.filePath === filePath);
    }
    getTrackByIndex(index) {
        return this.library.allTracks[index];
    }
    getAllTracks() {
        return this.library.allTracks;
    }
    getLibrarySize() {
        return this.library.size;
    }
    searchTracks(query) {
        if (!query || !query.trim()) {
            return this.library.allTracks;
        }
        const lowerQuery = query.toLowerCase().trim();
        return this.library.allTracks.filter(track => track.title.toLowerCase().includes(lowerQuery) ||
            track.artist.toLowerCase().includes(lowerQuery) ||
            track.album.toLowerCase().includes(lowerQuery) ||
            track.genre.toLowerCase().includes(lowerQuery));
    }
    toJSON() {
        return {
            library: this.library.toJSON(),
        };
    }
}
exports.MusicStore = MusicStore;
