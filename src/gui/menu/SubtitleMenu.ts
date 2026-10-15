import {
  SubtitleApiClient,
  SubtitleTrack,
} from '../../core/api/SubtitleApiClient.js';
import { ToastService } from '../components/ToastService.js';

export class SubtitleMenu {
  private menuElement: HTMLElement | null = null;
  private readonly apiClient: SubtitleApiClient;
  private toggleButton: HTMLButtonElement | null = null;
  private isEnabled = true;
  private tracks: SubtitleTrack[] = [];
  private activeStreamIndex = -1;

  constructor() {
    this.apiClient = new SubtitleApiClient();
  }

  public async show(clickEvent: MouseEvent): Promise<void> {
    clickEvent.stopPropagation();
    this.close();
    this.menuElement = document.createElement('div');
    this.menuElement.className =
      'audio-stream-popup visible dynamic-subtitle-menu';
    this.menuElement.style.bottom = `${window.innerHeight - clickEvent.clientY + 10}px`;
    this.menuElement.style.left = `${Math.max(10, clickEvent.clientX - 150)}px`;
    const headerElement = document.createElement('div');
    headerElement.className = 'audio-stream-popup-header';
    headerElement.textContent = 'Субтитры';
    const closeButton = document.createElement('button');
    closeButton.className = 'audio-stream-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => this.close());
    headerElement.appendChild(closeButton);
    this.menuElement.appendChild(headerElement);
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'subtitle-toggle-container';
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'subtitle-toggle-btn';
    this.toggleButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      await this.handleToggle();
    });
    toggleContainer.appendChild(this.toggleButton);
    this.menuElement.appendChild(toggleContainer);
    const listContainer = document.createElement('div');
    listContainer.className = 'audio-stream-list';
    this.menuElement.appendChild(listContainer);
    document.body.appendChild(this.menuElement);
    await this.loadTracks(listContainer);
    window.addEventListener('click', () => this.close(), { once: true });
  }

  private async loadTracks(listContainer: HTMLElement): Promise<void> {
    listContainer.innerHTML = '';
    try {
      this.tracks = await this.apiClient.getSubtitleTracks();
      const activeTrack = await this.apiClient.getCurrentSubtitleTrack();
      this.activeStreamIndex = activeTrack ? activeTrack.streamIndex : -1;
      this.isEnabled = activeTrack !== null;
      this.updateToggleButton();
      if (this.tracks.length === 0) {
        const emptyElement = document.createElement('div');
        emptyElement.className = 'audio-stream-item';
        emptyElement.textContent = 'Дорожки не найдены';
        listContainer.appendChild(emptyElement);
        return;
      }
      this.tracks.forEach((track) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'audio-stream-item';
        if (track.streamIndex === this.activeStreamIndex) {
          itemElement.classList.add('selected');
        }
        const nameElement = document.createElement('span');
        nameElement.className = 'audio-stream-name';
        nameElement.textContent =
          track.title || track.language || `Дорожка ${track.streamIndex}`;
        itemElement.appendChild(nameElement);
        if (track.codec) {
          const codecElement = document.createElement('span');
          codecElement.className = 'audio-stream-codec';
          codecElement.textContent = track.codec;
          itemElement.appendChild(codecElement);
        }
        itemElement.addEventListener('click', async (e) => {
          e.stopPropagation();
          const success = await this.apiClient.setSubtitleTrack(
            track.streamIndex,
          );
          if (success) {
            this.isEnabled = true;
            this.activeStreamIndex = track.streamIndex;
            this.updateToggleButton();
            this.updateSelectedItem(listContainer);
            ToastService.getInstance().show('Субтитры включены', 'success');
          } else {
            ToastService.getInstance().show(
              'Не удалось переключить дорожку',
              'error',
            );
          }
        });
        listContainer.appendChild(itemElement);
      });
    } catch (networkError) {
      const errorElement = document.createElement('div');
      errorElement.className = 'audio-stream-item';
      errorElement.textContent = 'Ошибка загрузки';
      listContainer.appendChild(errorElement);
    }
  }

  private updateSelectedItem(listContainer: HTMLElement): void {
    const items = listContainer.querySelectorAll('.audio-stream-item');
    items.forEach((item, index) => {
      const track = this.tracks[index];
      if (!track) return;
      if (track.streamIndex === this.activeStreamIndex && this.isEnabled) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  private updateToggleButton(): void {
    if (!this.toggleButton) return;
    this.toggleButton.textContent = this.isEnabled
      ? 'Выключить субтитры'
      : 'Включить субтитры';
    this.toggleButton.classList.toggle('disabled', !this.isEnabled);
  }

  private async handleToggle(): Promise<void> {
    if (this.isEnabled) {
      const success = await this.apiClient.disableSubtitles();
      if (success) {
        this.isEnabled = false;
        this.activeStreamIndex = -1;
        this.updateToggleButton();
        const listContainer = this.menuElement?.querySelector(
          '.audio-stream-list',
        ) as HTMLElement;
        if (listContainer) {
          this.updateSelectedItem(listContainer);
        }
        ToastService.getInstance().show('Субтитры выключены', 'success');
      } else {
        ToastService.getInstance().show(
          'Не удалось выключить субтитры',
          'error',
        );
      }
    } else {
      if (this.tracks.length === 0) {
        ToastService.getInstance().show(
          'Нет доступных дорожек субтитров',
          'info',
        );
        return;
      }
      const success = await this.apiClient.setSubtitleTrack(
        this.tracks[0].streamIndex,
      );
      if (success) {
        this.isEnabled = true;
        this.activeStreamIndex = this.tracks[0].streamIndex;
        this.updateToggleButton();
        const listContainer = this.menuElement?.querySelector(
          '.audio-stream-list',
        ) as HTMLElement;
        if (listContainer) {
          this.updateSelectedItem(listContainer);
        }
        ToastService.getInstance().show('Субтитры включены', 'success');
      } else {
        ToastService.getInstance().show(
          'Не удалось включить субтитры',
          'error',
        );
      }
    }
  }

  public close(): void {
    if (this.menuElement && this.menuElement.parentNode) {
      this.menuElement.parentNode.removeChild(this.menuElement);
    }
    this.menuElement = null;
    this.toggleButton = null;
    this.tracks = [];
    this.activeStreamIndex = -1;
  }
}
