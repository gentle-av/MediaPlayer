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
import { TvPlaybackManager } from './managers/TvPlaybackManager.js';
import { AudioOutputManager } from './managers/AudioOutputManager.js';
import { PlaylistClearConfirmModal } from './modals/PlaylistClearConfirmModal.js';
import { AlbumDeleteConfirmModal } from './modals/AlbumDeleteConfirmModal.js';

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
    private tvPlaybackManager: TvPlaybackManager,
    private audioOutputManager: AudioOutputManager,
    private readonly clearModal: PlaylistClearConfirmModal,
    private readonly deleteAlbumModal: AlbumDeleteConfirmModal,
  ) {
    this.settings = new Settings(
      this.tvPlaybackManager,
      this.audioOutputManager,
    );
    this.componentFactory = new ComponentFactory();
    this.initFactory();
    this.header = new Header(this.playlistStore, this.playbackManager);
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

  public render(): HTMLElement {
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';
    appContainer.appendChild(this.header.render());
    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'body-wrapper';
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    const sidebarElement = this.sidebar.render();
    mainContent.appendChild(sidebarElement);
    this.contentArea = document.createElement('div');
    this.contentArea.className = 'content-area';
    mainContent.appendChild(this.contentArea);
    bodyWrapper.appendChild(mainContent);
    const renderedPlayer = this.player.render();
    bodyWrapper.appendChild(renderedPlayer);
    appContainer.appendChild(bodyWrapper);
    UiStateStore.getInstance().subscribe(async (state: UiState) => {
      const isTabChanged = this.currentTab !== state.currentTab;
      const isPathChanged =
        state.currentTab === 'video' &&
        this.videoStore.getCurrentPath() !== state.currentPath;
      const currentRenderedQuery = this.contentArea?.dataset?.lastQuery || '';
      if (isTabChanged || isPathChanged) {
        this.currentTab = state.currentTab;
        await this.updateContent(state.currentTab);
      } else if (currentRenderedQuery !== state.searchQuery) {
        await this.updateContent(this.currentTab);
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
          this.deleteAlbumModal,
        ),
    );
    this.componentFactory.register('settings', () => this.settings);
  }

  private async switchTab(targetTab: TabType): Promise<void> {
    console.log('🔀 [MainFrame] switchTab:', targetTab);
    const searchInput = document.getElementById(
      'globalSearchInput',
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    const headerElement = document.querySelector('.app-header');
    if (headerElement) {
      const clearBtn = headerElement.querySelector(
        '.search-clear-btn',
      ) as HTMLElement;
      if (clearBtn) {
        clearBtn.classList.remove('visible');
      }
    }
    const tabConfigs = {
      video: { icon: 'fa-film', text: 'Видео' },
      audio: { icon: 'fa-music', text: 'Аудио' },
      settings: { icon: 'fa-cog', text: 'Настройки' },
    };
    const config = tabConfigs[targetTab];
    this.header.setTitle(config.icon, config.text);
    this.header.togglePlaylistButtonVisibility(targetTab === 'audio');
    UiStateStore.getInstance().setTab(targetTab);
    if (this.currentTab !== targetTab) {
      this.currentTab = targetTab;
      await this.updateContent(targetTab);
    }
  }

  private async updateContent(activeTab: TabType): Promise<void> {
    console.log('📦 [MainFrame] updateContent:', activeTab);
    if (!this.contentArea) return;
    if (this.currentLiveComponent) {
      this.currentLiveComponent.dispose();
    }
    const currentQuery = UiStateStore.getInstance().getState().searchQuery;
    this.contentArea.dataset.lastQuery = currentQuery;
    this.currentLiveComponent = this.componentFactory.create(activeTab);
    await this.currentLiveComponent.render(this.contentArea);
    if (this.currentLiveComponent.onActivate) {
      await this.currentLiveComponent.onActivate();
    }
  }

  private bindPlayerControls(): void {
    this.player.bindControls(
      () => {
        this.playbackManager.togglePlay();
      },
      () => {
        this.playbackManager.stop();
      },
      () => {
        this.playbackManager.playNextTrack();
      },
      () => {
        this.playbackManager.playPreviousTrack();
      },
      (seconds: number) => {
        this.playbackManager.seek(seconds);
      },
    );
  }

  private bindHeaderEvents(containerElement: HTMLElement): void {
    this.header.bindSearch(async (searchTerm: string) => {
      UiStateStore.getInstance().setSearchQuery(searchTerm);
    }, containerElement);
  }
}
