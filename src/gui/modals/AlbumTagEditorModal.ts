import { Metadata } from '../../core/entities/music/Metadata.js';
import { MusicStore } from '../../core/store/MusicStore.js';

export class AlbumTagEditorModal {
  private modalElement: HTMLElement | null = null;

  constructor(
    private readonly albumName: string,
    private readonly artistName: string,
    private readonly albumTracks: Metadata[],
    private readonly musicStore: MusicStore,
  ) {}

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
    const existingModal = document.querySelector('.album-tag-editor-modal-custom');
    if (existingModal && existingModal.parentNode) {
      existingModal.parentNode.removeChild(existingModal);
    }
    this.modalElement = null;
  }

  private createHeader(): HTMLElement {
    const headerElement = document.createElement('div');
    headerElement.className = 'tag-editor-custom-header';
    const coverContainer = document.createElement('div');
    coverContainer.className = 'tag-editor-cover-left';
    const placeholderIcon = document.createElement('div');
    placeholderIcon.className = 'tag-editor-placeholder-icon';
    placeholderIcon.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `;
    coverContainer.appendChild(placeholderIcon);
    if (this.albumName && this.artistName) {
      const imgElement = document.createElement('img');
      imgElement.style.display = 'none';
      this.musicStore
        .getAlbumArtBlob(this.albumName, this.artistName)
        .then((blob) => {
          if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob);
            imgElement.src = url;
            placeholderIcon.style.display = 'none';
            imgElement.style.display = 'block';
          }
        })
        .catch(() => {});
      coverContainer.appendChild(imgElement);
    }
    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'tag-editor-inputs-right';
    const artistField = document.createElement('div');
    artistField.className = 'tag-editor-field-row';
    const artistLabel = document.createElement('label');
    artistLabel.textContent = 'Исполнитель:';
    const artistInput = document.createElement('input');
    artistInput.type = 'text';
    artistInput.className = 'tag-editor-input-artist';
    artistInput.value = this.artistName;
    artistField.append(artistLabel, artistInput);
    const albumField = document.createElement('div');
    albumField.className = 'tag-editor-field-row';
    const albumLabel = document.createElement('label');
    albumLabel.textContent = 'Альбом:';
    const albumInput = document.createElement('input');
    albumInput.type = 'text';
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
    this.albumTracks.forEach((track, index) => {
      const row = document.createElement('div');
      row.className = 'tag-editor-track-row';
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
    saveBtn.addEventListener('click', () => {
      console.log('Сохранение измененных тегов альбома и треков');
      this.close();
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
