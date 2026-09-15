import { PlaylistStore } from '../../core/store/PlaylistStore.js';
import { PlaybackManager } from '../../core/player/PlaybackManager.js';
import { Metadata } from '../../core/entities/music/Metadata.js';
import { MusicStore } from '../../core/store/MusicStore.js';
import { AlbumModal } from '../modals/AlbumModal.js';
import { AlbumImageSafetyProvider } from './AlbumImageSafetyProvider.js';

export class AlbumCard {
  private readonly uniqueCardUid: string;

  constructor(
    private readonly albumName: string,
    private readonly artistName: string,
    private readonly albumTracks: Metadata[],
    private readonly playbackManager: PlaybackManager,
    private readonly musicStore: MusicStore,
    private readonly playlistStore: PlaylistStore,
  ) {
    const rawUidString = `${this.artistName}_${this.albumName}`;
    const encodedHash = window.btoa(encodeURIComponent(rawUidString));
    this.uniqueCardUid = `card_${encodedHash.replace(/=/g, '')}`;
  }

  public render(): HTMLElement {
    const cardElement = document.createElement('div');
    cardElement.className = 'album-card';
    cardElement.setAttribute('data-uid', this.uniqueCardUid);
    const artContainer = document.createElement('div');
    artContainer.className = 'album-card-art';
    const placeholderIcon = document.createElement('div');
    placeholderIcon.className = 'album-card-placeholder';
    const vectorRoot = document.createElementNS('http://w3.org', 'svg');
    vectorRoot.setAttribute('viewBox', '0 0 24 24');
    vectorRoot.setAttribute('class', 'album-card-svg');
    const pathElement = document.createElementNS('http://w3.org', 'path');
    pathElement.setAttribute('d', 'M9 18V5l12-2v13');
    const firstCircle = document.createElementNS('http://w3.org', 'circle');
    firstCircle.setAttribute('cx', '6');
    firstCircle.setAttribute('cy', '18');
    firstCircle.setAttribute('r', '3');
    const secondCircle = document.createElementNS('http://w3.org', 'circle');
    secondCircle.setAttribute('cx', '18');
    secondCircle.setAttribute('cy', '16');
    secondCircle.setAttribute('r', '3');
    vectorRoot.append(pathElement, firstCircle, secondCircle);
    placeholderIcon.appendChild(vectorRoot);
    artContainer.appendChild(placeholderIcon);
    if (this.albumName && this.artistName) {
      const imgElement = document.createElement('img');
      imgElement.alt = this.albumName;
      imgElement.className = 'album-card-dynamic-img';
      AlbumImageSafetyProvider.getSafeArtUrl(
        this.musicStore,
        this.albumName,
        this.artistName,
        this.uniqueCardUid,
      ).then((safeObjectUrl) => {
        if (safeObjectUrl) {
          imgElement.src = safeObjectUrl;
          placeholderIcon.classList.add('hidden-placeholder');
          imgElement.classList.add('visible-img');
        }
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
