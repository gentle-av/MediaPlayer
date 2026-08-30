"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = void 0;
class Playlist {
    name;
    trackPaths;
    constructor(name) {
        if (!name || !name.trim()) {
            throw new Error('Playlist name is required');
        }
        this.name = name.trim();
        this.trackPaths = new Set();
    }
    addTrack(filePath) {
        if (!filePath || !filePath.trim()) {
            throw new Error('File path is required');
        }
        if (this.trackPaths.has(filePath)) {
            throw new Error(`Track "${filePath}" already in playlist`);
        }
        this.trackPaths.add(filePath);
    }
    removeTrack(filePath) {
        if (!this.trackPaths.has(filePath)) {
            throw new Error(`Track "${filePath}" not found in playlist`);
        }
        this.trackPaths.delete(filePath);
    }
    getTrackPaths() {
        return Array.from(this.trackPaths);
    }
    get size() {
        return this.trackPaths.size;
    }
    get playlistName() {
        return this.name;
    }
    rename(newName) {
        if (!newName || !newName.trim()) {
            throw new Error('New name is required');
        }
        this.name = newName.trim();
    }
    hasTrack(filePath) {
        return this.trackPaths.has(filePath);
    }
    clear() {
        this.trackPaths.clear();
    }
    toJSON() {
        return {
            name: this.name,
            size: this.size,
            tracks: Array.from(this.trackPaths)
        };
    }
}
exports.Playlist = Playlist;
