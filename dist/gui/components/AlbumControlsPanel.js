import { AlbumTagEditorModal } from '../modals/AlbumTagEditorModal.js';
import { PlaylistModal } from '../modals/PlaylistModal.js';
import { ToastService } from './ToastService.js';
export class AlbumControlsPanel {
    constructor(albumTracks, playbackManager, playlistStore, musicStore, onCloseParent) {
        this.albumTracks = albumTracks;
        this.playbackManager = playbackManager;
        this.playlistStore = playlistStore;
        this.musicStore = musicStore;
        this.onCloseParent = onCloseParent;
    }
    render() {
        const footerElement = document.createElement('div');
        footerElement.className = 'modal-album-actions album-modal-custom-footer';
        const playBtn = document.createElement('button');
        playBtn.className = 'modal-play-btn';
        playBtn.innerHTML =
            '<i class="fas fa-play"></i> <span>Воспроизвести</span>';
        playBtn.addEventListener('click', () => {
            if (this.albumTracks.length > 0) {
                const names = this.playlistStore.getPlaylistNames();
                const activePlaylistName = names && names.length > 0 ? names[0] : 'Избранное';
                if (!this.playlistStore.getPlaylist(activePlaylistName)) {
                    this.playlistStore.createPlaylist(activePlaylistName);
                }
                this.playlistStore.clearPlaylist(activePlaylistName);
                const filePaths = this.albumTracks.map((track) => track.filePath);
                this.playlistStore.addTracksToPlaylist(activePlaylistName, filePaths);
                this.onCloseParent();
                this.playbackManager.playMusic(this.albumTracks[0]);
                ToastService.getInstance().show('Альбом добавлен в плейлист и запущен', 'success');
            }
        });
        const addBtn = document.createElement('button');
        addBtn.className = 'modal-add-btn';
        addBtn.innerHTML =
            '<i class="fas fa-plus"></i> <span>Добавить в плейлист</span>';
        addBtn.addEventListener('click', () => {
            if (this.albumTracks.length > 0) {
                const names = this.playlistStore.getPlaylistNames();
                const activePlaylistName = names && names.length > 0 ? names[0] : 'Избранное';
                if (!this.playlistStore.getPlaylist(activePlaylistName)) {
                    this.playlistStore.createPlaylist(activePlaylistName);
                }
                const filePathsToPush = [];
                for (const track of this.albumTracks) {
                    if (!this.playlistStore.playlistHasTrack(activePlaylistName, track.filePath)) {
                        filePathsToPush.push(track.filePath);
                    }
                }
                if (filePathsToPush.length > 0) {
                    this.playlistStore.addTracksToPlaylist(activePlaylistName, filePathsToPush);
                    ToastService.getInstance().show(`Добавлено треков: ${filePathsToPush.length}`, 'success');
                }
                else {
                    ToastService.getInstance().show('Все треки уже есть в плейлисте', 'info');
                }
                this.onCloseParent();
                const currentTracks = this.playlistStore.getPlaylistTracks(activePlaylistName);
                const modal = new PlaylistModal(currentTracks, this.playbackManager, this.playlistStore);
                modal.open();
            }
        });
        const editBtn = document.createElement('button');
        editBtn.className = 'modal-edit-album-btn';
        editBtn.innerHTML =
            '<i class="fas fa-edit"></i> <span>Редактировать</span>';
        editBtn.addEventListener('click', () => {
            if (this.albumTracks.length > 0) {
                const firstTrack = this.albumTracks[0];
                const tagEditor = new AlbumTagEditorModal(firstTrack.album, firstTrack.artist, this.albumTracks, this.musicStore);
                tagEditor.open();
            }
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'modal-delete-album-btn';
        deleteBtn.innerHTML =
            '<i class="fas fa-trash-alt"></i> <span>Удалить</span>';
        deleteBtn.style.setProperty('background', 'var(--red)', 'important');
        deleteBtn.style.setProperty('color', 'var(--bg0)', 'important');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить весь альбом с диска?')) {
                this.onCloseParent();
                ToastService.getInstance().show('Запрос на удаление альбома отправлен', 'info');
            }
        });
        footerElement.append(playBtn, addBtn, editBtn, deleteBtn);
        return footerElement;
    }
}
//# sourceMappingURL=AlbumControlsPanel.js.map