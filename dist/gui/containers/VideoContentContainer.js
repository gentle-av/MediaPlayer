export class VideoContentContainer {
    constructor(videoStore) {
        this.videoStore = videoStore;
    }
    async render(targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
            return;
        }
        if (this.videoStore.getItems().length === 0) {
            await this.videoStore.loadLibrary();
        }
        const firstVideoItem = this.videoStore.getVideos()[0];
        if (!firstVideoItem) {
            return;
        }
        const videoCardElement = this.createVideoCardElement(firstVideoItem);
        targetElement.appendChild(videoCardElement);
    }
    createVideoCardElement(videoItem) {
        const cardElement = document.createElement('figure');
        cardElement.className = 'video-card';
        const thumbnailImageElement = this.createThumbnailElement(videoItem.path);
        const titleElement = this.createTitleElement(videoItem.name);
        cardElement.append(thumbnailImageElement, titleElement);
        return cardElement;
    }
    createThumbnailElement(filePath) {
        const imageElement = document.createElement('img');
        const encodedPath = encodeURIComponent(filePath);
        imageElement.src = `/api/thumbnails?path=${encodedPath}`;
        imageElement.alt = `Thumbnail for ${filePath}`;
        imageElement.loading = 'lazy';
        return imageElement;
    }
    createTitleElement(title) {
        const captionElement = document.createElement('figcaption');
        captionElement.textContent = title;
        return captionElement;
    }
}
//# sourceMappingURL=VideoContentContainer.js.map