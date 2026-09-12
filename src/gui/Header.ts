import { PlaylistModal } from './modals/PlaylistModal.js';
import { MusicStore } from '../core/store/MusicStore.js';
import { PlaylistStore } from '../core/store/PlaylistStore.js';
import { PlaybackManager } from '../core/player/PlaybackManager.js';

export class Header {
  private pageTitleElement: HTMLElement | null = null;
  private titleIconElement: HTMLElement | null = null;

  constructor(
    private musicStore: MusicStore,
    private playlistStore: PlaylistStore,
    private playbackManager: PlaybackManager,
  ) {}

  public render(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'app-header';
    const titleSection = document.createElement('div');
    titleSection.className = 'header-title-section';
    this.pageTitleElement = this.createPageTitle();
    titleSection.appendChild(this.pageTitleElement);
    header.appendChild(titleSection);
    const controlsSection = document.createElement('div');
    controlsSection.className = 'header-controls-section';
    controlsSection.appendChild(this.createSearch());
    controlsSection.appendChild(this.createPlaylistButton());
    header.appendChild(controlsSection);
    return header;
  }

  public setTitleIcon(iconClass: string): void {
    if (this.titleIconElement) {
      this.titleIconElement.className = '';
      this.titleIconElement.className = `fas ${iconClass}`;
    }
  }

  public setTitleText(text: string): void {
    if (this.pageTitleElement) {
      const icon = this.pageTitleElement.querySelector('i');
      this.pageTitleElement.innerHTML = '';
      if (icon) {
        this.pageTitleElement.appendChild(icon);
      }
      this.pageTitleElement.appendChild(document.createTextNode(` ${text}`));
    }
  }

  public setTitle(iconClass: string, text: string): void {
    this.setTitleIcon(iconClass);
    this.setTitleText(text);
  }

  public togglePlaylistButtonVisibility(isVisible: boolean): void {
    const playlistBtn = document.getElementById('headerPlaylistBtn');
    if (playlistBtn) {
      playlistBtn.style.display = isVisible ? 'flex' : 'none';
    }
  }

  public bindSearch(
    onSearch: (searchTerm: string) => void,
    containerElement: HTMLElement,
  ): void {
    const searchInput = containerElement.querySelector(
      '#globalSearchInput',
    ) as HTMLInputElement;
    const clearButton = containerElement.querySelector(
      '#globalSearchBox .search-clear-btn',
    ) as HTMLElement;
    if (!searchInput) {
      return;
    }
    searchInput.addEventListener('input', (event) => {
      const currentTerm = (event.target as HTMLInputElement).value;
      if (clearButton) {
        clearButton.style.setProperty(
          'display',
          currentTerm.length > 0 ? 'flex' : 'none',
          'important',
        );
      }
      onSearch(currentTerm);
    });
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        searchInput.value = '';
        clearButton.style.setProperty('display', 'none', 'important');
        onSearch('');
      });
    }
  }

  private createSearch(): HTMLElement {
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-wrapper';
    const searchBox = document.createElement('div');
    searchBox.id = 'globalSearchBox';
    searchBox.innerHTML = `
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--fg3); flex-shrink: 0;">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;
    const searchInput = document.createElement('input');
    searchInput.id = 'globalSearchInput';
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск...';
    searchBox.appendChild(searchInput);
    const clearButton = document.createElement('button');
    clearButton.className = 'search-clear-btn';
    clearButton.style.display = 'none';
    clearButton.innerHTML = `
      <svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--fg3); display: block;">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    searchBox.appendChild(clearButton);
    searchWrapper.appendChild(searchBox);
    return searchWrapper;
  }

  private createPageTitle(): HTMLElement {
    const pageTitle = document.createElement('h1');
    pageTitle.className = 'page-title';
    this.titleIconElement = document.createElement('i');
    this.titleIconElement.className = 'fas fa-play';
    pageTitle.appendChild(this.titleIconElement);
    pageTitle.appendChild(document.createTextNode(' Video'));
    return pageTitle;
  }

  private createPlaylistButton(): HTMLElement {
    const playlistBtn = document.createElement('button');
    playlistBtn.id = 'headerPlaylistBtn';
    playlistBtn.className = 'header-btn';
    const playlistIcon = document.createElement('i');
    playlistIcon.className = 'fas fa-list';
    playlistBtn.appendChild(playlistIcon);
    playlistBtn.appendChild(document.createTextNode(' Плейлист'));
    const badge = document.createElement('span');
    badge.className = 'playlist-badge';
    badge.textContent = '0';
    playlistBtn.appendChild(badge);
    playlistBtn.addEventListener('click', () => {
      const currentTracks = this.musicStore.getAllTracks();
      const modal = new PlaylistModal(
        currentTracks,
        this.playbackManager,
        this.playlistStore,
      );
      modal.open();
    });
    return playlistBtn;
  }
}
