import { Metadata } from "../entities/music/Metadata";
import { MusicLibrary } from "../entities/music/MusicLibrary";
import { Playlist } from "../entities/music/Playlist";

export class MusicStore {
  private library: MusicLibrary;
  private listeners: (() => void)[];

  constructor() {
    this.library = new MusicLibrary();
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

  addTrack(track: Metadata): void {
    this.library.addTrack(track);
    this.notifyListeners();
  }

  removeTrack(filePath: string): void {
    this.library.removeTrack(filePath);
    this.notifyListeners();
  }

  removeTrackByIndex(index: number): void {
    this.library.removeTrackByIndex(index);
    this.notifyListeners();
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

  clearLibrary(): void {
    this.library.clear();
    this.notifyListeners();
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
      library: this.library.toJSON()
    };
  }
}
