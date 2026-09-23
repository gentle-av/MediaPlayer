import { MusicStore } from '../../core/store/MusicStore.js';
import { PlaylistStore } from '../../core/store/PlaylistStore.js';
import { PlaybackManager } from '../../core/player/PlaybackManager.js';
import { Metadata } from '../../core/entities/music/Metadata.js';
import { AlbumCard } from '../components/AlbumCard.js';
import { Component } from '../components/Component.js';
import { UiStateStore } from '../../core/store/UiStateStore.js';
import { MusicBackgroundMenu } from '../menu/MusicBackgroundMenu.js';
import { ContextMenu } from '../menu/ContextMenu.js';
import { ToastService } from '../components/ToastService.js';
import { AlbumImageSafetyProvider } from '../components/AlbumImageSafetyProvider.js';
import { AlbumDeleteConfirmModal } from '../modals/AlbumDeleteConfirmModal.js';

export class MusicContentContainer implements Component {
  private readonly backgroundMenu: MusicBackgroundMenu;
  private readonly contextMenu: ContextMenu;

  constructor(
    private readonly musicStore: MusicStore,
    private readonly playlistStore: PlaylistStore,
    private readonly playbackManager: PlaybackManager,
    private readonly deleteAlbumModal: AlbumDeleteConfirmModal,
  ) {
    this.backgroundMenu = new MusicBackgroundMenu(this.musicStore);
    this.contextMenu = new ContextMenu();
  }

  public async render(
    targetElement: HTMLElement | null,
  ): Promise<HTMLElement | null> {
    if (!targetElement) return null;
    targetElement.querySelectorAll('.album-card').forEach((existingCard) => {
      const uniqueUid = (existingCard as HTMLElement).dataset.uid;
      if (uniqueUid) {
        AlbumImageSafetyProvider.revokeUrlByKey(uniqueUid);
      }
    });
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
        this.deleteAlbumModal,
      );
      const renderedCard = albumCard.render();
      renderedCard.dataset.albumName = firstTrack.album;
      renderedCard.dataset.artistName = firstTrack.artist;
      gridElement.appendChild(renderedCard);
    });
    this.backgroundMenu.bind(gridElement, this.contextMenu);
    gridElement.addEventListener('contextmenu', async (e) => {
      const targetCard = (e.target as HTMLElement).closest('.album-card');
      if (!targetCard) return;
      e.preventDefault();
      e.stopPropagation();
      this.backgroundMenu.close();
      const cardElement = targetCard as HTMLElement;
      const album = cardElement.dataset.albumName || '';
      this.contextMenu.show(e, [
        {
          label: 'Удалить альбом',
          isDanger: true,
          action: async () => {
            const confirmDelete = await this.deleteAlbumModal.show(album);
            if (confirmDelete) {
              ToastService.getInstance().show(
                'Запрос на удаление альбома отправлен',
                'info',
              );
              this.render(targetElement);
            }
          },
        },
      ]);
    });
    targetElement.appendChild(gridElement);
    return gridElement;
  }

  public dispose(): void {
    this.backgroundMenu.close();
    this.contextMenu.close();
    document.querySelectorAll('.album-card').forEach((activeCard) => {
      const uniqueUid = (activeCard as HTMLElement).dataset.uid;
      if (uniqueUid) {
        AlbumImageSafetyProvider.revokeUrlByKey(uniqueUid);
      }
    });
  }

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
