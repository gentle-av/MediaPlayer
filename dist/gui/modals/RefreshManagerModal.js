import { MusicApiClient } from '../../core/api/MusicApiClient.js';
import { ToastService } from '../components/ToastService.js';
export class RefreshManagerModal {
    constructor(musicStore) {
        this.musicStore = musicStore;
        this.modalElement = null;
        this.musicApiClient = new MusicApiClient();
    }
    open() {
        this.close();
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'refresh-confirm-modal';
        const dialog = document.createElement('div');
        dialog.className = 'refresh-confirm-dialog';
        const header = document.createElement('div');
        header.className = 'refresh-confirm-header';
        header.innerHTML =
            '<i class="fas fa-database"></i>' +
                ' <h3>Синхронизация базы метаданных</h3>';
        const body = document.createElement('div');
        body.className = 'refresh-confirm-body';
        body.id = 'refreshManagerModalBody';
        const message = document.createElement('p');
        message.className = 'refresh-confirm-message';
        message.textContent =
            'Вы действительно хотите запустить полное' +
                ' сканирование директории и обновить метаданные треков? ' +
                'Существующий кэш будет перезаписан.';
        body.appendChild(message);
        const actions = document.createElement('div');
        actions.className = 'refresh-confirm-actions';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'refresh-confirm-btn refresh-confirm-cancel';
        cancelBtn.textContent = 'Отмена';
        cancelBtn.addEventListener('click', () => this.close());
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'refresh-confirm-btn refresh-confirm-confirm';
        confirmBtn.textContent = 'Запустить';
        confirmBtn.addEventListener('click', () => this.startScanningProcess());
        actions.append(cancelBtn, confirmBtn);
        dialog.append(header, body, actions);
        this.modalElement.appendChild(dialog);
        document.body.appendChild(this.modalElement);
    }
    close() {
        const existingModal = document.querySelector('.refresh-confirm-modal');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        this.modalElement = null;
    }
    async startScanningProcess() {
        const bodyContainer = document.getElementById('refreshManagerModalBody');
        if (!bodyContainer)
            return;
        bodyContainer.innerHTML = '';
        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'album-library-progress-bar-container';
        const progressFill = document.createElement('div');
        progressFill.className = 'album-library-progress-bar-fill';
        progressFill.style.width = '0%';
        progressWrapper.appendChild(progressFill);
        const statusText = document.createElement('div');
        statusText.className = 'refresh-time-message';
        statusText.textContent = 'Инициализация и очистка отсутствующих файлов...';
        bodyContainer.append(progressWrapper, statusText);
        const actionsContainer = document.querySelector('.refresh-confirm-actions');
        if (actionsContainer) {
            actionsContainer.style.display = 'none';
        }
        try {
            await this.musicApiClient.forceRescan();
            this.pollProgress(progressFill, statusText);
        }
        catch (error) {
            statusText.textContent = 'Ошибка при запуске сканирования базы данных.';
            statusText.className =
                'refresh-time-message album-library-progress-error';
            if (actionsContainer) {
                actionsContainer.style.display = 'flex';
            }
        }
    }
    pollProgress(progressFill, statusLabel) {
        let fakeProgress = 0;
        const intervalId = window.setInterval(async () => {
            fakeProgress += 8;
            if (fakeProgress > 90)
                fakeProgress = 95;
            progressFill.style.width = `${fakeProgress}%`;
            statusLabel.textContent =
                `Идет чтение тегов и генерация кэша...` + ` ${fakeProgress}%`;
            try {
                const stats = await this.musicApiClient.getDatabaseStats();
                if (stats && stats.success) {
                    window.clearInterval(intervalId);
                    progressFill.style.width = '100%';
                    this.showStatistics(stats);
                }
            }
            catch (e) {
                console.warn('Waiting for scan transaction lock release...');
            }
        }, 1200);
    }
    async showStatistics(stats) {
        const bodyContainer = document.getElementById('refreshManagerModalBody');
        if (!bodyContainer)
            return;
        bodyContainer.innerHTML = '';
        const statsGrid = document.createElement('div');
        statsGrid.style.display = 'flex';
        statsGrid.style.flexDirection = 'column';
        statsGrid.style.gap = '8px';
        statsGrid.style.textAlign = 'left';
        statsGrid.style.padding = '10px 0';
        const lines = [
            `📊 Всего просканировано аудиофайлов: ${stats.total_files}`,
            `✅ Успешно проиндексировано с тегами: ${stats.files_with_tags}`,
            `⚠️ Обнаружено файлов без заголовков: ${stats.files_without_title}`,
            `📌 Уникальных исполнителей в библиотеке: ${stats.unique_artists}`,
            `💿 Уникальных музыкальных альбомов: ${stats.unique_albums}`,
            `📈 Покрытие медиатеки метаданными: ${stats.tag_coverage_percent}%`,
        ];
        lines.forEach((line) => {
            const p = document.createElement('p');
            p.className = 'refresh-time-message';
            p.style.margin = '0';
            p.style.fontSize = '0.9rem';
            p.textContent = line;
            statsGrid.appendChild(p);
        });
        bodyContainer.appendChild(statsGrid);
        await this.musicStore.loadTracksFromServer();
        const actionsContainer = document.querySelector('.refresh-confirm-actions');
        if (actionsContainer) {
            actionsContainer.innerHTML = '';
            const closeBtn = document.createElement('button');
            closeBtn.className = 'refresh-confirm-btn refresh-confirm-confirm';
            closeBtn.style.width = '100%';
            closeBtn.textContent = 'Готово';
            closeBtn.addEventListener('click', () => {
                this.close();
                ToastService.getInstance().show('Медиатека успешно синхронизирована', 'success');
            });
            actionsContainer.appendChild(closeBtn);
            actionsContainer.style.display = 'flex';
        }
    }
}
//# sourceMappingURL=RefreshManagerModal.js.map