import { VideoStore } from '../../core/store/VideoStore.js';
import { VideoItem } from '../../core/entities/video/VideoItem.js';
import { PlaybackManager } from '../../core/player/PlaybackManager.js';
import { ContextMenu } from '../menu/ContextMenu.js';
import { ConfirmModal } from '../menu/ConfirmModal.js';
import { Component } from '../components/Component.js';

export class VideoContentContainer implements Component {
  private readonly contextMenu: ContextMenu;
  private readonly confirmModal: ConfirmModal;
  private handlePopstateRef: ((event: PopStateEvent) => Promise<void>) | null =
    null;
  private currentTargetElement: HTMLElement | null = null;

  constructor(
    private readonly videoStore: VideoStore,
    private readonly playbackManager: PlaybackManager,
  ) {
    this.contextMenu = new ContextMenu();
    this.confirmModal = new ConfirmModal();
  }

  public async render(
    targetElement: HTMLElement | null,
    filterTerm?: string,
  ): Promise<HTMLElement | null> {
    if (!targetElement) return null;
    this.currentTargetElement = targetElement;
    if (!this.handlePopstateRef) {
      this.handlePopstateRef = async (event: PopStateEvent) => {
        const state = event.state;
        const targetPath = state && state.path ? state.path : '/mnt/video';
        await this.videoStore.loadLibrary(targetPath);
        await this.render(this.currentTargetElement);
      };
      window.addEventListener('popstate', this.handlePopstateRef);
    }
    if (
      this.videoStore.getItems().length === 0 &&
      this.videoStore.getCurrentPath() === '/mnt/video'
    ) {
      await this.videoStore.loadLibrary('/mnt/video');
      history.replaceState({ path: '/mnt/video' }, '');
    }
    while (targetElement.firstChild) {
      targetElement.removeChild(targetElement.firstChild);
    }
    let allItems = this.videoStore.getItems();
    if (filterTerm) {
      allItems = this.videoStore.search(filterTerm);
    }
    if (allItems.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty';
      emptyDiv.textContent = '📁 Папка пуста';
      targetElement.appendChild(emptyDiv);
      return null;
    }
    const gridElement = document.createElement('div');
    gridElement.className = 'video-content';
    Object.assign(gridElement.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 120px))',
      gap: '16px',
      padding: '20px',
      justifyContent: 'start',
    });
    allItems.forEach((item) => {
      const videoCardElement = this.createVideoCardElement(item);
      videoCardElement.addEventListener('click', async (e) => {
        e.preventDefault();
        if (item.isDirectory) {
          await this.videoStore.navigateToFolder(item);
          history.pushState({ path: this.videoStore.getCurrentPath() }, '');
          await this.render(targetElement);
        } else if (item.isVideo) {
          await this.playbackManager.playVideo(item);
        }
      });
      videoCardElement.addEventListener('contextmenu', (e) => {
        this.contextMenu.show(e, [
          {
            label: item.isDirectory ? 'Открыть папку' : 'Воспроизвести',
            action: async () => {
              if (item.isDirectory) {
                await this.videoStore.navigateToFolder(item);
                history.pushState(
                  { path: this.videoStore.getCurrentPath() },
                  '',
                );
                await this.render(targetElement);
              } else if (item.isVideo) {
                await this.playbackManager.playVideo(item);
              }
            },
          },
          {
            label: 'Удалить',
            isDanger: true,
            action: async () => {
              const confirmDelete = await this.confirmModal.show(
                'Подтверждение удаления',
                `Вы уверены, что хотите удалить "${item.name}"?`,
                true,
              );
              if (confirmDelete) {
                await this.videoStore.removeFileSystemItem(
                  item.path,
                  item.isDirectory,
                );
                await this.render(targetElement);
              }
            },
          },
        ]);
      });
      gridElement.appendChild(videoCardElement);
    });
    targetElement.appendChild(gridElement);
    return gridElement;
  }

  public dispose(): void {
    if (this.handlePopstateRef) {
      window.removeEventListener('popstate', this.handlePopstateRef);
      this.handlePopstateRef = null;
    }
    this.currentTargetElement = null;
  }

  private createVideoCardElement(videoItem: VideoItem): HTMLElement {
    const cardElement = document.createElement('figure');
    cardElement.className = 'video-card';
    Object.assign(cardElement.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 10px',
      background: 'transparent',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
      width: '120px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    });
    cardElement.addEventListener(
      'mouseenter',
      () => (cardElement.style.background = 'var(--bg2)'),
    );
    cardElement.addEventListener(
      'mouseleave',
      () => (cardElement.style.background = 'transparent'),
    );
    const iconContainer = document.createElement('div');
    Object.assign(iconContainer.style, {
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: '0',
    });
    if (videoItem.isDirectory) {
      iconContainer.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="var(--orange)" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1
            2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    } else if (videoItem.isVideo) {
      iconContainer.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="#e74c3c" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M23 7l-7 5 7 5V7z"></path>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      `;
    } else {
      iconContainer.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="var(--fg3)" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0
            0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      `;
    }
    const titleElement = this.createTitleElement(videoItem.name);
    cardElement.append(iconContainer, titleElement);
    return cardElement;
  }

  private createTitleElement(title: string): HTMLElement {
    const captionElement = document.createElement('figcaption');
    captionElement.textContent = title;
    Object.assign(captionElement.style, {
      margin: '0',
      fontSize: '0.8rem',
      fontWeight: '500',
      color: 'var(--fg1)',
      lineHeight: '1.3',
      textAlign: 'center',
      display: '-webkit-box',
      webkitLineClamp: '3',
      webkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      wordBreak: 'break-word',
      width: '100%',
      userSelect: 'none',
      webkitUserSelect: 'none',
      mozUserSelect: 'none',
      msUserSelect: 'none',
    });
    return captionElement;
  }
}
