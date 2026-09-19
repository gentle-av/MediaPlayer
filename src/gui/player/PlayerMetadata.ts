export class PlayerMetadata {
  private trackNameElement: HTMLElement | null = null;
  private trackArtistElement: HTMLElement | null = null;
  private previewArtElement: HTMLElement | null = null;

  public update(
    mediaTitle: string,
    mediaArtist: string,
    playbackType?: 'music' | 'video',
  ): void {
    if (this.trackNameElement) {
      this.trackNameElement.textContent = mediaTitle;
    }
    if (this.trackArtistElement) {
      this.trackArtistElement.textContent = mediaArtist;
    }
    if (this.previewArtElement) {
      if (playbackType === 'video') {
        this.previewArtElement.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="var(--yellow)" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        `;
      } else {
        this.previewArtElement.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="var(--yellow)" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        `;
      }
    }
  }

  public render(): HTMLElement {
    const metadataContainer = document.createElement('div');
    metadataContainer.className = 'universal-bottom-player-info';
    this.previewArtElement = document.createElement('div');
    this.previewArtElement.className = 'universal-bottom-player-preview';
    this.previewArtElement.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="var(--yellow)" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    `;
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
