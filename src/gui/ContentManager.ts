import { Player } from './Player.js';

export class ContentManager {
  private player: Player;
  private playerElement: HTMLElement | null = null;

  constructor() {
    this.player = new Player();
  }

  private getPlayer(): HTMLElement {
    if (!this.playerElement) {
      this.playerElement = this.player.render();
      this.playerElement.classList.remove('visible');
    }
    return this.playerElement;
  }

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
    const player = this.getPlayer();
    player.classList.add('visible');
    container.appendChild(player);
    return container;
  }

  getVideoContent(): HTMLElement {
    return this.createContent('Контент для Видео', '🎬');
  }

  getAudioContent(): HTMLElement {
    return this.createContent('Контент для Аудио', '🎵');
  }

  getSettingsContent(): HTMLElement {
    if (this.playerElement) {
      this.playerElement.classList.remove('visible');
    }
    const settingsGrid = document.createElement('div');
    settingsGrid.className = 'content-grid';
    settingsGrid.textContent = '⚙️ Контент для Настроек';
    return settingsGrid;
  }
}
