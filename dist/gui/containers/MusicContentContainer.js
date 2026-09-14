import { AlbumCard } from '../components/AlbumCard.js';
import { UiStateStore } from '../../core/store/UiStateStore.js';
import { MusicBackgroundMenu } from '../menu/MusicBackgroundMenu.js';
import { ContextMenu } from '../menu/ContextMenu.js';
import { ConfirmModal } from '../menu/ConfirmModal.js';
import { ToastService } from '../components/ToastService.js';
export class MusicContentContainer {
    constructor(musicStore, playlistStore, playbackManager) {
        this.musicStore = musicStore;
        this.playlistStore = playlistStore;
        this.playbackManager = playbackManager;
        this.backgroundMenu = new MusicBackgroundMenu(this.musicStore);
        this.contextMenu = new ContextMenu();
        this.confirmModal = new ConfirmModal();
    }
    async render(targetElement) {
        if (!targetElement)
            return null;
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
            const albumCard = new AlbumCard(firstTrack.album, firstTrack.artist, albumTracks, this.playbackManager, this.musicStore, this.playlistStore);
            const renderedCard = albumCard.render();
            renderedCard.dataset.albumName = firstTrack.album;
            renderedCard.dataset.artistName = firstTrack.artist;
            gridElement.appendChild(renderedCard);
        });
        this.backgroundMenu.bind(gridElement, this.contextMenu);
        gridElement.addEventListener('contextmenu', async (e) => {
            const targetCard = e.target.closest('.album-card');
            if (!targetCard)
                return;
            e.preventDefault();
            e.stopPropagation();
            this.backgroundMenu.close();
            const cardElement = targetCard;
            const album = cardElement.dataset.albumName || '';
            this.contextMenu.show(e, [
                {
                    label: 'Удалить альбом',
                    isDanger: true,
                    action: async () => {
                        const confirmDelete = await this.confirmModal.show('Подтверждение удаления', `Вы уверены, что хотите удалить альбом "${album}"?`, true);
                        if (confirmDelete) {
                            ToastService.getInstance().show('Запрос на удаление альбома отправлен', 'info');
                            this.render(targetElement);
                        }
                    },
                },
            ]);
        });
        targetElement.appendChild(gridElement);
        return gridElement;
    }
    dispose() {
        this.backgroundMenu.close();
        this.contextMenu.close();
    }
    groupTracksByAlbum(tracks) {
        const map = new Map();
        tracks.forEach((track) => {
            const key = track.albumKey;
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(track);
        });
        return map;
    }
}
//# sourceMappingURL=MusicContentContainer.js.map