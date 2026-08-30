import { MusicLibrary } from "../entities/music/MusicLibrary.js";
import { MusicApiClient } from "../api/MusicApiClient.js";
export class MusicStore {
    constructor() {
        this.library = new MusicLibrary();
        this.listeners = [];
        this.apiClient = new MusicApiClient();
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
    async loadTracksFromServer() {
        const tracks = await this.apiClient.getAllTracks();
        this.library.clear();
        tracks.forEach(track => {
            try {
                this.library.addTrack(track);
            }
            catch (error) {
                console.warn(`Could not add track: ${track.title}`, error);
            }
        });
        this.notifyListeners();
    }
    async searchByArtist(artist) {
        return await this.apiClient.getTracksByArtist(artist);
    }
    async searchByAlbum(album, artist) {
        return await this.apiClient.getTracksByAlbum(album, artist);
    }
    async getArtists() {
        return await this.apiClient.getArtists();
    }
    async getAlbums(artist) {
        return await this.apiClient.getAlbums(artist);
    }
    async forceRescan(directory) {
        await this.apiClient.forceRescan(directory);
        await this.loadTracksFromServer();
    }
    toJSON() {
        return {
            library: this.library.toJSON(),
        };
    }
}
//# sourceMappingURL=MusicStore.js.map