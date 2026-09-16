import { Component } from './components/Component.js';
import { TvPlaybackManager } from './managers/TvPlaybackManager.js';
import { ToastService } from './components/ToastService.js';

export class Settings implements Component {
  private tvStatusLabel: HTMLElement | null = null;
  private tvToggleButton: HTMLButtonElement | null = null;
  private isBusy = false;

  constructor(private readonly tvPlaybackManager: TvPlaybackManager) {
    if (!tvPlaybackManager) {
      throw new Error('[Settings] TvPlaybackManager is required');
    }
  }

  public async render(
    targetElement: HTMLElement | null,
  ): Promise<HTMLElement | null> {
    if (!targetElement) return null;
    const element = document.createElement('div');
    element.className = 'settings-page';
    element.style.padding = '20px';
    element.style.display = 'flex';
    element.style.flexDirection = 'column';
    element.style.gap = '16px';
    const title = document.createElement('h2');
    title.textContent = 'Настройки';
    title.style.color = 'var(--yellow)';
    element.appendChild(title);
    const tvCard = document.createElement('div');
    tvCard.style.cssText = `
      background: var(--bg1);
      border: 1px solid var(--bg3);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      max-width: 320px;
    `;
    const icon = document.createElement('div');
    icon.style.cssText = 'font-size:48px;color:var(--yellow);';
    icon.innerHTML = '<i class="fas fa-tv"></i>';
    const tvTitle = document.createElement('div');
    tvTitle.textContent = 'Телевизор';
    tvTitle.style.cssText = 'color:var(--fg0);font-size:18px;font-weight:600;';
    this.tvStatusLabel = document.createElement('div');
    this.tvStatusLabel.style.cssText = 'font-size:14px;';
    this.tvToggleButton = document.createElement('button');
    this.tvToggleButton.className =
      'refresh-confirm-btn refresh-confirm-confirm';
    this.tvToggleButton.style.cssText = `
      margin-top: 8px;
      padding: 10px 24px; border: none; border-radius: 8px;
      background: var(--yellow); color: var(--bg0);
      font-weight: 600; cursor: pointer; transition: all 0.2s;
    `;
    this.tvToggleButton.addEventListener('click', () => {
      void this.handleToggle();
    });
    tvCard.append(icon, tvTitle, this.tvStatusLabel, this.tvToggleButton);
    element.appendChild(tvCard);
    while (targetElement.firstChild) {
      targetElement.removeChild(targetElement.firstChild);
    }
    targetElement.appendChild(element);
    void this.handleRefresh();
    return element;
  }

  public async onActivate(): Promise<void> {
    console.log('⚙️ [Settings] activated, refreshing TV state');
    await this.handleRefresh();
  }

  public dispose(): void {
    this.tvStatusLabel = null;
    this.tvToggleButton = null;
  }

  private async handleToggle(): Promise<void> {
    if (this.isBusy) return;
    this.isBusy = true;
    this.updateUi();
    try {
      const isActive = this.tvPlaybackManager.getIsActive();
      const success = isActive
        ? await this.tvPlaybackManager.turnOff()
        : await this.tvPlaybackManager.turnOn();
      if (success) {
        ToastService.getInstance().show(
          isActive ? 'Телевизор выключен' : 'Телевизор включён',
          'success',
        );
      } else {
        ToastService.getInstance().show(
          'Не удалось изменить состояние телевизора',
          'error',
        );
      }
    } finally {
      this.isBusy = false;
      this.updateUi();
    }
  }

  private async handleRefresh(): Promise<void> {
    try {
      await this.tvPlaybackManager.refreshState();
    } finally {
      this.updateUi();
    }
  }

  private updateUi(): void {
    const isActive = this.tvPlaybackManager.getIsActive();
    if (this.tvStatusLabel) {
      if (this.isBusy) {
        this.tvStatusLabel.textContent = 'Выполняется...';
        this.tvStatusLabel.style.color = 'var(--orange)';
      } else {
        this.tvStatusLabel.textContent = isActive ? 'Включён' : 'Выключен';
        this.tvStatusLabel.style.color = isActive
          ? 'var(--green)'
          : 'var(--red)';
      }
    }
    if (this.tvToggleButton) {
      this.tvToggleButton.disabled = this.isBusy;
      this.tvToggleButton.textContent = isActive ? 'Выключить' : 'Включить';
      this.tvToggleButton.style.opacity = this.isBusy ? '0.6' : '1';
      this.tvToggleButton.style.cursor = this.isBusy ? 'wait' : 'pointer';
    }
  }
}
