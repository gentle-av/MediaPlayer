import { VideoStore } from '../../core/store/VideoStore.js';
import { VideoItem } from '../../core/entities/video/VideoItem.js';

export class VideoContentContainer {
  private readonly videoStore: VideoStore;

  constructor(videoStore: VideoStore) {
    this.videoStore = videoStore;
  }

  public async render(targetSelector: string): Promise<void> {
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

  private createVideoCardElement(videoItem: VideoItem): HTMLElement {
    const cardElement = document.createElement('figure');
    cardElement.className = 'video-card';
    const thumbnailImageElement = this.createThumbnailElement(videoItem.path);
    const titleElement = this.createTitleElement(videoItem.name);
    cardElement.append(thumbnailImageElement, titleElement);
    return cardElement;
  }

  private createThumbnailElement(filePath: string): HTMLImageElement {
    const imageElement = document.createElement('img');
    const encodedPath = encodeURIComponent(filePath);
    imageElement.src = `/api/thumbnails?path=${encodedPath}`;
    imageElement.alt = `Thumbnail for ${filePath}`;
    imageElement.loading = 'lazy';
    return imageElement;
  }

  private createTitleElement(title: string): HTMLElement {
    const captionElement = document.createElement('figcaption');
    captionElement.textContent = title;
    return captionElement;
  }
}
