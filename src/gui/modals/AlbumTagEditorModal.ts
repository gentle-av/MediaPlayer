import { Metadata } from '../../core/entities/music/Metadata.js';
import { MusicStore } from '../../core/store/MusicStore.js';
import { MusicApiClient } from '../../core/api/MusicApiClient.js';
import { ToastService } from '../components/ToastService.js';
import { Config } from '../../core/config/Config.js';

export class AlbumTagEditorModal {
  private modalElement: HTMLElement | null = null;
  private readonly musicApiClient: MusicApiClient;
  private pendingArtData: string | null = null;

  constructor(
    private readonly albumName: string,
    private readonly artistName: string,
    private readonly albumTracks: Metadata[],
    private readonly musicStore: MusicStore,
  ) {
    this.musicApiClient = new MusicApiClient();
  }

  public open(): void {
    this.close();
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'modal active album-tag-editor-modal-custom';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content tag-editor-content-container';
    const header = this.createHeader();
    const body = this.createBody();
    const footer = this.createFooter();
    modalContent.append(header, body, footer);
    this.modalElement.appendChild(modalContent);
    document.body.appendChild(this.modalElement);
    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.close();
      }
    });
  }

  public close(): void {
    const existingModal = document.querySelector(
      '.album-tag-editor-modal-custom',
    );
    if (existingModal && existingModal.parentNode) {
      existingModal.parentNode.removeChild(existingModal);
    }
    this.modalElement = null;
    this.pendingArtData = null;
  }

  private createHeader(): HTMLElement {
    const headerElement = document.createElement('div');
    headerElement.className = 'tag-editor-custom-header';
    const coverContainer = document.createElement('div');
    coverContainer.className = 'tag-editor-cover-left';
    coverContainer.style.cursor = 'pointer';
    const placeholderIcon = document.createElement('div');
    placeholderIcon.className = 'tag-editor-placeholder-icon';
    placeholderIcon.innerHTML = `
      <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--yellow)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `;
    coverContainer.appendChild(placeholderIcon);
    const imgElement = document.createElement('img');
    imgElement.className = 'tag-editor-dynamic-img';
    if (this.albumName && this.artistName) {
      this.musicStore
        .getAlbumArtBlob(this.albumName, this.artistName)
        .then((blob) => {
          if (blob && blob.size > 0) {
            imgElement.src = URL.createObjectURL(blob);
            placeholderIcon.classList.add('hidden-placeholder');
            imgElement.classList.add('visible-img');
          }
        })
        .catch(() => {});
    }
    coverContainer.appendChild(imgElement);
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/gif';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const rawResult = reader.result as string;
        const parts = rawResult.split(',');
        if (parts.length > 1) {
          this.pendingArtData = parts[1];
        }
        imgElement.src = rawResult;
        placeholderIcon.classList.add('hidden-placeholder');
        imgElement.classList.add('visible-img');
      };
      reader.readAsDataURL(file);
    });
    coverContainer.appendChild(fileInput);
    coverContainer.addEventListener('click', () => {
      fileInput.click();
    });
    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'tag-editor-inputs-right';
    const artistField = document.createElement('div');
    artistField.className = 'tag-editor-field-row';
    const artistLabel = document.createElement('label');
    artistLabel.textContent = 'Исполнитель:';
    const artistInput = document.createElement('input');
    artistInput.type = 'text';
    artistInput.id = 'albumTagEditorArtistInput';
    artistInput.className = 'tag-editor-input-artist';
    artistInput.value = this.artistName;
    artistField.append(artistLabel, artistInput);
    const albumField = document.createElement('div');
    albumField.className = 'tag-editor-field-row';
    const albumLabel = document.createElement('label');
    albumLabel.textContent = 'Альбом:';
    const albumInput = document.createElement('input');
    albumInput.type = 'text';
    albumInput.id = 'albumTagEditorAlbumInput';
    albumInput.className = 'tag-editor-input-album';
    albumInput.value = this.albumName;
    albumField.append(albumLabel, albumInput);
    inputsContainer.append(artistField, albumField);
    headerElement.append(coverContainer, inputsContainer);
    return headerElement;
  }

  private createBody(): HTMLElement {
    const bodyElement = document.createElement('div');
    bodyElement.className = 'modal-body tag-editor-custom-body';
    const tableContainer = document.createElement('div');
    tableContainer.className = 'tag-editor-tracks-table';
    tableContainer.id = 'albumTagEditorTracksTableContainer';
    this.albumTracks.forEach((track, index) => {
      const row = document.createElement('div');
      row.className = 'tag-editor-track-row';
      row.dataset.filePath = track.filePath;
      const leftSection = document.createElement('div');
      leftSection.className = 'tag-editor-row-left';
      const numberElement = document.createElement('span');
      numberElement.className = 'tag-editor-track-number';
      numberElement.textContent = String(track.track || index + 1);
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'tag-editor-track-name-input';
      nameInput.value = track.title || '';
      leftSection.append(numberElement, nameInput);
      const rightSection = document.createElement('div');
      rightSection.className = 'tag-editor-row-right';
      const durationElement = document.createElement('span');
      durationElement.className = 'tag-editor-track-duration';
      durationElement.textContent = this.formatTime(track.duration);
      rightSection.appendChild(durationElement);
      row.append(leftSection, rightSection);
      tableContainer.appendChild(row);
    });
    bodyElement.appendChild(tableContainer);
    return bodyElement;
  }

  private createFooter(): HTMLElement {
    const footerElement = document.createElement('div');
    footerElement.className = 'modal-album-actions tag-editor-custom-footer';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-add-btn';
    cancelBtn.innerHTML = '<span>Отмена</span>';
    cancelBtn.addEventListener('click', () => this.close());
    const saveBtn = document.createElement('button');
    saveBtn.className = 'modal-play-btn';
    saveBtn.innerHTML = '<span>Сохранить изменения</span>';
    saveBtn.addEventListener('click', async () => {
      const artistInput = document.getElementById(
        'albumTagEditorArtistInput',
      ) as HTMLInputElement;
      const albumInput = document.getElementById(
        'albumTagEditorAlbumInput',
      ) as HTMLInputElement;
      if (!artistInput || !albumInput) return;
      const newArtist = artistInput.value.trim();
      const newAlbum = albumInput.value.trim();
      const tableContainer = document.getElementById(
        'albumTagEditorTracksTableContainer',
      );
      if (!tableContainer) return;
      const rows = tableContainer.querySelectorAll('.tag-editor-track-row');
      let totalUpdated = 0;
      let failedCount = 0;
      ToastService.getInstance().show('Сохранение тегов...', 'info');
      for (const row of Array.from(rows)) {
        const rowElement = row as HTMLElement;
        const path = rowElement.dataset.filePath;
        const nameInput = rowElement.querySelector(
          '.tag-editor-track-name-input',
        ) as HTMLInputElement;
        const numberSpan = rowElement.querySelector(
          '.track-editor-track-number',
        ) as HTMLElement;
        if (!path || !nameInput || !numberSpan) continue;
        const trackNumber = parseInt(numberSpan.textContent || '0', 10);
        const payload = {
          path: path,
          artist: newArtist,
          album: newAlbum,
          title: nameInput.value.trim(),
          track: isNaN(trackNumber) ? 0 : trackNumber,
        };
        const success = await this.musicApiClient.updateTrackTags(payload);
        if (success) {
          if (this.pendingArtData) {
            await fetch(
              `${Config.getConfig().baseUrl}/api/music/upload-album-art`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  path: path,
                  image_data: this.pendingArtData,
                }),
              },
            );
          }
          totalUpdated++;
        } else {
          failedCount++;
        }
      }
      if (totalUpdated > 0) {
        await this.musicStore.loadTracksFromServer();
        ToastService.getInstance().show(
          `Успешно обновлено тегов: ${totalUpdated}`,
          'success',
        );
      }
      if (failedCount > 0) {
        ToastService.getInstance().show(
          `Не удалось обновить файлов: ${failedCount} (проверьте, что это .flac)`,
          'error',
        );
      }
      this.close();
      const parentModalClose = document.querySelector(
        '.album-details-modal .modal-close',
      ) as HTMLElement;
      if (parentModalClose) {
        parentModalClose.click();
      }
    });
    footerElement.append(cancelBtn, saveBtn);
    return footerElement;
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
