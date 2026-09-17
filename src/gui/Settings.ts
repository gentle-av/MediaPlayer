import { Component } from './components/Component.js';
import { TvPlaybackManager } from './managers/TvPlaybackManager.js';
import { AudioOutputManager } from './managers/AudioOutputManager.js';
import { ToastService } from './components/ToastService.js';

export class Settings implements Component {
  private tvStatusLabel: HTMLElement | null = null;
  private tvToggleButton: HTMLButtonElement | null = null;
  private tvBusy = false;
  private volumeSlider: HTMLInputElement | null = null;
  private volumeValueLabel: HTMLElement | null = null;
  private volumeMuteButton: HTMLButtonElement | null = null;
  private volumeDownButton: HTMLButtonElement | null = null;
  private volumeUpButton: HTMLButtonElement | null = null;
  private volumeBusy = false;
  private outputValueLabel: HTMLElement | null = null;
  private outputButtons: Map<string, HTMLButtonElement> = new Map();
  private outputBusy = false;

  constructor(
    private readonly tvPlaybackManager: TvPlaybackManager,
    private readonly audioOutputManager: AudioOutputManager,
  ) {
    if (!tvPlaybackManager) {
      throw new Error('[Settings] TvPlaybackManager is required');
    }
    if (!audioOutputManager) {
      throw new Error('[Settings] AudioOutputManager is required');
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
    element.appendChild(this.renderTvCard());
    element.appendChild(this.renderAudioCard());
    while (targetElement.firstChild) {
      targetElement.removeChild(targetElement.firstChild);
    }
    targetElement.appendChild(element);
    void this.refreshAll();
    return element;
  }

  public async onActivate(): Promise<void> {
    console.log('⚙️ [Settings] activated, refreshing state');
    await this.refreshAll();
  }

  public dispose(): void {
    this.tvStatusLabel = null;
    this.tvToggleButton = null;
    this.volumeSlider = null;
    this.volumeValueLabel = null;
    this.volumeMuteButton = null;
    this.volumeDownButton = null;
    this.volumeUpButton = null;
    this.outputValueLabel = null;
    this.outputButtons.clear();
  }

  private renderTvCard(): HTMLElement {
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
    icon.innerHTML = this.svgTv(48);
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
      void this.handleTvToggle();
    });
    tvCard.append(icon, tvTitle, this.tvStatusLabel, this.tvToggleButton);
    return tvCard;
  }

  private renderAudioCard(): HTMLElement {
    const audioCard = document.createElement('div');
    audioCard.style.cssText = `
      background: var(--bg1);
      border: 1px solid var(--bg3);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 480px;
      width: 100%;
    `;
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:12px;';
    const audioIcon = document.createElement('div');
    audioIcon.style.cssText = 'color:var(--yellow);display:flex;';
    audioIcon.innerHTML = this.svgVolumeUp(20);
    const audioTitle = document.createElement('div');
    audioTitle.textContent = 'Звук';
    audioTitle.style.cssText =
      'color:var(--fg0);font-size:18px;font-weight:600;';
    header.append(audioIcon, audioTitle);
    audioCard.appendChild(header);
    audioCard.appendChild(this.renderVolumeRow());
    audioCard.appendChild(this.renderMuteRow());
    audioCard.appendChild(this.renderOutputRow());
    this.updateMuteButton();
    this.updateOutputButtons();
    return audioCard;
  }

  private renderVolumeRow(): HTMLElement {
    const volumeRow = document.createElement('div');
    volumeRow.style.cssText = 'display:flex;align-items:center;gap:12px;';
    this.volumeDownButton = document.createElement('button');
    this.volumeDownButton.style.cssText = `
      width:36px;height:36px;border-radius:50%;
      background:var(--bg2);border:1px solid var(--bg3);
      color:var(--fg1);cursor:pointer;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
    `;
    this.volumeDownButton.innerHTML = this.svgVolumeDown(16);
    this.volumeDownButton.addEventListener('click', () => {
      void this.handleAdjustVolume(-5);
    });
    this.volumeSlider = document.createElement('input');
    this.volumeSlider.type = 'range';
    this.volumeSlider.min = '0';
    this.volumeSlider.max = '100';
    this.volumeSlider.step = '1';
    this.volumeSlider.value = String(this.audioOutputManager.getVolume());
    this.volumeSlider.style.cssText = `
      flex:1;height:4px;accent-color:var(--yellow);cursor:pointer;
    `;
    this.volumeSlider.addEventListener('input', () => {
      if (this.volumeValueLabel && this.volumeSlider) {
        this.volumeValueLabel.textContent = `${this.volumeSlider.value}%`;
      }
    });
    this.volumeSlider.addEventListener('change', () => {
      void this.handleSetVolume(Number(this.volumeSlider?.value ?? 0));
    });
    this.volumeUpButton = document.createElement('button');
    this.volumeUpButton.style.cssText = this.volumeDownButton.style.cssText;
    this.volumeUpButton.innerHTML = this.svgVolumeUp(16);
    this.volumeUpButton.addEventListener('click', () => {
      void this.handleAdjustVolume(5);
    });
    this.volumeValueLabel = document.createElement('span');
    this.volumeValueLabel.textContent = `${this.audioOutputManager.getVolume()}%`;
    this.volumeValueLabel.style.cssText = `
      min-width:48px;text-align:right;font-family:monospace;
      color:var(--yellow);font-weight:600;
    `;
    volumeRow.append(
      this.volumeDownButton,
      this.volumeSlider,
      this.volumeUpButton,
      this.volumeValueLabel,
    );
    return volumeRow;
  }

  private renderMuteRow(): HTMLElement {
    const muteRow = document.createElement('div');
    muteRow.style.cssText = 'display:flex;align-items:center;gap:12px;';
    this.volumeMuteButton = document.createElement('button');
    this.volumeMuteButton.style.cssText = `
      padding:8px 16px;border-radius:8px;
      background:var(--bg2);border:1px solid var(--bg3);
      color:var(--fg1);cursor:pointer;
      display:flex;align-items:center;gap:8px;font-size:0.9rem;
    `;
    this.volumeMuteButton.addEventListener('click', () => {
      void this.handleToggleMute();
    });
    muteRow.appendChild(this.volumeMuteButton);
    return muteRow;
  }

  private renderOutputRow(): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText = `
      display:flex;align-items:center;gap:12px;
      padding-top:12px;border-top:1px solid var(--bg3);
      flex-wrap:wrap;
    `;
    const label = document.createElement('span');
    label.style.cssText = 'font-size:0.85rem;color:var(--fg3);';
    label.textContent = 'Выход:';
    row.appendChild(label);
    this.outputValueLabel = document.createElement('span');
    this.outputValueLabel.style.cssText =
      'font-size:0.85rem;color:var(--fg1);margin-right:8px;';
    row.appendChild(this.outputValueLabel);
    const available = this.audioOutputManager.getAvailableOutputs();
    available.forEach((key) => {
      const btn = document.createElement('button');
      btn.dataset.output = key;
      btn.textContent = this.formatOutputName(key);
      btn.style.cssText = `
        padding:6px 14px;border-radius:8px;
        background:var(--bg2);border:1px solid var(--bg3);
        color:var(--fg2);cursor:pointer;font-size:0.85rem;
        transition:all 0.2s;
      `;
      btn.addEventListener('click', () => {
        void this.handleSwitchOutput(key);
      });
      this.outputButtons.set(key, btn);
      row.appendChild(btn);
    });
    return row;
  }

  private async refreshAll(): Promise<void> {
    await Promise.all([this.handleTvRefresh(), this.handleAudioRefresh()]);
  }

  private async handleTvRefresh(): Promise<void> {
    try {
      await this.tvPlaybackManager.refreshState();
    } finally {
      this.updateTvUi();
    }
  }

  private async handleAudioRefresh(): Promise<void> {
    try {
      await this.audioOutputManager.refreshState();
      this.updateAudioUi();
    } catch (error) {
      console.warn('[Settings] audio refresh failed:', error);
    }
  }

  private async handleTvToggle(): Promise<void> {
    if (this.tvBusy) return;
    this.tvBusy = true;
    this.updateTvUi();
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
      this.tvBusy = false;
      this.updateTvUi();
    }
  }

  private async handleSetVolume(value: number): Promise<void> {
    if (this.volumeBusy) return;
    this.volumeBusy = true;
    try {
      const ok = await this.audioOutputManager.setVolume(value);
      if (!ok) {
        ToastService.getInstance().show(
          'Не удалось изменить громкость',
          'error',
        );
      }
      this.updateAudioUi();
    } finally {
      this.volumeBusy = false;
    }
  }

  private async handleAdjustVolume(delta: number): Promise<void> {
    if (this.volumeBusy) return;
    const next = Math.max(
      0,
      Math.min(100, this.audioOutputManager.getVolume() + delta),
    );
    if (this.volumeSlider) this.volumeSlider.value = String(next);
    if (this.volumeValueLabel) {
      this.volumeValueLabel.textContent = `${next}%`;
    }
    await this.handleSetVolume(next);
  }

  private async handleToggleMute(): Promise<void> {
    if (this.volumeBusy) return;
    this.volumeBusy = true;
    try {
      const ok = await this.audioOutputManager.toggleMute();
      if (!ok) {
        ToastService.getInstance().show('Не удалось переключить mute', 'error');
      }
      this.updateMuteButton();
    } finally {
      this.volumeBusy = false;
    }
  }

  private async handleSwitchOutput(target: string): Promise<void> {
    if (this.outputBusy) return;
    const current = this.audioOutputManager.getCurrentOutput();
    if (target === current) return;
    this.outputBusy = true;
    this.updateOutputButtons();
    try {
      const ok = await this.audioOutputManager.setOutput(target);
      if (ok) {
        ToastService.getInstance().show(
          target === 'headphones'
            ? 'Переключено на наушники'
            : 'Переключено на динамики',
          'success',
        );
      } else {
        ToastService.getInstance().show(
          'Не удалось переключить выход',
          'error',
        );
      }
      this.updateAudioUi();
    } finally {
      this.outputBusy = false;
      this.updateOutputButtons();
    }
  }

  private updateTvUi(): void {
    const isActive = this.tvPlaybackManager.getIsActive();
    if (this.tvStatusLabel) {
      if (this.tvBusy) {
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
      this.tvToggleButton.disabled = this.tvBusy;
      this.tvToggleButton.textContent = isActive ? 'Выключить' : 'Включить';
      this.tvToggleButton.style.opacity = this.tvBusy ? '0.6' : '1';
      this.tvToggleButton.style.cursor = this.tvBusy ? 'wait' : 'pointer';
    }
  }

  private updateAudioUi(): void {
    const volume = this.audioOutputManager.getVolume();
    if (this.volumeSlider) this.volumeSlider.value = String(volume);
    if (this.volumeValueLabel) {
      this.volumeValueLabel.textContent = `${volume}%`;
    }
    if (this.outputValueLabel) {
      this.outputValueLabel.textContent = this.formatOutputName(
        this.audioOutputManager.getCurrentOutput(),
      );
    }
    this.updateMuteButton();
    this.updateOutputButtons();
  }

  private updateMuteButton(): void {
    if (!this.volumeMuteButton) return;
    const muted = this.audioOutputManager.isMuted();
    this.volumeMuteButton.innerHTML = muted
      ? `${this.svgVolumeMute(16)}<span>Включить звук</span>`
      : `${this.svgVolumeUp(16)}<span>Выключить звук</span>`;
    this.volumeMuteButton.style.borderColor = muted
      ? 'var(--red)'
      : 'var(--bg3)';
    this.volumeMuteButton.style.color = muted ? 'var(--red)' : 'var(--fg1)';
    this.volumeMuteButton.disabled = this.volumeBusy;
    this.volumeMuteButton.style.opacity = this.volumeBusy ? '0.6' : '1';
    this.volumeMuteButton.style.cursor = this.volumeBusy ? 'wait' : 'pointer';
    if (this.volumeDownButton) {
      this.volumeDownButton.disabled = this.volumeBusy;
      this.volumeDownButton.style.opacity = this.volumeBusy ? '0.6' : '1';
    }
    if (this.volumeUpButton) {
      this.volumeUpButton.disabled = this.volumeBusy;
      this.volumeUpButton.style.opacity = this.volumeBusy ? '0.6' : '1';
    }
  }

  private updateOutputButtons(): void {
    const current = this.audioOutputManager.getCurrentOutput();
    this.outputButtons.forEach((btn, key) => {
      const isActive = key === current;
      const disabled = this.outputBusy || key === current;
      btn.disabled = disabled;
      btn.style.background = isActive ? 'var(--yellow)' : 'var(--bg2)';
      btn.style.color = isActive ? 'var(--bg0)' : 'var(--fg2)';
      btn.style.borderColor = isActive ? 'var(--yellow)' : 'var(--bg3)';
      btn.style.opacity = this.outputBusy && !isActive ? '0.6' : '1';
      btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
    });
  }

  private formatOutputName(key: string): string {
    const labels: Record<string, string> = {
      speakers: 'Динамики',
      headphones: 'Наушники',
    };
    return labels[key] ?? key;
  }

  private svgTv(size: number): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="13" rx="2" ry="2"></rect>
      <polyline points="17 2 12 7 7 2"></polyline>
    </svg>`;
  }

  private svgVolumeUp(size: number): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    </svg>`;
  }

  private svgVolumeDown(size: number): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>`;
  }

  private svgVolumeMute(size: number): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>`;
  }
}
