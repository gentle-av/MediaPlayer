import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { ContentManager } from './ContentManager.js';
import { Player } from './Player.js';
import { Settings } from './Settings.js';
import { MusicStore } from '../core/store/MusicStore.js';
import { VideoStore } from '../core/store/VideoStore.js';
import { PlaylistStore } from '../core/store/PlaylistStore.js';
import { PlaybackManager } from '../core/player/PlaybackManager.js';

export class MainFrame {
  private header: Header;
  private sidebar: Sidebar;
  private contentManager: ContentManager;
  private player: Player;
  private settings: Settings;
  private currentTab: 'video' | 'audio' | 'settings' = 'video';
  private contentArea: HTMLElement | null = null;
  private musicStore: MusicStore;
  private videoStore: VideoStore;
  private playlistStore: PlaylistStore;
  private playbackManager: PlaybackManager;
  private activeSearchTerm: string = '';

  constructor() {
    this.musicStore = new MusicStore();
    this.videoStore = new VideoStore();
    this.playlistStore = new PlaylistStore(this.musicStore);
    this.player = new Player();
    this.settings = new Settings();
    this.playbackManager = new PlaybackManager(this.player, this.musicStore, this.videoStore);
    this.contentManager = new ContentManager(this.musicStore, this.videoStore, this.playlistStore, this.playbackManager);
    this.header = new Header();
    this.sidebar = new Sidebar((selectedTab: 'video' | 'audio' | 'settings') => {
      this.switchTab(selectedTab);
    });
  }

  private async switchTab(targetTab: 'video' | 'audio' | 'settings'): Promise<void> {
    this.currentTab = targetTab;
    this.activeSearchTerm = '';
    const searchInput = document.getElementById('globalSearchInput') as HTMLInputElement;
    const clearButton = document.querySelector('.search-clear-btn') as HTMLElement;
    if (searchInput) {
      searchInput.value = '';
    }
    if (clearButton) {
      clearButton.style.display = 'none';
    }
    const tabConfigurations = {
      video: { icon: 'fa-film', text: 'Видео' },
      audio: { icon: 'fa-music', text: 'Аудио' },
      settings: { icon: 'fa-cog', text: 'Настройки' },
    };
    const activeConfiguration = tabConfigurations[targetTab];
    this.header.setTitle(activeConfiguration.icon, activeConfiguration.text);
    const isAudioTab = targetTab === 'audio';
    this.header.togglePlaylistButtonVisibility(isAudioTab);
    await this.updateContent(targetTab);
  }

  private async updateContent(activeTab: 'video' | 'audio' | 'settings'): Promise<void> {
    if (!this.contentArea) {
      return;
    }
    let tabPlaceholderElement: HTMLElement | null = null;
    switch (activeTab) {
      case 'video':
        if (this.activeSearchTerm) {
          const filteredVideos = this.videoStore.search(this.activeSearchTerm);
          await this.contentManager.renderVideoContent(this.contentArea, filteredVideos);
        } else {
          await this.contentManager.getVideoContent(this.contentArea);
        }
        break;
      case 'audio':
        this.contentArea.innerHTML = '';
        tabPlaceholderElement = this.createPlaceholderContent('audio', '🎵 Аудио');
        this.contentArea.appendChild(tabPlaceholderElement);
        break;
      case 'settings':
        this.contentArea.innerHTML = '';
        tabPlaceholderElement = this.createPlaceholderContent('settings', '⚙️ Настройки');
        this.contentArea.appendChild(tabPlaceholderElement);
        break;
    }
  }

  private createPlaceholderContent(contentType: string, placeholderText: string): HTMLElement {
    const fallbackContainerElement = document.createElement('div');
    fallbackContainerElement.className = 'content-grid';
    fallbackContainerElement.textContent = placeholderText;
    return fallbackContainerElement;
  }

  private bindPlayerControls(renderedAppElement: HTMLElement): void {
    const playPauseButtonElement = renderedAppElement.querySelector('.universal-bottom-player-play');
    if (playPauseButtonElement) {
      playPauseButtonElement.addEventListener('click', () => {
        this.playbackManager.togglePlay();
      });
    }
    const stopButtonElement = renderedAppElement.querySelector('.universal-bottom-player-stop');
    if (stopButtonElement) {
      stopButtonElement.addEventListener('click', () => {
        this.playbackManager.stop();
      });
    }
  }

  private bindHeaderEvents(containerElement: HTMLElement): void {
    this.header.bindSearch(async (searchTerm: string) => {
      this.activeSearchTerm = searchTerm;
      if (this.currentTab === 'video') {
        const filteredVideos = this.videoStore.search(searchTerm);
        if (this.contentArea) {
          await this.contentManager.renderVideoContent(this.contentArea, filteredVideos);
        }
      }
    }, containerElement);
  }

  render(): HTMLElement {
    const applicationContainerElement = document.createElement('div');
    applicationContainerElement.className = 'app-container';
    const renderedHeaderElement = this.header.render();
    applicationContainerElement.appendChild(renderedHeaderElement);
    const bodyWrapperElement = document.createElement('div');
    bodyWrapperElement.className = 'body-wrapper';
    const mainContentLayoutElement = document.createElement('div');
    mainContentLayoutElement.className = 'main-content';
    const renderedSidebarElement = this.sidebar.render();
    mainContentLayoutElement.appendChild(renderedSidebarElement);
    this.contentArea = document.createElement('div');
    this.contentArea.className = 'content-area';
    mainContentLayoutElement.appendChild(this.contentArea);
    bodyWrapperElement.appendChild(mainContentLayoutElement);
    const renderedPlayerElement = this.player.render();
    renderedPlayerElement.classList.add('visible');
    bodyWrapperElement.appendChild(renderedPlayerElement);
    applicationContainerElement.appendChild(bodyWrapperElement);
    this.updateContent(this.currentTab);
    this.bindPlayerControls(applicationContainerElement);
    setTimeout(() => {
      const isAudioTab = this.currentTab === 'audio';
      this.header.togglePlaylistButtonVisibility(isAudioTab);
    }, 0);
    this.bindHeaderEvents(applicationContainerElement);
    return applicationContainerElement;
  }

  async initialize(): Promise<void> {
    try {
      await this.musicStore.loadTracksFromServer();
      console.log(`✅ Loaded ${this.musicStore.getLibrarySize()} tracks from server`);
    } catch (initializationError) {
      console.error(initializationError);
    }
  }

  getMusicStore(): MusicStore {
    return this.musicStore;
  }

  getPlaylistStore(): PlaylistStore {
    return this.playlistStore;
  }

  getVideoStore(): VideoStore {
    return this.videoStore;
  }

  getPlaybackManager(): PlaybackManager {
    return this.playbackManager;
  }
}
