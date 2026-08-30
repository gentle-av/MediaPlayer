import { Metadata } from "../entities/music/Metadata.js";
import { MusicLibrary } from "../entities/music/MusicLibrary.js";
import { MusicApiClient } from "../api/MusicApiClient.js";

export class MusicStore {
  private library: MusicLibrary;
  private listeners: (() => void)[];
  private apiClient: MusicApiClient;

  constructor() {
    this.library = new MusicLibrary();
    this.listeners = [];
    this.apiClient = new MusicApiClient();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  getTrack(filePath: string): Metadata | undefined {
    return this.library.allTracks.find(track => track.filePath === filePath);
  }

  getTrackByIndex(index: number): Metadata | undefined {
    return this.library.allTracks[index];
  }

  getAllTracks(): Metadata[] {
    return this.library.allTracks;
  }

  getLibrarySize(): number {
    return this.library.size;
  }

  searchTracks(query: string): Metadata[] {
    if (!query || !query.trim()) {
      return this.library.allTracks;
    }
    const lowerQuery = query.toLowerCase().trim();
    return this.library.allTracks.filter(track =>
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.album.toLowerCase().includes(lowerQuery) ||
      track.genre.toLowerCase().includes(lowerQuery)
    );
  }

  async loadTracksFromServer(): Promise<void> {
    const tracks = await this.apiClient.getAllTracks();
    this.library.clear();
    tracks.forEach(track => {
      try {
        this.library.addTrack(track);
      } catch (error) {
        console.warn(`Could not add track: ${track.title}`, error);
      }
    });
    this.notifyListeners();
  }

  async searchByArtist(artist: string): Promise<Metadata[]> {
    return await this.apiClient.getTracksByArtist(artist);
  }

  async searchByAlbum(album: string, artist?: string): Promise<Metadata[]> {
    return await this.apiClient.getTracksByAlbum(album, artist);
  }

  async getArtists(): Promise<string[]> {
    return await this.apiClient.getArtists();
  }

  async getAlbums(artist?: string): Promise<Array<{album: string, artist: string, year: number}>> {
    return await this.apiClient.getAlbums(artist);
  }

  async forceRescan(directory?: string): Promise<void> {
    await this.apiClient.forceRescan(directory);
    await this.loadTracksFromServer();
  }

  toJSON(): any {
    return {
      library: this.library.toJSON(),
    };
  }
}
