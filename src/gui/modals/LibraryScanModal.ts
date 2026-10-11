import { MusicApiClient } from '../../core/api/MusicApiClient.js';
import { ToastService } from '../components/ToastService.js';

export class LibraryScanModal {
  private container: HTMLElement | null = null;
  private pollTimer: number | null = null;
  private readonly apiClient = new MusicApiClient();

  public open(defaultDirectory: string = '/mnt/media/music'): void {
    if (this.container) return;

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
      cancelBtn.disabled = true;
      status.textContent = 'Запуск сканирования...';

      const started = await this.apiClient.startLibraryScan(dir);
      if (!started) {
        status.textContent = 'Не удалось запустить сканирование.';
        startBtn.disabled = false;
        input.disabled = false;
        cancelBtn.disabled = false;
        return;
      }

      status.textContent = 'Сканирование выполняется...';
      this.pollStatus(status);
    });

    footer.append(cancelBtn, startBtn);
    dialog.append(header, body, input, status, footer);
    this.container.appendChild(dialog);
    document.body.appendChild(this.container);
  }

  private pollStatus(statusEl: HTMLElement): void {
    const tick = async () => {
      const scanning = await this.apiClient.getScanStatus();
      if (!scanning) {
        if (this.pollTimer !== null) {
          window.clearInterval(this.pollTimer);
          this.pollTimer = null;
        }
        statusEl.textContent = 'Сканирование завершено.';
        ToastService.getInstance().show(
          'Медиатека успешно обновлена',
          'success',
        );
        // Дадим пользователю увидеть финальный статус и закроем.
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 800);
        return;
      }
      statusEl.textContent = 'Сканирование выполняется...';
    };
    void tick();
    this.pollTimer = window.setInterval(tick, 1500);
  }

  public close(): void {
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
