export class Header {
    constructor() {
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
        controlsSection.appendChild(this.createRefreshButton());
        header.appendChild(controlsSection);
        return header;
    }
    createPageTitle() {
        const pageTitle = document.createElement('h1');
        pageTitle.className = 'page-title';
        this.titleIconElement = document.createElement('i');
        this.titleIconElement.className = 'fas fa-play';
        pageTitle.appendChild(this.titleIconElement);
        pageTitle.appendChild(document.createTextNode(' Вася'));
        return pageTitle;
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
    createSearch() {
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'search-wrapper';
        const searchBox = document.createElement('div');
        searchBox.id = 'globalSearchBox';
        const searchIcon = document.createElement('i');
        searchIcon.className = 'fas fa-search';
        searchBox.appendChild(searchIcon);
        const searchInput = document.createElement('input');
        searchInput.id = 'globalSearchInput';
        searchInput.type = 'text';
        searchInput.placeholder = 'Поиск...';
        searchBox.appendChild(searchInput);
        const clearBtn = document.createElement('button');
        clearBtn.className = 'search-clear-btn';
        clearBtn.style.display = 'none';
        const clearIcon = document.createElement('i');
        clearIcon.className = 'fas fa-times';
        clearBtn.appendChild(clearIcon);
        searchBox.appendChild(clearBtn);
        searchWrapper.appendChild(searchBox);
        return searchWrapper;
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
        return playlistBtn;
    }
    createRefreshButton() {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'headerRefreshBtn';
        refreshBtn.className = 'header-btn';
        const refreshIcon = document.createElement('i');
        refreshIcon.className = 'fas fa-sync';
        refreshBtn.appendChild(refreshIcon);
        refreshBtn.appendChild(document.createTextNode(' Обновить'));
        return refreshBtn;
    }
}
//# sourceMappingURL=Header.js.map