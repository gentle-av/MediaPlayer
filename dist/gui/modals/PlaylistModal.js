export class PlaylistModal {
    constructor(playlistTracks, playbackManager, playlistStore) {
        this.playlistTracks = playlistTracks;
        this.playbackManager = playbackManager;
        this.playlistStore = playlistStore;
        this.modalElement = null;
        this.draggedRow = null;
    }
    open() {
        this.close();
        this.modalElement = document.createElement('div');
        this.modalElement.className =
            'modal active album-details-modal playlist-modal-custom';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
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
    close() {
        const existingModal = document.querySelector('.playlist-modal-custom');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        this.modalElement = null;
    }
    createHeader() {
        const headerElement = document.createElement('div');
        headerElement.className = 'modal-header album-modal-custom-header';
        const leftIconContainer = document.createElement('div');
        leftIconContainer.className = 'album-modal-cover-left';
        leftIconContainer.innerHTML = `
      <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--yellow)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    `;
        const rightInfoContainer = document.createElement('div');
        rightInfoContainer.className = 'album-modal-info-right';
        const titleElement = document.createElement('div');
        titleElement.className = 'album-modal-artist-name';
        titleElement.textContent = 'Текущий плейлист';
        const countElement = document.createElement('div');
        countElement.className = 'album-modal-album-title';
        countElement.textContent = `${this.playlistTracks.length} композиций`;
        rightInfoContainer.append(titleElement, countElement);
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.close());
        headerElement.append(leftIconContainer, rightInfoContainer, closeButton);
        return headerElement;
    }
    createBody() {
        const bodyElement = document.createElement('div');
        bodyElement.className = 'modal-body';
        const tableContainer = document.createElement('div');
        tableContainer.className =
            'album-tracks-table playlist-tracks-grouped-table';
        const tracksByArtist = this.groupTracksByArtist(this.playlistTracks);
        let globalIndex = 0;
        tracksByArtist.forEach((tracks, artist) => {
            const artistHeaderRow = document.createElement('div');
            artistHeaderRow.className = 'playlist-artist-group-header';
            artistHeaderRow.textContent = artist;
            tableContainer.appendChild(artistHeaderRow);
            tracks.forEach((track) => {
                const row = document.createElement('div');
                row.className = 'track-table-row';
                row.draggable = true;
                row.dataset.index = String(globalIndex);
                const leftSection = document.createElement('div');
                leftSection.className = 'track-row-left';
                const dragMarker = document.createElement('span');
                dragMarker.className = 'track-drag-marker';
                dragMarker.innerHTML = `
<svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
  <circle cx="9" cy="5" r="1"></circle> <circle cx="15" cy="5" r="1"></circle>
  <circle cx="9" cy="12" r="1"></circle> <circle cx="15" cy="12" r="1"></circle>
  <circle cx="9" cy="19" r="1"></circle> <circle cx="15" cy="19" r="1"></circle>
</svg>
        `;
                const numberElement = document.createElement('span');
                numberElement.className = 'track-table-number';
                numberElement.textContent = String(globalIndex + 1);
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
                globalIndex++;
            });
        });
        bodyElement.appendChild(tableContainer);
        return bodyElement;
    }
    createFooter() {
        const footerElement = document.createElement('div');
        footerElement.className = 'modal-album-actions album-modal-custom-footer';
        const playAllBtn = document.createElement('button');
        playAllBtn.className = 'modal-play-btn';
        playAllBtn.innerHTML =
            '<i class="fas fa-play"></i> <span>Слушать плейлист</span>';
        playAllBtn.addEventListener('click', () => {
            if (this.playlistTracks.length > 0) {
                this.playbackManager.playMusic(this.playlistTracks[0]);
            }
        });
        const clearAllBtn = document.createElement('button');
        clearAllBtn.className = 'modal-delete-album-btn';
        clearAllBtn.innerHTML =
            '<i class="fas fa-minus-circle"></i> <span>Очистить</span>';
        clearAllBtn.style.setProperty('background', 'var(--red)', 'important');
        clearAllBtn.style.setProperty('color', 'var(--bg0)', 'important');
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Очистить текущий список воспроизведения?')) {
                this.playlistTracks.length = 0;
                this.close();
            }
        });
        footerElement.append(playAllBtn, clearAllBtn);
        return footerElement;
    }
    groupTracksByArtist(tracks) {
        const map = new Map();
        tracks.forEach((track) => {
            const artist = track.artist || 'Unknown Artist';
            if (!map.has(artist)) {
                map.set(artist, []);
            }
            map.get(artist).push(track);
        });
        return map;
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
            const [movedTrack] = this.playlistTracks.splice(fromIndex, 1);
            this.playlistTracks.splice(toIndex, 0, movedTrack);
            const parent = container.parentNode;
            if (parent) {
                parent.replaceChildren(this.createBody().firstChild);
            }
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
//# sourceMappingURL=PlaylistModal.js.map