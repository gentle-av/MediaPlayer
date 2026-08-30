import { Metadata } from "../entities/music/Metadata";
import { MusicLibrary } from "../entities/music/MusicLibrary";

export class MusicStore {
  private library: MusicLibrary;
  private listeners: (() => void)[];

  constructor() {
    this.library = new MusicLibrary();
    this.playlists = new Map<string, Playlist>();
    this.listeners = [];
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

  toJSON(): any {
    return {
      library: this.library.toJSON(),
      playlists: Array.from(this.playlists.values()).map(playlist => playlist.toJSON())
    };
  }
}
