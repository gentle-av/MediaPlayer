export type TabType = 'video' | 'audio' | 'settings';

export interface UiState {
  currentTab: TabType;
  searchQuery: string;
  currentPath: string;
}

export class UiStateStore {
  private static instance: UiStateStore | null = null;
  private state: UiState = {
    currentTab: 'video',
    searchQuery: '',
    currentPath: '/mnt/video',
  };
  private listeners: Array<(state: UiState) => void> = [];

  private constructor() {}

  public static getInstance(): UiStateStore {
    if (!UiStateStore.instance) {
      UiStateStore.instance = new UiStateStore();
    }
    return UiStateStore.instance;
  }

  public getState(): UiState {
    return { ...this.state };
  }

  public setSearchQuery(query: string): void {
    this.state.searchQuery = query;
    this.notify();
  }

  public setTab(tab: TabType): void {
    this.state.currentTab = tab;
    this.state.searchQuery = '';
    this.notify();
  }

  public setCurrentPath(path: string): void {
    this.state.currentPath = path;
    this.notify();
  }

  public subscribe(listener: (state: UiState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }
}
