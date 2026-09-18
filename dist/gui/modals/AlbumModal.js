import { AlbumControlsPanel } from '../components/AlbumControlsPanel.js';
export class AlbumModal {
    constructor(albumName, artistName, albumTracks, playbackManager, musicStore, playlistStore) {
        this.albumName = albumName;
        this.artistName = artistName;
        this.albumTracks = albumTracks;
        this.playbackManager = playbackManager;
        this.musicStore = musicStore;
        this.playlistStore = playlistStore;
        this.modalElement = null;
        this.draggedRow = null;
    }
    open() {
        this.close();
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal active album-details-modal';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        const header = this.createHeader();
        const body = this.createBody();
        const controlsPanel = new AlbumControlsPanel(this.albumTracks, this.playbackManager, this.playlistStore, this.musicStore, () => this.close());
        const footer = controlsPanel.render();
        modalContent.append(header, body, footer);
        this.modalElement.appendChild(modalContent);
        document.body.appendChild(this.modalElement);
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.close();
            }
        });
    }
    close() {
        const existingModal = document.querySelector('.album-details-modal');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        this.modalElement = null;
    }
    createHeader() {
        const headerElement = document.createElement('div');
        headerElement.className = 'modal-header album-modal-custom-header';
        const coverContainer = document.createElement('div');
        coverContainer.className = 'album-modal-cover-left';
        const placeholderIcon = document.createElement('div');
        placeholderIcon.className = 'album-modal-cover-placeholder';
        placeholderIcon.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `;
        coverContainer.appendChild(placeholderIcon);
        if (this.albumName && this.artistName) {
            const imgElement = document.createElement('img');
            imgElement.className = 'album-modal-dynamic-cover-img';
            this.musicStore
                .getAlbumArtBlob(this.albumName, this.artistName)
                .then((blob) => {
                if (blob && blob.size > 0) {
                    const forcedBlob = new Blob([blob], { type: 'image/jpeg' });
                    const url = URL.createObjectURL(forcedBlob);
                    imgElement.src = url;
                    placeholderIcon.style.display = 'none';
                    imgElement.style.display = 'block';
                }
            })
                .catch(() => { });
            coverContainer.appendChild(imgElement);
        }
        const rightInfoContainer = document.createElement('div');
        rightInfoContainer.className = 'album-modal-info-right';
        const artistElement = document.createElement('div');
        artistElement.className = 'album-modal-artist-name';
        artistElement.textContent = this.artistName || 'Unknown Artist';
        const albumElement = document.createElement('div');
        albumElement.className = 'album-modal-album-title';
        albumElement.textContent = this.albumName || 'Unknown Album';
        rightInfoContainer.append(artistElement, albumElement);
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.close());
        headerElement.append(coverContainer, rightInfoContainer, closeButton);
        return headerElement;
    }
    createBody() {
        const bodyElement = document.createElement('div');
        bodyElement.className = 'modal-body';
        const tableContainer = document.createElement('div');
        tableContainer.className = 'album-tracks-table';
        this.albumTracks.forEach((track, index) => {
            const row = document.createElement('div');
            row.className = 'track-table-row';
            row.draggable = true;
            row.dataset.index = String(index);
            const leftSection = document.createElement('div');
            leftSection.className = 'track-row-left';
            const dragMarker = document.createElement('span');
            dragMarker.className = 'track-drag-marker';
            dragMarker.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="5" r="1"></circle> <circle cx="15" cy="5" r="1"></circle>
          <circle cx="9" cy="12" r="1"></circle> <circle cx="15" cy="12" r="1"></circle>
          <circle cx="9" cy="19" r="1"></circle> <circle cx="15" cy="19" r="1"></circle>
        </svg>
      `;
            const numberElement = document.createElement('span');
            numberElement.className = 'track-table-number';
            numberElement.textContent = String(track.track || index + 1);
            const nameElement = document.createElement('span');
            nameElement.className = 'track-table-name';
            nameElement.textContent = track.title || 'Unknown Track';
            leftSection.append(dragMarker, numberElement, nameElement);
            const rightSection = document.createElement('div');
            rightSection.className = 'track-row-right';
            const durationElement = document.createElement('span');
            durationElement.className = 'track-table-duration';
            durationElement.textContent = this.formatTime(track.duration);
            rightSection.appendChild(durationElement);
            row.append(leftSection, rightSection);
            row.addEventListener('click', (e) => {
                if (e.target.closest('.track-drag-marker'))
                    return;
                this.playbackManager.playMusic(track);
            });
            this.setupDragAndDropEvents(row, tableContainer);
            tableContainer.appendChild(row);
        });
        bodyElement.appendChild(tableContainer);
        return bodyElement;
    }
    setupDragAndDropEvents(row, container) {
        row.addEventListener('dragstart', (e) => {
            this.draggedRow = row;
            row.classList.add('dragging');
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        row.addEventListener('dragend', () => {
            if (this.draggedRow) {
                this.draggedRow.classList.remove('dragging');
                this.draggedRow = null;
            }
            container.querySelectorAll('.track-table-row').forEach((r) => {
                r.classList.remove('drag-over-above', 'drag-over-below');
            });
        });
        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!this.draggedRow || this.draggedRow === row)
                return;
            const bounding = row.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            if (offset < bounding.height / 2) {
                row.classList.add('drag-over-above');
                row.classList.remove('drag-over-below');
            }
            else {
                row.classList.add('drag-over-below');
                row.classList.remove('drag-over-above');
            }
        });
        row.addEventListener('dragleave', () => {
            row.classList.remove('drag-over-above', 'drag-over-below');
        });
        row.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!this.draggedRow || this.draggedRow === row)
                return;
            const bounding = row.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            const fromIndex = parseInt(this.draggedRow.dataset.index);
            let toIndex = parseInt(row.dataset.index);
            if (offset >= bounding.height / 2) {
                toIndex += 1;
            }
            if (fromIndex < toIndex) {
                toIndex -= 1;
            }
            const [movedTrack] = this.albumTracks.splice(fromIndex, 1);
            this.albumTracks.splice(toIndex, 0, movedTrack);
            if (offset < bounding.height / 2) {
                container.insertBefore(this.draggedRow, row);
            }
            else {
                container.insertBefore(this.draggedRow, row.nextSibling);
            }
            const allRows = container.querySelectorAll('.track-table-row');
            allRows.forEach((r, idx) => {
                const rowElement = r;
                rowElement.dataset.index = String(idx);
                const numberSpan = rowElement.querySelector('.track-table-number');
                if (numberSpan) {
                    const trackObj = this.albumTracks[idx];
                    numberSpan.textContent = String(trackObj.track || idx + 1);
                }
            });
        });
    }
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return '0:00';
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}
//# sourceMappingURL=AlbumModal.js.map