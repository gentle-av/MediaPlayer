export class AlbumImageSafetyProvider {
    static async getSafeArtUrl(musicStore, albumName, artistName, uniqueCardUid) {
        try {
            const trackBlob = await musicStore.getAlbumArtBlob(albumName, artistName);
            if (!trackBlob || trackBlob.size <= 0) {
                return null;
            }
            const forcedBlob = new Blob([trackBlob], { type: 'image/jpeg' });
            const generatedObjectUrl = URL.createObjectURL(forcedBlob);
            this.activeCardUrls.set(uniqueCardUid, generatedObjectUrl);
            return generatedObjectUrl;
        }
        catch (networkError) {
            console.warn(networkError);
            return null;
        }
    }
    static revokeUrlByKey(uniqueCardUid) {
        const existingUrl = this.activeCardUrls.get(uniqueCardUid);
        if (existingUrl) {
            URL.revokeObjectURL(existingUrl);
            this.activeCardUrls.delete(uniqueCardUid);
        }
    }
}
AlbumImageSafetyProvider.activeCardUrls = new Map();
//# sourceMappingURL=AlbumImageSafetyProvider.js.map