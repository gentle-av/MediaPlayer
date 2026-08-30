"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = void 0;
class Playlist {
    name;
    trackPaths = new Set();
    library;
    constructor(name, library) {
        if (!name || !name.trim()) {
            throw new Error('Playlist name is required');
        }
        this.name = name.trim();
        this.library = library;
    }
    addTrack(filePath) {
        if (!filePath || !filePath.trim()) {
            throw new Error('File path is required');
        }
        const track = this.library['findTrackByPath'](filePath);
        if (!track) {
            throw new Error(`Track with path "${filePath}" not found in library`);
        }
        if (this.trackPaths.has(filePath)) {
            throw new Error(`Track "${filePath}" already in playlist`);
        }
        this.trackPaths.add(filePath);
    }
    // Удалить трек из плейлиста
    removeTrack(filePath) {
        if (!this.trackPaths.has(filePath)) {
            throw new Error(`Track "${filePath}" not found in playlist`);
        }
        this.trackPaths.delete(filePath);
    }
    get tracks() {
        return Array.from(this.trackPaths)
            .map(path => this.library['findTrackByPath'](path))
            .filter((track) => track !== undefined);
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
            tracks: this.tracks.map(track => track.toJSON())
        };
    }
}
exports.Playlist = Playlist;
