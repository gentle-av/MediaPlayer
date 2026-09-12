import { Metadata } from '../../core/entities/music/Metadata.js';
import { PlaybackManager } from '../../core/player/PlaybackManager.js';
import { MusicStore } from '../../core/store/MusicStore.js';
import { AlbumTagEditorModal } from '../modals/AlbumTagEditorModal.js';
import { PlaylistModal } from '../modals/PlaylistModal.js';

export class AlbumControlsPanel {
  constructor(
    private readonly albumTracks: Metadata[],
    private readonly playbackManager: PlaybackManager,
    private readonly musicStore: MusicStore,
    private readonly onCloseParent: () => void,
  ) {}

  public render(): HTMLElement {
    const footerElement = document.createElement('div');
    footerElement.className = 'modal-album-actions album-modal-custom-footer';
    const playBtn = document.createElement('button');
    playBtn.className = 'modal-play-btn';
    playBtn.innerHTML = '<i class="fas fa-play"></i> <span>Воспроизвести</span>';
    playBtn.addEventListener('click', () => {
      if (this.albumTracks.length > 0) {
        const globalApp = (window as any).app;
        if (globalApp) {
          const store = globalApp.playlistStore || (globalApp.mainFrame ? globalApp.mainFrame.playlistStore : null);
          if (store) {
            const names = store.getPlaylistNames();
            const activePlaylistName = names && names.length > 0 ? names[0] : 'Избранное';
            if (!store.getPlaylist(activePlaylistName)) {
              store.createPlaylist(activePlaylistName);
            } else {
              store.clearPlaylist(activePlaylistName);
            }
            const filePaths = this.albumTracks.map((track) => track.filePath);
            store.addTracksToPlaylist(activePlaylistName, filePaths);
            this.onCloseParent();
            this.playbackManager.playMusic(this.albumTracks[0]);
            const currentTracks = store.getPlaylistTracks(activePlaylistName);
            const modal = new PlaylistModal(currentTracks, this.playbackManager, store);
            modal.open();
          }
        }
      }
    });
    const addBtn = document.createElement('button');
    addBtn.className = 'modal-add-btn';
    addBtn.innerHTML = '<i class="fas fa-plus"></i> <span>Добавить в плейлист</span>';
    addBtn.addEventListener('click', () => {
      if (this.albumTracks.length > 0) {
        const globalApp = (window as any).app;
        if (globalApp) {
          const store = globalApp.playlistStore || (globalApp.mainFrame ? globalApp.mainFrame.playlistStore : null);
          if (store) {
            const names = store.getPlaylistNames();
            const activePlaylistName = names && names.length > 0 ? names[0] : 'Избранное';
            if (!store.getPlaylist(activePlaylistName)) {
              store.createPlaylist(activePlaylistName);
            }
            const filePathsToPush: string[] = [];
            for (const track of this.albumTracks) {
              if (!store.playlistHasTrack(activePlaylistName, track.filePath)) {
                filePathsToPush.push(track.filePath);
              }
            }
            if (filePathsToPush.length > 0) {
              store.addTracksToPlaylist(activePlaylistName, filePathsToPush);
            }
            this.onCloseParent();
            const currentTracks = store.getPlaylistTracks(activePlaylistName);
            const modal = new PlaylistModal(currentTracks, this.playbackManager, store);
            modal.open();
          }
        }
      }
    });
    const editBtn = document.createElement('button');
    editBtn.className = 'modal-edit-album-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> <span>Редактировать</span>';
    editBtn.addEventListener('click', () => {
      if (this.albumTracks.length > 0) {
        const firstTrack = this.albumTracks[0];
        const tagEditor = new AlbumTagEditorModal(firstTrack.album, firstTrack.artist, this.albumTracks, this.musicStore);
        tagEditor.open();
      }
    });
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'modal-delete-album-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> <span>Удалить</span>';
    deleteBtn.style.setProperty('background', 'var(--red)', 'important');
    deleteBtn.style.setProperty('color', 'var(--bg0)', 'important');
    deleteBtn.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите удалить весь альбом с диска?')) {
        this.onCloseParent();
      }
    });
    footerElement.append(playBtn, addBtn, editBtn, deleteBtn);
    return footerElement;
  }
}
