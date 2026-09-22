export class PlayerMetadata {
    constructor() {
        this.trackNameElement = null;
        this.trackArtistElement = null;
        this.previewArtElement = null;
        this.artImageElement = null;
    }
    update(mediaTitle, mediaArtist, playbackType, albumName) {
        if (this.trackNameElement) {
            this.trackNameElement.textContent = mediaTitle;
        }
        if (this.trackArtistElement) {
            this.trackArtistElement.textContent = mediaArtist;
        }
        if (this.previewArtElement && this.artImageElement) {
            if (playbackType === 'video') {
                this.artImageElement.style.display = 'none';
                this.previewArtElement.querySelector('svg')?.remove();
                this.previewArtElement.insertAdjacentHTML('afterbegin', `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="var(--yellow)" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        `);
            }
            else if (playbackType === 'music' && albumName && mediaArtist) {
                this.previewArtElement.querySelector('svg')?.remove();
                const musicStore = window.app?.musicStore;
                if (musicStore) {
                    musicStore
                        .getAlbumArtBlob(albumName, mediaArtist)
                        .then((blob) => {
                        if (blob && blob.size > 0 && this.artImageElement) {
                            const forcedBlob = new Blob([blob], { type: 'image/jpeg' });
                            const objectUrl = URL.createObjectURL(forcedBlob);
                            if (this.artImageElement.src.startsWith('blob:')) {
                                URL.revokeObjectURL(this.artImageElement.src);
                            }
                            this.artImageElement.src = objectUrl;
                            this.artImageElement.style.display = 'block';
                        }
                        else {
                            this.setDefaultMusicSvg();
                        }
                    })
                        .catch(() => {
                        this.setDefaultMusicSvg();
                    });
                }
                else {
                    this.setDefaultMusicSvg();
                }
            }
            else {
                this.setDefaultMusicSvg();
            }
        }
    }
    setDefaultMusicSvg() {
        if (!this.previewArtElement || !this.artImageElement)
            return;
        this.artImageElement.style.display = 'none';
        this.previewArtElement.querySelector('svg')?.remove();
        this.previewArtElement.insertAdjacentHTML('afterbegin', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="var(--yellow)" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `);
    }
    render() {
        const metadataContainer = document.createElement('div');
        metadataContainer.className = 'universal-bottom-player-info';
        this.previewArtElement = document.createElement('div');
        this.previewArtElement.className = 'universal-bottom-player-preview';
        this.artImageElement = document.createElement('img');
        this.artImageElement.style.width = '100%';
        this.artImageElement.style.height = '100%';
        this.artImageElement.style.objectFit = 'cover';
        this.artImageElement.style.display = 'none';
        this.artImageElement.className = 'player-dynamic-art-img';
        this.previewArtElement.appendChild(this.artImageElement);
        this.previewArtElement.insertAdjacentHTML('beforeend', `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="var(--yellow)" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `);
        metadataContainer.appendChild(this.previewArtElement);
        const trackInfoContainer = document.createElement('div');
        trackInfoContainer.className = 'universal-bottom-player-track-info';
        this.trackNameElement = document.createElement('div');
        this.trackNameElement.className = 'universal-bottom-player-track-name';
        this.trackNameElement.textContent = 'Нет трека';
        trackInfoContainer.appendChild(this.trackNameElement);
        this.trackArtistElement = document.createElement('div');
        this.trackArtistElement.className = 'universal-bottom-player-track-artist';
        this.trackArtistElement.textContent = '—';
        trackInfoContainer.appendChild(this.trackArtistElement);
        metadataContainer.appendChild(trackInfoContainer);
        return metadataContainer;
    }
}
//# sourceMappingURL=PlayerMetadata.js.map