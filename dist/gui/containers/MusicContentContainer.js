import { AlbumCard } from '../components/AlbumCard.js';
import { UiStateStore } from '../../core/store/UiStateStore.js';
export class MusicContentContainer {
    constructor(musicStore, playlistStore, playbackManager) {
        this.musicStore = musicStore;
        this.playlistStore = playlistStore;
        this.playbackManager = playbackManager;
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
            gridElement.appendChild(albumCard.render());
        });
        targetElement.appendChild(gridElement);
        return gridElement;
    }
    dispose() { }
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