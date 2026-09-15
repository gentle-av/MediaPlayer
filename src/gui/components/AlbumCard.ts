import { PlaylistStore } from '../../core/store/PlaylistStore.js';
import { PlaybackManager } from '../../core/player/PlaybackManager.js';
import { Metadata } from '../../core/entities/music/Metadata.js';
import { MusicStore } from '../../core/store/MusicStore.js';
import { AlbumModal } from '../modals/AlbumModal.js';

export class AlbumCard {
  constructor(
    private readonly albumName: string,
    private readonly artistName: string,
    private readonly albumTracks: Metadata[],
    private readonly playbackManager: PlaybackManager,
    private readonly musicStore: MusicStore,
    private readonly playlistStore: PlaylistStore,
  ) {}

  public render(): HTMLElement {
    const cardElement = document.createElement('div');
    cardElement.className = 'album-card';
    const artContainer = document.createElement('div');
    artContainer.className = 'album-card-art';
    const placeholderIcon = document.createElement('div');
    placeholderIcon.className = 'album-card-placeholder';
    placeholderIcon.innerHTML = `
      <svg
          width="48"
          height="48"
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
    artContainer.appendChild(placeholderIcon);
    if (this.albumName && this.artistName) {
      const imgElement = document.createElement('img');
      imgElement.alt = this.albumName;
      imgElement.className = 'album-card-dynamic-img';
      this.musicStore
        .getAlbumArtBlob(this.albumName, this.artistName)
        .then((blob: Blob | null) => {
          if (blob && blob.size > 0) {
            const objectUrl = URL.createObjectURL(blob);
            imgElement.src = objectUrl;
            placeholderIcon.style.display = 'none';
            imgElement.style.display = 'block';
          } else {
            placeholderIcon.style.display = 'flex';
            imgElement.remove();
          }
        })
        .catch(() => {
          placeholderIcon.style.display = 'flex';
          imgElement.remove();
        });
      artContainer.appendChild(imgElement);
    }
    const infoContainer = document.createElement('div');
    infoContainer.className = 'album-card-info';
    const titleElement = document.createElement('div');
    titleElement.className = 'album-card-title';
    titleElement.textContent = this.albumName || 'Unknown Album';
    const artistElement = document.createElement('div');
    artistElement.className = 'album-card-artist';
    artistElement.textContent = this.artistName || 'Unknown Artist';
    const metaContainer = document.createElement('div');
    metaContainer.className = 'album-card-meta';
    const trackCountBadge = document.createElement('span');
    trackCountBadge.textContent = `${this.albumTracks.length} треков`;
    metaContainer.appendChild(trackCountBadge);
    infoContainer.append(titleElement, artistElement, metaContainer);
    cardElement.append(artContainer, infoContainer);
    cardElement.addEventListener('click', () => {
      const modal = new AlbumModal(
        this.albumName,
        this.artistName,
        this.albumTracks,
        this.playbackManager,
        this.musicStore,
        this.playlistStore,
      );
      modal.open();
    });
    return cardElement;
  }
}
