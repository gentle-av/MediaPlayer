import { Metadata } from '../../core/entities/music/Metadata.js';
import { PlaybackManager } from '../../core/player/PlaybackManager.js';
import { PlaylistStore } from '../../core/store/PlaylistStore.js';
import { MusicStore } from '../../core/store/MusicStore.js';
import { AlbumTagEditorModal } from '../modals/AlbumTagEditorModal.js';
import { PlaylistModal } from '../modals/PlaylistModal.js';
import { ToastService } from './ToastService.js';
import { AlbumDeleteConfirmModal } from '../modals/AlbumDeleteConfirmModal.js';

export class AlbumControlsPanel {
  constructor(
    private readonly albumTracks: Metadata[],
    private readonly playbackManager: PlaybackManager,
    private readonly playlistStore: PlaylistStore,
    private readonly musicStore: MusicStore,
    private readonly deleteAlbumModal: AlbumDeleteConfirmModal,
    private readonly onCloseParent: () => void,
  ) {}

  public render(): HTMLElement {
    const footerElement = document.createElement('div');
    footerElement.className = 'modal-album-actions album-modal-custom-footer';
    const playBtn = document.createElement('button');
    playBtn.className = 'modal-play-btn';
    playBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; display: inline-block; vertical-align: middle;">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>Воспроизвести</span>
    `;
    playBtn.addEventListener('click', async () => {
      if (this.albumTracks.length > 0) {
        const names = this.playlistStore.getPlaylistNames();
        const activePlaylistName =
          names && names.length > 0 ? names[0] : 'Избранное';
        if (!this.playlistStore.getPlaylist(activePlaylistName)) {
          this.playlistStore.createPlaylist(activePlaylistName);
        }
        this.playlistStore.clearPlaylist(activePlaylistName);
        const filePaths = this.albumTracks.map((track) => track.filePath);
        this.playlistStore.addTracksToPlaylist(activePlaylistName, filePaths);
        await this.playlistStore.syncWithServer(activePlaylistName);
        this.onCloseParent();
        this.playbackManager.playMusic(this.albumTracks[0], this.albumTracks);
        ToastService.getInstance().show(
          'Альбом добавлен в плейлист и запущен',
          'success',
        );
      }
    });
    const addBtn = document.createElement('button');
    addBtn.className = 'modal-add-btn';
    addBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block; vertical-align: middle;">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>Добавить в плейлист</span>
    `;
    addBtn.addEventListener('click', async () => {
      if (this.albumTracks.length > 0) {
        const names = this.playlistStore.getPlaylistNames();
        const activePlaylistName =
          names && names.length > 0 ? names[0] : 'Избранное';
        if (!this.playlistStore.getPlaylist(activePlaylistName)) {
          this.playlistStore.createPlaylist(activePlaylistName);
        }
        const filePathsToPush: string[] = [];
        for (const track of this.albumTracks) {
          if (
            !this.playlistStore.playlistHasTrack(
              activePlaylistName,
              track.filePath,
            )
          ) {
            filePathsToPush.push(track.filePath);
          }
        }
        if (filePathsToPush.length > 0) {
          this.playlistStore.addTracksToPlaylist(
            activePlaylistName,
            filePathsToPush,
          );
          await this.playlistStore.syncWithServer(activePlaylistName);
          ToastService.getInstance().show(
            `Добавлено треков: ${filePathsToPush.length}`,
            'success',
          );
        } else {
          ToastService.getInstance().show(
            'Все треки уже есть в плейлисте',
            'info',
          );
        }
        this.onCloseParent();
        const currentTracks =
          this.playlistStore.getPlaylistTracks(activePlaylistName);
        const modal = new PlaylistModal(
          currentTracks,
          this.playbackManager,
          this.playlistStore,
          (window as any).app?.clearModal,
        );
        modal.open();
      }
    });
    const editBtn = document.createElement('button');
    editBtn.className = 'modal-edit-album-btn';
    editBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block; vertical-align: middle;">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
      </svg>
      <span>Редактировать</span>
    `;
    editBtn.addEventListener('click', () => {
      if (this.albumTracks.length > 0) {
        const firstTrack = this.albumTracks[0];
        const tagEditor = new AlbumTagEditorModal(
          firstTrack.album,
          firstTrack.artist,
          this.albumTracks,
          this.musicStore,
        );
        tagEditor.open();
      }
    });
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'modal-delete-album-btn dynamic-delete-album-btn';
    deleteBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block; vertical-align: middle;">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
      <span>Удалить</span>
    `;
    deleteBtn.addEventListener('click', async () => {
      if (this.albumTracks.length === 0) return;
      const albumName = this.albumTracks[0].album;
      const artistName = this.albumTracks[0].artist;
      const confirmed = await this.deleteAlbumModal.show(albumName);
      if (!confirmed) return;
      ToastService.getInstance().show('Удаление альбома...', 'info');
      try {
        const apiBase = (this.musicStore as any).apiClient.baseUrl;
        const response = await fetch(`${apiBase}/api/music/delete-album`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ album: albumName, artist: artistName }),
        });
        if (!response.ok) {
          ToastService.getInstance().show(
            `Ошибка сервера: ${response.status}`,
            'error',
          );
          return;
        }
        const result = await response.json();
        if (!result.success) {
          ToastService.getInstance().show(
            result.error || 'Ошибка удаления',
            'error',
          );
          return;
        }
        await this.musicStore.loadTracksFromServer();
        this.onCloseParent();
        ToastService.getInstance().show('Альбом успешно удалён', 'success');
      } catch (error) {
        console.error(error);
        ToastService.getInstance().show('Сетевая ошибка при удалении', 'error');
      }
    });
    footerElement.append(playBtn, addBtn, editBtn, deleteBtn);
    return footerElement;
  }
}
