export class ContentManager {
    getVideoContent() {
        const videoGrid = document.createElement('div');
        videoGrid.className = 'content-grid';
        videoGrid.textContent = 'Контент для Видео';
        return videoGrid;
    }
    getAudioContent() {
        const audioGrid = document.createElement('div');
        audioGrid.className = 'content-grid';
        audioGrid.textContent = 'Контент для Аудио';
        return audioGrid;
    }
}
//# sourceMappingURL=ContentManager.js.map