export class AlbumControlsPanel {
    constructor(albumTracks, playbackManager, onCloseParent) {
        this.albumTracks = albumTracks;
        this.playbackManager = playbackManager;
        this.onCloseParent = onCloseParent;
    }
    render() {
        const footerElement = document.createElement('div');
        footerElement.className = 'modal-album-actions album-modal-custom-footer';
        const playBtn = document.createElement('button');
        playBtn.className = 'modal-play-btn';
        playBtn.innerHTML = '<i class="fas fa-play"></i> <span>Воспроизвести</span>';
        playBtn.addEventListener('click', () => {
            if (this.albumTracks.length > 0) {
                this.playbackManager.playMusic(this.albumTracks[0]);
            }
        });
        const addBtn = document.createElement('button');
        addBtn.className = 'modal-add-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i> <span>Добавить в плейлист</span>';
        addBtn.addEventListener('click', () => {
            console.log('Добавление альбома в текущий плейлист:', this.albumTracks);
        });
        const editBtn = document.createElement('button');
        editBtn.className = 'modal-edit-album-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> <span>Редактировать</span>';
        editBtn.addEventListener('click', () => {
            console.log('Открытие редактора тегов для альбома');
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
//# sourceMappingURL=AlbumControlsPanel.js.map