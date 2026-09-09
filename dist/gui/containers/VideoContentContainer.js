export class VideoContentContainer {
    constructor(videoStore, playbackManager) {
        this.videoStore = videoStore;
        this.playbackManager = playbackManager;
    }
    async render(targetElement) {
        if (!targetElement) {
            return null;
        }
        if (!this.videoStore.hasOwnProperty('_popstateInitialized')) {
            this.videoStore._popstateInitialized = true;
            window.addEventListener('popstate', async (event) => {
                if (event.state && event.state.path) {
                    await this.videoStore.loadLibrary(event.state.path);
                    await this.render(targetElement);
                }
            });
        }
        if (this.videoStore.getItems().length === 0) {
            await this.videoStore.loadLibrary();
            history.replaceState({ path: this.videoStore.getCurrentPath() }, '');
        }
        targetElement.innerHTML = '';
        const allItems = this.videoStore.getItems();
        if (allItems.length === 0) {
            targetElement.innerHTML = '<div class="empty">📁 Папка пуста</div>';
            return null;
        }
        const gridElement = document.createElement('div');
        gridElement.className = 'video-content';
        Object.assign(gridElement.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 120px))',
            gap: '16px',
            padding: '20px',
            justifyContent: 'start',
        });
        allItems.forEach((item) => {
            const videoCardElement = this.createVideoCardElement(item);
            videoCardElement.addEventListener('click', async () => {
                if (item.isDirectory) {
                    await this.videoStore.navigateToFolder(item);
                    history.pushState({ path: this.videoStore.getCurrentPath() }, '');
                    await this.render(targetElement);
                }
                else if (item.isVideo) {
                    await this.playbackManager.playVideo(item);
                }
            });
            gridElement.appendChild(videoCardElement);
        });
        targetElement.appendChild(gridElement);
        return gridElement;
    }
    createVideoCardElement(videoItem) {
        const cardElement = document.createElement('figure');
        cardElement.className = 'video-card';
        Object.assign(cardElement.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 10px',
            background: 'transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            width: '120px',
            boxSizing: 'border-box',
            overflow: 'hidden',
        });
        cardElement.addEventListener('mouseenter', () => (cardElement.style.background = 'var(--bg2)'));
        cardElement.addEventListener('mouseleave', () => (cardElement.style.background = 'transparent'));
        const iconElement = document.createElement('i');
        if (videoItem.isDirectory) {
            iconElement.className = 'fas fa-folder';
            iconElement.style.color = 'var(--orange)';
        }
        else if (videoItem.isVideo) {
            iconElement.className = 'fas fa-file-video';
            iconElement.style.color = '#e74c3c';
        }
        else {
            iconElement.className = 'fas fa-file';
            iconElement.style.color = 'var(--fg3)';
        }
        iconElement.style.fontSize = '48px';
        iconElement.style.flexShrink = '0';
        const titleElement = this.createTitleElement(videoItem.name);
        cardElement.append(iconElement, titleElement);
        return cardElement;
    }
    createTitleElement(title) {
        const captionElement = document.createElement('figcaption');
        captionElement.textContent = title;
        Object.assign(captionElement.style, {
            margin: '0',
            fontSize: '0.8rem',
            fontWeight: '500',
            color: 'var(--fg1)',
            lineHeight: '1.3',
            textAlign: 'center',
            display: '-webkit-box',
            webkitLineClamp: '3',
            webkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            width: '100%',
        });
        return captionElement;
    }
}
//# sourceMappingURL=VideoContentContainer.js.map