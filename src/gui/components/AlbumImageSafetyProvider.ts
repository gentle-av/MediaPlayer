import { MusicStore } from '../../core/store/MusicStore.js';

export class AlbumImageSafetyProvider {
  private static activeCardUrls: Map<string, string> = new Map();

  public static async getSafeArtUrl(
    musicStore: MusicStore,
    albumName: string,
    artistName: string,
    uniqueCardUid: string,
  ): Promise<string | null> {
    try {
      const trackBlob = await musicStore.getAlbumArtBlob(albumName, artistName);
      if (!trackBlob || trackBlob.size <= 0) {
        return null;
      }
      const forcedBlob = new Blob([trackBlob], { type: 'image/jpeg' });
      const generatedObjectUrl = URL.createObjectURL(forcedBlob);
      this.activeCardUrls.set(uniqueCardUid, generatedObjectUrl);
      return generatedObjectUrl;
    } catch (networkError) {
      console.warn(networkError);
      return null;
    }
  }

  public static revokeUrlByKey(uniqueCardUid: string): void {
    const existingUrl = this.activeCardUrls.get(uniqueCardUid);
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      this.activeCardUrls.delete(uniqueCardUid);
    }
  }
}
