import { MusicStore } from '../../core/store/MusicStore.js';
import { PlaylistStore } from '../../core/store/PlaylistStore.js';
import { PlaybackManager } from '../../core/player/PlaybackManager.js';
import { Metadata } from '../../core/entities/music/Metadata.js';
import { AlbumCard } from '../components/AlbumCard.js';
import { Component } from '../components/Component.js';
import { UiStateStore } from '../../core/store/UiStateStore.js';
import { MusicBackgroundMenu } from '../menu/MusicBackgroundMenu.js';
import { ContextMenu } from '../menu/ContextMenu.js';
import { ConfirmModal } from '../menu/ConfirmModal.js';
import { ToastService } from '../components/ToastService.js';

export class MusicContentContainer implements Component {
  private readonly backgroundMenu: MusicBackgroundMenu;
  private readonly contextMenu: ContextMenu;
  private readonly confirmModal: ConfirmModal;

  constructor(
    private readonly musicStore: MusicStore,
    private readonly playlistStore: PlaylistStore,
    private readonly playbackManager: PlaybackManager,
  ) {
    this.backgroundMenu = new MusicBackgroundMenu(this.musicStore);
    this.contextMenu = new ContextMenu();
    this.confirmModal = new ConfirmModal();
  }

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
            const confirmDelete = await this.confirmModal.show(
              'Подтверждение удаления',
              `Вы уверены, что хотите удалить альбом "${album}"?`,
              true,
            );
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
