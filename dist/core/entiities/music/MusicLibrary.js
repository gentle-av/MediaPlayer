"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicLibrary = void 0;
class MusicLibrary {
    library = new Array();
    addTrack(track) {
        if (!track) {
            throw new Error('Track cannot be null or undefined');
        }
        if (this.findTrackByPath(track.filePath)) {
            throw new Error(`Track with path "${track.filePath}" already exists in library`);
        }
        this.library.push(track);
    }
    removeTrack(filePath) {
        if (!filePath || !filePath.trim()) {
            throw new Error('File path is required');
        }
        const index = this.library.findIndex(track => track.filePath === filePath);
        if (index === -1) {
            throw new Error(`Track with path "${filePath}" not found in library`);
        }
        this.library.splice(index, 1);
    }
    removeTrackByIndex(index) {
        if (index < 0 || index >= this.library.length) {
            throw new Error(`Index ${index} is out of bounds. Music library size: ${this.library.length}`);
        }
        this.library.splice(index, 1);
    }
    findTrackByPath(filePath) {
        return this.library.find(track => track.filePath === filePath);
    }
    get size() {
        return this.library.length;
    }
    get allTracks() {
        return [...this.library];
    }
    clear() {
        this.library = [];
    }
    toJSON() {
        return {
            size: this.library.length,
            tracks: this.library.map(track => track.toJSON())
        };
    }
}
exports.MusicLibrary = MusicLibrary;
