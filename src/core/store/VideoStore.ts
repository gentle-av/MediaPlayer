import { VideoItem } from '../entities/video/VideoItem';
import { VideoApiClient } from '../api/VideoApiClient';
import { VideoLibrary } from '../entities/video/VideoLibrary';

export class VideoStore {
  private client: VideoApiClient;
  private currentLibrary: VideoLibrary | null = null;
  private currentPath: string = '/mnt/video';
  private listeners: (() => void)[] = [];

  constructor() {
    this.client = new VideoApiClient();
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

  async loadLibrary(path?: string): Promise<void> {
    if (path) {
      this.currentPath = path;
    }

    this.currentLibrary = await this.client.listVideos(this.currentPath);
    this.notifyListeners();
  }

  getItems(): VideoItem[] {
    return this.currentLibrary?.items || [];
  }

  getFolders(): VideoItem[] {
    return this.currentLibrary?.getFolders() || [];
  }

  getVideos(): VideoItem[] {
    return this.currentLibrary?.getVideos() || [];
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  getLibrary(): VideoLibrary | null {
    return this.currentLibrary;
  }

  getStatistics(): { total: number; folders: number; videos: number } {
    if (!this.currentLibrary) {
      return { total: 0, folders: 0, videos: 0 };
    }
    return {
      total: this.currentLibrary.items.length,
      folders: this.currentLibrary.getFolders().length,
      videos: this.currentLibrary.getVideos().length
    };
  }

  async navigateToFolder(item: VideoItem): Promise<void> {
    if (item.isDirectory) {
      await this.loadLibrary(item.path);
    }
  }

  search(term: string): VideoItem[] {
    if (!this.currentLibrary) return [];
    return this.currentLibrary.items.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase())
    );
  }

  clear(): void {
    this.currentLibrary = null;
    this.notifyListeners();
  }
}
