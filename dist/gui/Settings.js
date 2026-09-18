import { ToastService } from './components/ToastService.js';
export class Settings {
    constructor(tvPlaybackManager, audioOutputManager) {
        this.tvPlaybackManager = tvPlaybackManager;
        this.audioOutputManager = audioOutputManager;
        this.tvStatusLabel = null;
        this.tvToggleButton = null;
        this.tvBusy = false;
        this.volumeSlider = null;
        this.volumeValueLabel = null;
        this.volumeMuteButton = null;
        this.volumeDownButton = null;
        this.volumeUpButton = null;
        this.volumeBusy = false;
        this.outputValueLabel = null;
        this.outputButtons = new Map();
        this.outputBusy = false;
        if (!tvPlaybackManager) {
            throw new Error('[Settings] TvPlaybackManager is required');
        }
        if (!audioOutputManager) {
            throw new Error('[Settings] AudioOutputManager is required');
        }
    }
    async render(targetElement) {
        if (!targetElement)
            return null;
        const element = document.createElement('div');
        element.className = 'settings-page';
        const title = document.createElement('h2');
        title.textContent = 'Настройки';
        element.appendChild(title);
        const cardsGrid = document.createElement('div');
        cardsGrid.className = 'settings-cards-grid';
        cardsGrid.appendChild(this.renderTvCard());
        cardsGrid.appendChild(this.renderAudioCard());
        element.appendChild(cardsGrid);
        while (targetElement.firstChild) {
            targetElement.removeChild(targetElement.firstChild);
        }
        targetElement.appendChild(element);
        void this.refreshAll();
        return element;
    }
    renderTvCard() {
        const tvCard = document.createElement('div');
        tvCard.className = 'settings-tv-card';
        const iconContainer = document.createElement('div');
        iconContainer.className = 'settings-tv-icon';
        iconContainer.innerHTML = this.svgTv(48);
        const tvTitle = document.createElement('div');
        tvTitle.className = 'settings-tv-title';
        tvTitle.textContent = 'Телевизор';
        this.tvStatusLabel = document.createElement('div');
        this.tvStatusLabel.className = 'settings-tv-status';
        this.tvToggleButton = document.createElement('button');
        this.tvToggleButton.className = 'settings-tv-toggle-btn';
        this.tvToggleButton.addEventListener('click', () => {
            void this.handleTvToggle();
        });
        tvCard.append(iconContainer, tvTitle, this.tvStatusLabel, this.tvToggleButton);
        return tvCard;
    }
    async onActivate() {
        console.log('⚙️ [Settings] activated, refreshing state');
        await this.refreshAll();
    }
    dispose() {
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
    renderAudioCard() {
        const audioCard = document.createElement('div');
        audioCard.className = 'settings-audio-card';
        const header = document.createElement('div');
        header.className = 'settings-audio-header';
        const audioIcon = document.createElement('div');
        audioIcon.className = 'settings-audio-icon';
        audioIcon.innerHTML = this.svgVolumeUp(20);
        const audioTitle = document.createElement('div');
        audioTitle.className = 'settings-audio-title';
        audioTitle.textContent = 'Звук';
        header.append(audioIcon, audioTitle);
        audioCard.appendChild(header);
        audioCard.appendChild(this.renderVolumeRow());
        audioCard.appendChild(this.renderMuteRow());
        audioCard.appendChild(this.renderOutputRow());
        this.updateMuteButton();
        this.updateOutputButtons();
        return audioCard;
    }
    renderVolumeRow() {
        const volumeRow = document.createElement('div');
        volumeRow.className = 'settings-volume-row';
        this.volumeDownButton = document.createElement('button');
        this.volumeDownButton.className = 'settings-volume-down-btn';
        this.volumeDownButton.innerHTML = this.svgVolumeDown(16);
        this.volumeDownButton.addEventListener('click', () => {
            void this.handleAdjustVolume(-1);
        });
        this.volumeSlider = document.createElement('input');
        this.volumeSlider.type = 'range';
        this.volumeSlider.min = '0';
        this.volumeSlider.max = '100';
        this.volumeSlider.step = '1';
        this.volumeSlider.className = 'settings-volume-slider';
        this.volumeSlider.value = String(this.audioOutputManager.getVolume());
        this.volumeSlider.addEventListener('input', () => {
            if (this.volumeValueLabel && this.volumeSlider) {
                this.volumeValueLabel.textContent = `${this.volumeSlider.value}%`;
            }
        });
        this.volumeSlider.addEventListener('change', () => {
            void this.handleSetVolume(Number(this.volumeSlider?.value ?? 0));
        });
        this.volumeUpButton = document.createElement('button');
        this.volumeUpButton.className = 'settings-volume-up-btn';
        this.volumeUpButton.innerHTML = this.svgVolumeUp(16);
        this.volumeUpButton.addEventListener('click', () => {
            void this.handleAdjustVolume(1);
        });
        this.volumeValueLabel = document.createElement('span');
        this.volumeValueLabel.className = 'settings-volume-label';
        this.volumeValueLabel.textContent = `${this.audioOutputManager.getVolume()}%`;
        volumeRow.append(this.volumeDownButton, this.volumeSlider, this.volumeUpButton, this.volumeValueLabel);
        return volumeRow;
    }
    renderMuteRow() {
        const muteRow = document.createElement('div');
        muteRow.className = 'settings-mute-row';
        this.volumeMuteButton = document.createElement('button');
        this.volumeMuteButton.className = 'settings-mute-btn';
        this.volumeMuteButton.addEventListener('click', () => {
            void this.handleToggleMute();
        });
        muteRow.appendChild(this.volumeMuteButton);
        return muteRow;
    }
    renderOutputRow() {
        const row = document.createElement('div');
        row.className = 'settings-output-row';
        const label = document.createElement('span');
        label.className = 'settings-output-label';
        label.textContent = 'Выход:';
        row.appendChild(label);
        this.outputValueLabel = document.createElement('span');
        this.outputValueLabel.className = 'settings-output-value';
        row.appendChild(this.outputValueLabel);
        const available = this.audioOutputManager.getAvailableOutputs();
        available.forEach((key) => {
            const btn = document.createElement('button');
            btn.dataset.output = key;
            btn.textContent = this.formatOutputName(key);
            btn.className = 'settings-output-btn';
            btn.addEventListener('click', () => {
                void this.handleSwitchOutput(key);
            });
            this.outputButtons.set(key, btn);
            row.appendChild(btn);
        });
        return row;
    }
    async refreshAll() {
        await Promise.all([this.handleTvRefresh(), this.handleAudioRefresh()]);
    }
    async handleTvRefresh() {
        try {
            await this.tvPlaybackManager.refreshState();
        }
        finally {
            this.updateTvUi();
        }
    }
    async handleAudioRefresh() {
        try {
            await this.audioOutputManager.refreshState();
            this.updateAudioUi();
        }
        catch (error) {
            console.warn('[Settings] audio refresh failed:', error);
        }
    }
    async handleTvToggle() {
        if (this.tvBusy)
            return;
        this.tvBusy = true;
        this.updateTvUi();
        try {
            const isActive = this.tvPlaybackManager.getIsActive();
            const success = isActive
                ? await this.tvPlaybackManager.turnOff()
                : await this.tvPlaybackManager.turnOn();
            if (success) {
                ToastService.getInstance().show(isActive ? 'Телевизор выключен' : 'Телевизор включён', 'success');
            }
            else {
                ToastService.getInstance().show('Не удалось изменить состояние телевизора', 'error');
            }
        }
        finally {
            this.tvBusy = false;
            this.updateTvUi();
        }
    }
    async handleSetVolume(value) {
        if (this.volumeBusy)
            return;
        this.volumeBusy = true;
        try {
            const ok = await this.audioOutputManager.setVolume(value);
            if (!ok) {
                ToastService.getInstance().show('Не удалось изменить громкость', 'error');
            }
            this.updateAudioUi();
        }
        finally {
            this.volumeBusy = false;
        }
    }
    async handleAdjustVolume(delta) {
        if (this.volumeBusy)
            return;
        const next = Math.max(0, Math.min(100, this.audioOutputManager.getVolume() + delta));
        if (this.volumeSlider)
            this.volumeSlider.value = String(next);
        if (this.volumeValueLabel) {
            this.volumeValueLabel.textContent = `${next}%`;
        }
        await this.handleSetVolume(next);
    }
    async handleToggleMute() {
        if (this.volumeBusy)
            return;
        this.volumeBusy = true;
        try {
            const ok = await this.audioOutputManager.toggleMute();
            if (!ok) {
                ToastService.getInstance().show('Не удалось переключить mute', 'error');
            }
            this.updateMuteButton();
        }
        finally {
            this.volumeBusy = false;
        }
    }
    async handleSwitchOutput(target) {
        if (this.outputBusy)
            return;
        const current = this.audioOutputManager.getCurrentOutput();
        if (target === current)
            return;
        this.outputBusy = true;
        this.updateOutputButtons();
        try {
            const ok = await this.audioOutputManager.setOutput(target);
            if (ok) {
                ToastService.getInstance().show(target === 'headphones'
                    ? 'Переключено на наушники'
                    : 'Переключено на динамики', 'success');
            }
            else {
                ToastService.getInstance().show('Не удалось переключить выход', 'error');
            }
            this.updateAudioUi();
        }
        finally {
            this.outputBusy = false;
            this.updateOutputButtons();
        }
    }
    updateTvUi() {
        const isActive = this.tvPlaybackManager.getIsActive();
        if (this.tvStatusLabel) {
            this.tvStatusLabel.textContent = isActive ? 'Включён' : 'Выключен';
        }
        if (this.tvToggleButton) {
            this.tvToggleButton.disabled = this.tvBusy;
            this.tvToggleButton.textContent = isActive ? 'Выключить' : 'Включить';
        }
    }
    updateAudioUi() {
        const volume = this.audioOutputManager.getVolume();
        if (this.volumeSlider)
            this.volumeSlider.value = String(volume);
        if (this.volumeValueLabel) {
            this.volumeValueLabel.textContent = `${volume}%`;
        }
        if (this.outputValueLabel) {
            this.outputValueLabel.textContent = this.formatOutputName(this.audioOutputManager.getCurrentOutput());
        }
        this.updateMuteButton();
        this.updateOutputButtons();
    }
    updateMuteButton() {
        if (!this.volumeMuteButton)
            return;
        const muted = this.audioOutputManager.isMuted();
        this.volumeMuteButton.innerHTML = muted
            ? `${this.svgVolumeMute(16)}<span>Включить звук</span>`
            : `${this.svgVolumeUp(16)}<span>Выключить звук</span>`;
        this.volumeMuteButton.disabled = this.volumeBusy;
        if (this.volumeDownButton) {
            this.volumeDownButton.disabled = this.volumeBusy;
        }
        if (this.volumeUpButton) {
            this.volumeUpButton.disabled = this.volumeBusy;
        }
    }
    updateOutputButtons() {
        const current = this.audioOutputManager.getCurrentOutput();
        this.outputButtons.forEach((btn, key) => {
            btn.disabled = this.outputBusy || key === current;
        });
    }
    formatOutputName(key) {
        const labels = {
            speakers: 'Динамики',
            headphones: 'Наушники',
        };
        return labels[key] ?? key;
    }
    svgTv(size) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="13" rx="2" ry="2"></rect>
      <polyline points="17 2 12 7 7 2"></polyline>
    </svg>`;
    }
    svgVolumeUp(size) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    </svg>`;
    }
    svgVolumeDown(size) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>`;
    }
    svgVolumeMute(size) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>`;
    }
}
//# sourceMappingURL=Settings.js.map