import { VideoStore } from '../../core/store/VideoStore.js';
import { VideoItem } from '../../core/entities/video/VideoItem.js';
import { PlaybackManager } from '../../core/player/PlaybackManager.js';
import { ContextMenu } from '../menu/ContextMenu.js';
import { ConfirmModal } from '../menu/ConfirmModal.js';
import { Component } from '../components/Component.js';
import { UiStateStore } from '../../core/store/UiStateStore.js';

export class VideoContentContainer implements Component {
  private readonly contextMenu: ContextMenu;
  private readonly confirmModal: ConfirmModal;

  constructor(
    private readonly videoStore: VideoStore,
    private readonly playbackManager: PlaybackManager,
  ) {
    this.contextMenu = new ContextMenu();
    this.confirmModal = new ConfirmModal();
  }

  public async render(
    targetElement: HTMLElement | null,
  ): Promise<HTMLElement | null> {
    if (!targetElement) return null;
    const uiState = UiStateStore.getInstance().getState();
    const filterTerm = uiState.searchQuery;
    const activePath = uiState.currentPath;
    if (
      !this.videoStore.isLoaded() ||
      this.videoStore.getCurrentPath() !== activePath
    ) {
      await this.videoStore.loadLibrary(activePath);
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
    gridElement.className = 'video-content dynamic-video-grid';
    allItems.forEach((item) => {
      const videoCardElement = this.createVideoCardElement(item);
      videoCardElement.addEventListener('click', async (e) => {
        e.preventDefault();
        if (item.isDirectory) {
          UiStateStore.getInstance().setCurrentPath(item.path);
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
                UiStateStore.getInstance().setCurrentPath(item.path);
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

  public dispose(): void {}

  private createVideoCardElement(videoItem: VideoItem): HTMLElement {
    const cardElement = document.createElement('figure');
    cardElement.className = 'video-card dynamic-video-card';
    const iconContainer = document.createElement('div');
    iconContainer.className = 'video-card-icon-wrapper';
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
    captionElement.className = 'video-card-caption';
    captionElement.textContent = title;
    return captionElement;
  }
}
