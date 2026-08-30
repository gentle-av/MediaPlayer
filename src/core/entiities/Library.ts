import { Metadata } from "./Metadata"

export class Library {
  private library: Array<Metadata> = new Array<Metadata>();

  addTrack(track: Metadata): void {
    if (!track) {
      throw new Error('Track cannot be null or undefined');
    }
    if (this.findTrackByPath(track.filePath)) {
      throw new Error(`Track with path "${track.filePath}" already exists in library`);
    }
    this.library.push(track);
  }

  removeTrack(filePath: string): void {
    if (!filePath || !filePath.trim()) {
      throw new Error('File path is required');
    }
    const index = this.library.findIndex(track => track.filePath === filePath);
    if (index === -1) {
      throw new Error(`Track with path "${filePath}" not found in library`);
    }
    this.library.splice(index, 1);
  }

  removeTrackByIndex(index: number): void {
    if (index < 0 || index >= this.library.length) {
      throw new Error(`Index ${index} is out of bounds. Library size: ${this.library.length}`);
    }
    this.library.splice(index, 1);
  }

  private findTrackByPath(filePath: string): Metadata | undefined {
    return this.library.find(track => track.filePath === filePath);
  }

  get size(): number {
    return this.library.length;
  }

  get allTracks(): Array<Metadata> {
    return [...this.library];
  }

  clear(): void {
    this.library = [];
  }

  toJSON() {
    return {
      size: this.library.length,
      tracks: this.library.map(track => track.toJSON())
    };
  }
}
