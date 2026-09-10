import { Config } from '../../core/config/Config.js';
export class AudioTrackMenu {
    constructor() {
        this.menuElement = null;
    }
    async show(clickEvent, currentVideoPath) {
        clickEvent.stopPropagation();
        this.close();
        this.menuElement = document.createElement('div');
        this.menuElement.className = 'audio-stream-popup visible';
        Object.assign(this.menuElement.style, {
            position: 'fixed',
            bottom: `${window.innerHeight - clickEvent.clientY + 10}px`,
            left: `${Math.max(10, clickEvent.clientX - 150)}px`,
            display: 'block',
        });
        const headerElement = document.createElement('div');
        headerElement.className = 'audio-stream-popup-header';
        headerElement.textContent = 'Аудиодорожки';
        const closeButton = document.createElement('button');
        closeButton.className = 'audio-stream-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => this.close());
        headerElement.appendChild(closeButton);
        this.menuElement.appendChild(headerElement);
        const listContainer = document.createElement('div');
        listContainer.className = 'audio-stream-list';
        try {
            const statusResponse = await fetch(`${Config.getConfig().baseUrl}/api/video/status?path=${encodeURIComponent(currentVideoPath)}`);
            const playbackStatus = await statusResponse.json();
            const currentTrackIndex = playbackStatus.audioTrackIndex ?? -1;
            const tracksResponse = await fetch(`${Config.getConfig().baseUrl}/api/video/tracks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: currentVideoPath }),
            });
            const trackListData = await tracksResponse.json();
            if (!trackListData.success || !trackListData.tracks || trackListData.tracks.length === 0) {
                const emptyElement = document.createElement('div');
                emptyElement.className = 'audio-stream-item';
                emptyElement.textContent = 'Дорожки не найдены';
                listContainer.appendChild(emptyElement);
            }
            else {
                trackListData.tracks.forEach((track) => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'audio-stream-item';
                    if (track.id === currentTrackIndex) {
                        itemElement.classList.add('selected');
                    }
                    const nameElement = document.createElement('span');
                    nameElement.className = 'audio-stream-name';
                    nameElement.textContent = track.title || track.lang || `Дорожка ${track.id}`;
                    itemElement.appendChild(nameElement);
                    if (track.codec) {
                        const codecElement = document.createElement('span');
                        codecElement.className = 'audio-stream-codec';
                        codecElement.textContent = track.codec;
                        itemElement.appendChild(codecElement);
                    }
                    itemElement.addEventListener('click', async () => {
                        await fetch(`${Config.getConfig().baseUrl}/api/video/audio/track`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ streamIndex: track.id }),
                        });
                        this.close();
                    });
                    listContainer.appendChild(itemElement);
                });
            }
        }
        catch (networkError) {
            const errorElement = document.createElement('div');
            errorElement.className = 'audio-stream-item';
            errorElement.textContent = 'Ошибка загрузки';
            listContainer.appendChild(errorElement);
        }
        this.menuElement.appendChild(listContainer);
        document.body.appendChild(this.menuElement);
        window.addEventListener('click', () => this.close(), { once: true });
    }
    close() {
        if (this.menuElement && this.menuElement.parentNode) {
            this.menuElement.parentNode.removeChild(this.menuElement);
        }
        this.menuElement = null;
    }
}
//# sourceMappingURL=AudioTrackMenu.js.map