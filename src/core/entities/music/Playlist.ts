import { Metadata } from "./Metadata";
import { MusicLibrary } from "./MusicLibrary";

export class Playlist {
  private name: string;
  private trackPaths: Set<string> = new Set();
  private musicLibrary: MusicLibrary;

  constructor(name: string, musicLibrary: MusicLibrary) {
    if (!name || !name.trim()) {
      throw new Error('Playlist name is required');
    }
    this.name = name.trim();
    this.musicLibrary = musicLibrary;
  }

  addTrack(filePath: string): void {
    if (!filePath || !filePath.trim()) {
      throw new Error('File path is required');
    }
    const track = this.musicLibrary['findTrackByPath'](filePath);
    if (!track) {
      throw new Error(`Track with path "${filePath}" not found in library`);
    }
    if (this.trackPaths.has(filePath)) {
      throw new Error(`Track "${filePath}" already in playlist`);
    }
    this.trackPaths.add(filePath);
  }

  removeTrack(filePath: string): void {
    if (!this.trackPaths.has(filePath)) {
      throw new Error(`Track "${filePath}" not found in playlist`);
    }
    this.trackPaths.delete(filePath);
  }

  get tracks(): Metadata[] {
    return Array.from(this.trackPaths)
      .map(path => this.musicLibrary['findTrackByPath'](path))
      .filter((track): track is Metadata => track !== undefined);
  }

  get size(): number {
    return this.trackPaths.size;
  }

  get playlistName(): string {
    return this.name;
  }

  rename(newName: string): void {
    if (!newName || !newName.trim()) {
      throw new Error('New name is required');
    }
    this.name = newName.trim();
  }

  hasTrack(filePath: string): boolean {
    return this.trackPaths.has(filePath);
  }

  clear(): void {
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
