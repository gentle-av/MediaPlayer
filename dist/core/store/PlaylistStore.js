"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistStore = void 0;
const Playlist_1 = require("../entities/music/Playlist");
class PlaylistStore {
    musicStore;
    playlists;
    listeners;
    constructor(musicStore) {
        this.musicStore = musicStore;
        this.playlists = new Map();
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
    createPlaylist(name) {
        if (!name || !name.trim()) {
            throw new Error('Playlist name is required');
        }
        const trimmedName = name.trim();
        if (this.playlists.has(trimmedName)) {
            throw new Error(`Playlist "${trimmedName}" already exists`);
        }
        const playlist = new Playlist_1.Playlist(trimmedName);
        this.playlists.set(trimmedName, playlist);
        this.notifyListeners();
    }
    deletePlaylist(name) {
        if (!name || !name.trim()) {
            throw new Error('Playlist name is required');
        }
        const trimmedName = name.trim();
        if (!this.playlists.has(trimmedName)) {
            throw new Error(`Playlist "${trimmedName}" not found`);
        }
        this.playlists.delete(trimmedName);
        this.notifyListeners();
    }
    getPlaylist(name) {
        if (!name || !name.trim()) {
            return undefined;
        }
        return this.playlists.get(name.trim());
    }
    getAllPlaylists() {
        return Array.from(this.playlists.values());
    }
    getPlaylistNames() {
        return Array.from(this.playlists.keys());
    }
    addTrackToPlaylist(playlistName, filePath) {
        if (!playlistName || !playlistName.trim()) {
            throw new Error('Playlist name is required');
        }
        if (!filePath || !filePath.trim()) {
            throw new Error('File path is required');
        }
        const track = this.musicStore.getTrack(filePath);
        if (!track) {
            throw new Error(`Track with path "${filePath}" not found in music library`);
        }
        const trimmedName = playlistName.trim();
        const playlist = this.playlists.get(trimmedName);
        if (!playlist) {
            throw new Error(`Playlist "${trimmedName}" not found`);
        }
        playlist.addTrack(filePath);
        this.notifyListeners();
    }
    addTracksToPlaylist(playlistName, filePaths) {
        if (!playlistName || !playlistName.trim()) {
            throw new Error('Playlist name is required');
        }
        if (!filePaths || filePaths.length === 0) {
            throw new Error('At least one file path is required');
        }
        const trimmedName = playlistName.trim();
        const playlist = this.playlists.get(trimmedName);
        if (!playlist) {
            throw new Error(`Playlist "${trimmedName}" not found`);
        }
        for (const filePath of filePaths) {
            const track = this.musicStore.getTrack(filePath);
            if (!track) {
                throw new Error(`Track with path "${filePath}" not found in music library`);
            }
            playlist.addTrack(filePath);
        }
        this.notifyListeners();
    }
    removeTrackFromPlaylist(playlistName, filePath) {
        if (!playlistName || !playlistName.trim()) {
            throw new Error('Playlist name is required');
        }
        if (!filePath || !filePath.trim()) {
            throw new Error('File path is required');
        }
        const trimmedName = playlistName.trim();
        const playlist = this.playlists.get(trimmedName);
        if (!playlist) {
            throw new Error(`Playlist "${trimmedName}" not found`);
        }
        playlist.removeTrack(filePath);
        this.notifyListeners();
    }
    getPlaylistTracks(playlistName) {
        if (!playlistName || !playlistName.trim()) {
            return [];
        }
        const trimmedName = playlistName.trim();
        const playlist = this.playlists.get(trimmedName);
        if (!playlist) {
            throw new Error(`Playlist "${trimmedName}" not found`);
        }
        const trackPaths = playlist.getTrackPaths();
        return trackPaths
            .map((path) => this.musicStore.getTrack(path))
            .filter((track) => track !== undefined);
    }
    getPlaylistTrackPaths(playlistName) {
        if (!playlistName || !playlistName.trim()) {
            return [];
        }
        const trimmedName = playlistName.trim();
        const playlist = this.playlists.get(trimmedName);
        if (!playlist) {
            throw new Error(`Playlist "${trimmedName}" not found`);
        }
        return playlist.getTrackPaths();
    }
    getPlaylistSize(playlistName) {
        if (!playlistName || !playlistName.trim()) {
            return 0;
        }
        const trimmedName = playlistName.trim();
        const playlist = this.playlists.get(trimmedName);
        if (!playlist) {
            throw new Error(`Playlist "${trimmedName}" not found`);
        }
        return playlist.size;
    }
    renamePlaylist(oldName, newName) {
        if (!oldName || !oldName.trim()) {
            throw new Error('Current playlist name is required');
        }
        if (!newName || !newName.trim()) {
            throw new Error('New playlist name is required');
        }
        const trimmedOldName = oldName.trim();
        const trimmedNewName = newName.trim();
        if (!this.playlists.has(trimmedOldName)) {
            throw new Error(`Playlist "${trimmedOldName}" not found`);
        }
        if (this.playlists.has(trimmedNewName)) {
            throw new Error(`Playlist "${trimmedNewName}" already exists`);
        }
        const playlist = this.playlists.get(trimmedOldName);
        playlist.rename(trimmedNewName);
        this.playlists.delete(trimmedOldName);
        this.playlists.set(trimmedNewName, playlist);
        this.notifyListeners();
    }
    clearPlaylist(playlistName) {
        if (!playlistName || !playlistName.trim()) {
            throw new Error('Playlist name is required');
        }
        const trimmedName = playlistName.trim();
        const playlist = this.playlists.get(trimmedName);
        if (!playlist) {
            throw new Error(`Playlist "${trimmedName}" not found`);
        }
        playlist.clear();
        this.notifyListeners();
    }
    playlistHasTrack(playlistName, filePath) {
        if (!playlistName || !playlistName.trim()) {
            return false;
        }
        if (!filePath || !filePath.trim()) {
            return false;
        }
        const trimmedName = playlistName.trim();
        const playlist = this.playlists.get(trimmedName);
        if (!playlist) {
            return false;
        }
        return playlist.hasTrack(filePath);
    }
    searchPlaylists(query) {
        if (!query || !query.trim()) {
            return this.getAllPlaylists();
        }
        const lowerQuery = query.toLowerCase().trim();
        return this.getAllPlaylists().filter(playlist => playlist.playlistName.toLowerCase().includes(lowerQuery));
    }
    searchTracksInPlaylist(playlistName, query) {
        if (!playlistName || !playlistName.trim()) {
            return [];
        }
        const trimmedName = playlistName.trim();
        const playlist = this.playlists.get(trimmedName);
        if (!playlist) {
            throw new Error(`Playlist "${trimmedName}" not found`);
        }
        const trackPaths = playlist.getTrackPaths();
        const tracks = trackPaths
            .map((path) => this.musicStore.getTrack(path))
            .filter((track) => track !== undefined);
        if (!query || !query.trim()) {
            return tracks;
        }
        const lowerQuery = query.toLowerCase().trim();
        return tracks.filter(track => track.title.toLowerCase().includes(lowerQuery) ||
            track.artist.toLowerCase().includes(lowerQuery) ||
            track.album.toLowerCase().includes(lowerQuery) ||
            track.genre.toLowerCase().includes(lowerQuery));
    }
    getPlaylistStatistics() {
        let totalTracks = 0;
        this.playlists.forEach(playlist => {
            totalTracks += playlist.size;
        });
        return {
            totalPlaylists: this.playlists.size,
            totalTracks: totalTracks
        };
    }
    toJSON() {
        return {
            playlists: Array.from(this.playlists.values()).map(playlist => playlist.toJSON())
        };
    }
}
exports.PlaylistStore = PlaylistStore;
