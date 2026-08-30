import { Metadata } from "../entities/music/Metadata";
import { MusicStore } from "./MusicStore";
import { Playlist } from "../entities/music/Playlist";

export class PlaylistStore {
  private musicStore: MusicStore;
  private playlists: Map<string, Playlist>;
  private listeners: (() => void)[];

  constructor(musicStore: MusicStore) {
    this.musicStore = musicStore;
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

  createPlaylist(name: string): void {
    if (!name || !name.trim()) {
      throw new Error('Playlist name is required');
    }
    const trimmedName = name.trim();
    if (this.playlists.has(trimmedName)) {
      throw new Error(`Playlist "${trimmedName}" already exists`);
    }
    const playlist = new Playlist(trimmedName);
    this.playlists.set(trimmedName, playlist);
    this.notifyListeners();
  }

  deletePlaylist(name: string): void {
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

  getPlaylist(name: string): Playlist | undefined {
    if (!name || !name.trim()) {
      return undefined;
    }
    return this.playlists.get(name.trim());
  }

  getAllPlaylists(): Playlist[] {
    return Array.from(this.playlists.values());
  }

  getPlaylistNames(): string[] {
    return Array.from(this.playlists.keys());
  }

  addTrackToPlaylist(playlistName: string, filePath: string): void {
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

  addTracksToPlaylist(playlistName: string, filePaths: string[]): void {
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

  removeTrackFromPlaylist(playlistName: string, filePath: string): void {
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

  getPlaylistTracks(playlistName: string): Metadata[] {
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
      .map((path: string) => this.musicStore.getTrack(path))
      .filter((track: Metadata | undefined): track is Metadata => track !== undefined);
  }

  getPlaylistTrackPaths(playlistName: string): string[] {
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

  getPlaylistSize(playlistName: string): number {
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

  renamePlaylist(oldName: string, newName: string): void {
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
    const playlist = this.playlists.get(trimmedOldName)!;
    playlist.rename(trimmedNewName);
    this.playlists.delete(trimmedOldName);
    this.playlists.set(trimmedNewName, playlist);
    this.notifyListeners();
  }

  clearPlaylist(playlistName: string): void {
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

  playlistHasTrack(playlistName: string, filePath: string): boolean {
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

  searchPlaylists(query: string): Playlist[] {
    if (!query || !query.trim()) {
      return this.getAllPlaylists();
    }
    const lowerQuery = query.toLowerCase().trim();
    return this.getAllPlaylists().filter(playlist =>
      playlist.playlistName.toLowerCase().includes(lowerQuery)
    );
  }

  searchTracksInPlaylist(playlistName: string, query: string): Metadata[] {
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
      .map((path: string) => this.musicStore.getTrack(path))
      .filter((track: Metadata | undefined): track is Metadata => track !== undefined);
    if (!query || !query.trim()) {
      return tracks;
    }
    const lowerQuery = query.toLowerCase().trim();
    return tracks.filter(track =>
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.album.toLowerCase().includes(lowerQuery) ||
      track.genre.toLowerCase().includes(lowerQuery)
    );
  }

  getPlaylistStatistics(): { totalPlaylists: number; totalTracks: number } {
    let totalTracks = 0;
    this.playlists.forEach(playlist => {
      totalTracks += playlist.size;
    });
    return {
      totalPlaylists: this.playlists.size,
      totalTracks: totalTracks
    };
  }

  toJSON(): any {
    return {
      playlists: Array.from(this.playlists.values()).map(playlist => playlist.toJSON())
    };
  }
}
