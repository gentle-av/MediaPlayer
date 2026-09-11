import { AlbumCard } from '../components/AlbumCard.js';
export class MusicContentContainer {
    constructor(musicStore, playbackManager) {
        this.musicStore = musicStore;
        this.playbackManager = playbackManager;
    }
    async render(targetElement, items) {
        if (!targetElement) {
            return null;
        }
        targetElement.innerHTML = '';
        const activeTracks = items || this.musicStore.getAllTracks();
        if (activeTracks.length === 0) {
            targetElement.innerHTML = '<div class="empty">🎵 Альбомы не найдены</div>';
            return null;
        }
        const gridElement = document.createElement('div');
        gridElement.className = 'albums-grid';
        const groupedAlbums = this.groupTracksByAlbum(activeTracks);
        groupedAlbums.forEach((albumTracks, albumKey) => {
            const firstTrack = albumTracks[0];
            const currentAlbumName = firstTrack.album;
            const currentArtistName = firstTrack.artist;
            const albumCard = new AlbumCard(currentAlbumName, currentArtistName, albumTracks, this.playbackManager);
            gridElement.appendChild(albumCard.render());
        });
        targetElement.appendChild(gridElement);
        return gridElement;
    }
    groupTracksByAlbum(tracks) {
        const map = new Map();
        tracks.forEach((track) => {
            const key = `${track.artist}---|---${track.album}`.toLowerCase();
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(track);
        });
        return map;
    }
}
//# sourceMappingURL=MusicContentContainer.js.map