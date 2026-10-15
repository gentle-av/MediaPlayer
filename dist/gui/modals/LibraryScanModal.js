import { MusicApiClient } from '../../core/api/MusicApiClient.js';
import { ToastService } from '../components/ToastService.js';
export class LibraryScanModal {
    constructor() {
        this.container = null;
        this.pollTimer = null;
        this.apiClient = new MusicApiClient();
    }
    open(defaultDirectory = '/mnt/media/music') {
        if (this.container)
            return;
        this.container = document.createElement('div');
        this.container.className = 'dynamic-confirm-modal-overlay';
        const dialog = document.createElement('div');
        dialog.className = 'dynamic-confirm-dialog-panel library-scan-dialog';
        const header = document.createElement('h3');
        header.className = 'dynamic-confirm-header-warning';
        header.textContent = 'Сканирование медиатеки';
        const body = document.createElement('p');
        body.className = 'dynamic-confirm-body-text';
        body.textContent =
            'Укажите директорию с музыкой. Все поддерживаемые аудиофайлы будут проиндексированы, а отсутствующие — удалены из базы.';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'library-scan-input';
        input.value = defaultDirectory;
        input.placeholder = '/путь/к/музыке';
        const status = document.createElement('div');
        status.className = 'library-scan-status';
        status.textContent = '';
        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'library-scan-progress';
        const progressFill = document.createElement('div');
        progressFill.className = 'library-scan-progress-fill';
        progressFill.style.width = '0%';
        progressWrapper.appendChild(progressFill);
        const footer = document.createElement('div');
        footer.className = 'dynamic-confirm-footer-actions';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'dynamic-confirm-btn-cancel';
        cancelBtn.textContent = 'Отмена';
        cancelBtn.addEventListener('click', () => this.close());
        const startBtn = document.createElement('button');
        startBtn.className = 'dynamic-confirm-btn-confirm';
        startBtn.style.setProperty('--confirm-btn-bg', 'var(--yellow)');
        startBtn.style.setProperty('--confirm-btn-hover-bg', 'var(--orange)');
        startBtn.textContent = 'Запустить';
        startBtn.addEventListener('click', async () => {
            const dir = input.value.trim();
            if (!dir) {
                ToastService.getInstance().show('Укажите директорию', 'error');
                return;
            }
            startBtn.disabled = true;
            input.disabled = true;
            cancelBtn.style.display = 'none';
            status.textContent = 'Запуск сканирования...';
            const started = await this.apiClient.startLibraryScan(dir);
            if (!started) {
                status.textContent = 'Не удалось запустить сканирование.';
                startBtn.disabled = false;
                input.disabled = false;
                cancelBtn.style.display = '';
                return;
            }
            status.textContent = 'Сканирование выполняется...';
            this.pollStatus(status, progressFill);
        });
        footer.append(cancelBtn, startBtn);
        dialog.append(header, body, input, progressWrapper, status, footer);
        this.container.appendChild(dialog);
        document.body.appendChild(this.container);
    }
    pollStatus(statusEl, progressEl) {
        const tick = async () => {
            const state = await this.apiClient.getScanStatus();
            if (!state) {
                return;
            }
            if (state.scanning) {
                statusEl.textContent = `Сканирование выполняется... ${state.processed} / ${state.total}`;
                progressEl.style.width = `${Math.min(100, Math.max(0, state.progress))}%`;
                return;
            }
            if (this.pollTimer !== null) {
                window.clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
            progressEl.style.width = '100%';
            if (state.scanResult === 'ok') {
                statusEl.textContent = `Сканирование завершено. Обработано файлов: ${state.processed}`;
                ToastService.getInstance().show('Медиатека успешно обновлена', 'success');
            }
            else {
                statusEl.textContent = 'Сканирование завершилось с ошибкой.';
                ToastService.getInstance().show('Ошибка сканирования медиатеки', 'error');
            }
            setTimeout(() => {
                this.close();
                window.location.reload();
            }, 1500);
        };
        void tick();
        this.pollTimer = window.setInterval(tick, 1500);
    }
    close() {
        if (this.pollTimer !== null) {
            window.clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
    }
}
//# sourceMappingURL=LibraryScanModal.js.map