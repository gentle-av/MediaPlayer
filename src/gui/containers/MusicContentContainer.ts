import { MusicStore } from '../../core/store/MusicStore.js';
import { PlaylistStore } from '../../core/store/PlaylistStore.js';
import { PlaybackManager } from '../../core/player/PlaybackManager.js';
import { Metadata } from '../../core/entities/music/Metadata.js';
import { AlbumCard } from '../components/AlbumCard.js';
import { Component } from '../components/Component.js';
import { UiStateStore } from '../../core/store/UiStateStore.js';

export class MusicContentContainer implements Component {
  constructor(
    private readonly musicStore: MusicStore,
    private readonly playlistStore: PlaylistStore,
    private readonly playbackManager: PlaybackManager,
  ) {}

  public async render(
    targetElement: HTMLElement | null,
  ): Promise<HTMLElement | null> {
    if (!targetElement) return null;
    targetElement.innerHTML = '';
    const uiState = UiStateStore.getInstance().getState();
    const filterTerm = uiState.searchQuery;
    let activeTracks = this.musicStore.getAllTracks();
    if (filterTerm) {
      activeTracks = this.musicStore.searchTracks(filterTerm);
    }
    if (activeTracks.length === 0) {
      targetElement.innerHTML =
        '<div class="empty">🎵 Альбомы не найдены</div>';
      return null;
    }
    const gridElement = document.createElement('div');
    gridElement.className = 'albums-grid';
    const groupedAlbums = this.groupTracksByAlbum(activeTracks);
    groupedAlbums.forEach((albumTracks) => {
      const firstTrack = albumTracks[0];
      const albumCard = new AlbumCard(
        firstTrack.album,
        firstTrack.artist,
        albumTracks,
        this.playbackManager,
        this.musicStore,
        this.playlistStore,
      );
      gridElement.appendChild(albumCard.render());
    });
    targetElement.appendChild(gridElement);
    return gridElement;
  }

  public dispose(): void {}

  private groupTracksByAlbum(tracks: Metadata[]): Map<string, Metadata[]> {
    const map = new Map<string, Metadata[]>();
    tracks.forEach((track) => {
      const key = track.albumKey;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(track);
    });
    return map;
  }
}
