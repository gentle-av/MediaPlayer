import { PlaylistModal } from './modals/PlaylistModal.js';
import { UiStateStore } from '../core/store/UiStateStore.js';
export class Header {
    constructor(playlistStore, playbackManager) {
        this.playlistStore = playlistStore;
        this.playbackManager = playbackManager;
        this.pageTitleElement = null;
        this.titleIconElement = null;
    }
    render() {
        const header = document.createElement('header');
        header.className = 'app-header';
        const titleSection = document.createElement('div');
        titleSection.className = 'header-title-section';
        this.pageTitleElement = this.createPageTitle();
        titleSection.appendChild(this.pageTitleElement);
        header.appendChild(titleSection);
        const controlsSection = document.createElement('div');
        controlsSection.className = 'header-controls-section';
        controlsSection.appendChild(this.createSearch());
        controlsSection.appendChild(this.createPlaylistButton());
        header.appendChild(controlsSection);
        return header;
    }
    setTitleIcon(iconClass) {
        if (this.titleIconElement) {
            this.titleIconElement.className = '';
            this.titleIconElement.className = `fas ${iconClass}`;
        }
    }
    setTitleText(text) {
        if (this.pageTitleElement) {
            const icon = this.pageTitleElement.querySelector('i');
            this.pageTitleElement.innerHTML = '';
            if (icon) {
                this.pageTitleElement.appendChild(icon);
            }
            this.pageTitleElement.appendChild(document.createTextNode(` ${text}`));
        }
    }
    setTitle(iconClass, text) {
        this.setTitleIcon(iconClass);
        this.setTitleText(text);
    }
    togglePlaylistButtonVisibility(isVisible) {
        const playlistBtn = document.getElementById('headerPlaylistBtn');
        if (playlistBtn) {
            playlistBtn.style.display = isVisible ? 'flex' : 'none';
        }
    }
    bindSearch(onSearch, containerElement) {
        const searchInput = containerElement.querySelector('#globalSearchInput');
        const clearButton = containerElement.querySelector('.search-clear-btn');
        if (!searchInput || !clearButton) {
            return;
        }
        const currentQuery = UiStateStore.getInstance().getState().searchQuery;
        if (currentQuery) {
            searchInput.value = currentQuery;
            clearButton.classList.add('visible');
        }
        searchInput.addEventListener('input', (event) => {
            const currentTerm = event.target.value;
            if (currentTerm.length > 0) {
                clearButton.classList.add('visible');
            }
            else {
                clearButton.classList.remove('visible');
            }
            onSearch(currentTerm);
        });
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            clearButton.classList.remove('visible');
            onSearch('');
            searchInput.focus();
        });
    }
    createSearch() {
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'search-wrapper';
        const searchBox = document.createElement('div');
        searchBox.id = 'globalSearchBox';
        const vectorRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        vectorRoot.setAttribute('class', 'search-icon');
        vectorRoot.setAttribute('width', '16');
        vectorRoot.setAttribute('height', '16');
        vectorRoot.setAttribute('viewBox', '0 0 24 24');
        vectorRoot.setAttribute('fill', 'none');
        vectorRoot.setAttribute('stroke', 'currentColor');
        vectorRoot.setAttribute('stroke-width', '2');
        vectorRoot.setAttribute('stroke-linecap', 'round');
        vectorRoot.setAttribute('stroke-linejoin', 'round');
        const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleElement.setAttribute('cx', '11');
        circleElement.setAttribute('cy', '11');
        circleElement.setAttribute('r', '8');
        const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineElement.setAttribute('x1', '21');
        lineElement.setAttribute('y1', '21');
        lineElement.setAttribute('x2', '16.65');
        lineElement.setAttribute('y2', '16.65');
        vectorRoot.append(circleElement, lineElement);
        searchBox.appendChild(vectorRoot);
        const searchInput = document.createElement('input');
        searchInput.id = 'globalSearchInput';
        searchInput.type = 'text';
        searchInput.placeholder = 'Поиск...';
        searchBox.appendChild(searchInput);
        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear-btn';
        const closeVector = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        closeVector.setAttribute('width', '14');
        closeVector.setAttribute('height', '14');
        closeVector.setAttribute('viewBox', '0 0 24 24');
        closeVector.setAttribute('fill', 'none');
        closeVector.setAttribute('stroke', 'currentColor');
        closeVector.setAttribute('stroke-width', '2');
        closeVector.setAttribute('stroke-linecap', 'round');
        closeVector.setAttribute('stroke-linejoin', 'round');
        const firstLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        firstLine.setAttribute('x1', '18');
        firstLine.setAttribute('y1', '6');
        firstLine.setAttribute('x2', '6');
        firstLine.setAttribute('y2', '18');
        const secondLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        secondLine.setAttribute('x1', '6');
        secondLine.setAttribute('y1', '6');
        secondLine.setAttribute('x2', '18');
        secondLine.setAttribute('y2', '18');
        closeVector.append(firstLine, secondLine);
        clearButton.appendChild(closeVector);
        searchBox.appendChild(clearButton);
        searchWrapper.appendChild(searchBox);
        return searchWrapper;
    }
    createPageTitle() {
        const pageTitle = document.createElement('h1');
        pageTitle.className = 'page-title';
        this.titleIconElement = document.createElement('i');
        this.titleIconElement.className = 'fas fa-play';
        pageTitle.appendChild(this.titleIconElement);
        pageTitle.appendChild(document.createTextNode(' Video'));
        return pageTitle;
    }
    createPlaylistButton() {
        const playlistBtn = document.createElement('button');
        playlistBtn.id = 'headerPlaylistBtn';
        playlistBtn.className = 'header-btn';
        const playlistIcon = document.createElement('i');
        playlistIcon.className = 'fas fa-list';
        playlistBtn.appendChild(playlistIcon);
        playlistBtn.appendChild(document.createTextNode(' Плейлист'));
        const badge = document.createElement('span');
        badge.className = 'playlist-badge';
        badge.textContent = '0';
        playlistBtn.appendChild(badge);
        playlistBtn.addEventListener('click', () => {
            const names = this.playlistStore.getPlaylistNames();
            const activeName = names && names.length > 0 ? names[0] : 'Избранное';
            if (!this.playlistStore.getPlaylist(activeName)) {
                try {
                    this.playlistStore.createPlaylist(activeName);
                }
                catch (e) {
                    console.warn(e);
                }
            }
            const currentTracks = this.playlistStore.getPlaylistTracks(activeName);
            const modal = new PlaylistModal(currentTracks, this.playbackManager, this.playlistStore);
            modal.open();
        });
        return playlistBtn;
    }
}
//# sourceMappingURL=Header.js.map