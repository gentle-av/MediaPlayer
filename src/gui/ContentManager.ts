import { MusicStore } from "../core/store/MusicStore.js";
import { VideoStore } from "../core/store/VideoStore.js";
import { PlaylistStore } from "../core/store/PlaylistStore.js";

export class ContentManager {

  constructor(
    private musicStore: MusicStore,
    private videoStore: VideoStore,
    private playlistStore: PlaylistStore) {}

  private createContent(label: string, icon: string): HTMLElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '0'
    });
    const grid = document.createElement('div');
    grid.className = 'content-grid';
    grid.textContent = `${icon} ${label}`;
    Object.assign(grid.style, {
      flex: '1',
      overflowY: 'auto',
      padding: '20px'
    });
    container.appendChild(grid);
    return container;
  }

  getVideoContent(): HTMLElement {
    return this.createContent('Контент для Видео', '🎬');
  }

  getAudioContent(): HTMLElement {
    return this.createContent('Контент для Аудио', '🎵');
  }

  getSettingsContent(): HTMLElement {
    return this.createContent('Контент для Настройки', '⚙')
  }
}
