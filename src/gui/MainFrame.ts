import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { Player } from './Player.js';
import { Settings } from './Settings.js';
import { MusicStore } from '../core/store/MusicStore.js';
import { VideoStore } from '../core/store/VideoStore.js';
import { PlaylistStore } from '../core/store/PlaylistStore.js';
import { PlaybackManager } from '../core/player/PlaybackManager.js';
import { VideoContentContainer } from './containers/VideoContentContainer.js';
import { MusicContentContainer } from './containers/MusicContentContainer.js';
import { ComponentFactory, TabType } from './components/ComponentFactory.js';
import { Component } from './components/Component.js';
import { UiStateStore, UiState } from '../core/store/UiStateStore.js';

export class MainFrame {
  private header: Header;
  private sidebar: Sidebar;
  private settings: Settings;
  private componentFactory: ComponentFactory;
  private currentTab: TabType = 'video';
  private contentArea: HTMLElement | null = null;
  private currentLiveComponent: Component | null = null;

  constructor(
    private musicStore: MusicStore,
    private videoStore: VideoStore,
    private playlistStore: PlaylistStore,
    private playbackManager: PlaybackManager,
    private player: Player,
  ) {
    this.settings = new Settings();
    this.componentFactory = new ComponentFactory();
    this.initFactory();
    this.header = new Header(
      this.musicStore,
      this.playlistStore,
      this.playbackManager,
    );
    this.sidebar = new Sidebar((selectedTab: TabType) => {
      this.switchTab(selectedTab);
    });
  }

  public async initialize(): Promise<void> {
    try {
      await this.musicStore.loadTracksFromServer();
    } catch (error) {
      console.error(error);
    }
  }

  private initFactory(): void {
    this.componentFactory.register(
      'video',
      () => new VideoContentContainer(this.videoStore, this.playbackManager),
    );
    this.componentFactory.register(
      'audio',
      () =>
        new MusicContentContainer(
          this.musicStore,
          this.playlistStore,
          this.playbackManager,
        ),
    );
    this.componentFactory.register('settings', () => this.settings);
  }

  private async switchTab(targetTab: TabType): Promise<void> {
    const searchInput = document.getElementById(
      'globalSearchInput',
    ) as HTMLInputElement;
    const clearButton = document.querySelector(
      '.search-clear-btn',
    ) as HTMLElement;
    if (searchInput) searchInput.value = '';
    if (clearButton) clearButton.style.display = 'none';
    const tabConfigs = {
      video: { icon: 'fa-film', text: 'Видео' },
      audio: { icon: 'fa-music', text: 'Аудио' },
      settings: { icon: 'fa-cog', text: 'Настройки' },
    };
    const config = tabConfigs[targetTab];
    this.header.setTitle(config.icon, config.text);
    this.header.togglePlaylistButtonVisibility(targetTab === 'audio');
    UiStateStore.getInstance().setTab(targetTab);
  }

  private async updateContent(activeTab: TabType): Promise<void> {
    if (!this.contentArea) return;
    if (this.currentLiveComponent) this.currentLiveComponent.dispose();
    this.currentLiveComponent = this.componentFactory.create(activeTab);
    await this.currentLiveComponent.render(this.contentArea);
  }

  public render(): HTMLElement {
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';
    appContainer.appendChild(this.header.render());
    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'body-wrapper';
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    mainContent.appendChild(this.sidebar.render());
    this.contentArea = document.createElement('div');
    this.contentArea.className = 'content-area';
    mainContent.appendChild(this.contentArea);
    bodyWrapper.appendChild(mainContent);
    const renderedPlayer = this.player.render();
    renderedPlayer.classList.add('visible');
    bodyWrapper.appendChild(renderedPlayer);
    appContainer.appendChild(bodyWrapper);
    UiStateStore.getInstance().subscribe(async (state: UiState) => {
      if (this.currentTab !== state.currentTab) {
        this.currentTab = state.currentTab;
        if (this.currentLiveComponent) this.currentLiveComponent.dispose();
        this.currentLiveComponent = this.componentFactory.create(
          state.currentTab,
        );
      }
      if (this.contentArea) {
        await this.currentLiveComponent?.render(this.contentArea);
      }
    });
    this.updateContent(this.currentTab);
    this.bindPlayerControls();
    setTimeout(() => {
      this.header.togglePlaylistButtonVisibility(this.currentTab === 'audio');
    }, 0);
    this.bindHeaderEvents(appContainer);
    return appContainer;
  }

  private bindPlayerControls(): void {
    this.player.bindControls(
      () => {
        this.playbackManager.togglePlay();
      },
      () => {
        this.playbackManager.stop();
      },
      (seconds: number) => {
        this.playbackManager.seek(seconds);
      },
    );
    (this.player as any).onPlayPauseCallback = this.playbackManager;
  }

  private bindHeaderEvents(containerElement: HTMLElement): void {
    this.header.bindSearch(async (searchTerm: string) => {
      UiStateStore.getInstance().setSearchQuery(searchTerm);
    }, containerElement);
  }
}
