export class Playlist {
  private name: string;
  private trackPaths: Set<string>;

  constructor(name: string) {
    if (!name || !name.trim()) {
      throw new Error('Playlist name is required');
    }
    this.name = name.trim();
    this.trackPaths = new Set<string>();
  }

  addTrack(filePath: string): void {
    if (!filePath || !filePath.trim()) {
      throw new Error('File path is required');
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

  getTrackPaths(): string[] {
    return Array.from(this.trackPaths);
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
      tracks: Array.from(this.trackPaths)
    };
  }
}
