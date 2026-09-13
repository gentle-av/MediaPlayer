import { BaseApiClient } from './BaseApiClient.js';
import { Metadata } from '../entities/music/Metadata.js';
export class MusicApiClient extends BaseApiClient {
    constructor() {
        super('api/music');
    }
    async getAlbumArtBlob(album, artist) {
        try {
            const url = this.buildUrl('api/music/albumart/by-album');
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ album, artist }),
            });
            if (!response.ok)
                return null;
            return await response.blob();
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    async getAllTracks() {
        try {
            const response = await this.request('api/music/list');
            const data = response.data;
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch tracks');
            }
            const tracks = [];
            for (const file of data.files) {
                try {
                    tracks.push(Metadata.fromJson(file));
                }
                catch (error) {
                    console.warn(error);
                }
            }
            return tracks;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async getTracksByArtist(artist) {
        try {
            const path = `api/music/tracks/artist/${encodeURIComponent(artist)}`;
            const response = await this.request(path);
            const data = response.data;
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch tracks by artist');
            }
            return data.tracks.map((track) => Metadata.fromJson(track));
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async getTracksByAlbum(album, artist) {
        try {
            let path = `api/music/tracks/album/${encodeURIComponent(album)}`;
            if (artist) {
                path += `?artist=${encodeURIComponent(artist)}`;
            }
            const response = await this.request(path);
            const data = response.data;
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch tracks by album');
            }
            return data.tracks.map((track) => Metadata.fromJson(track));
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async getArtists() {
        try {
            const response = await this.request('api/music/artists');
            const data = response.data;
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch artists');
            }
            return data.artists || [];
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async getAlbums(artist) {
        try {
            let path = 'api/music/albums';
            if (artist) {
                path += `?artist=${encodeURIComponent(artist)}`;
            }
            const response = await this.request(path);
            const data = response.data;
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch albums');
            }
            return data.albums || [];
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async getAlbumsPaginated(page = 1, pageSize = 20, artist) {
        try {
            let path = `api/music/albums/paginated?page=${page}&pageSize=${pageSize}`;
            if (artist) {
                path += `&artist=${encodeURIComponent(artist)}`;
            }
            const response = await this.request(path);
            const data = response.data;
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch albums');
            }
            return {
                albums: data.albums || [],
                pagination: data.pagination || {},
            };
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async forceRescan(directory) {
        try {
            let path = 'api/music/remove-missing';
            if (directory) {
                path += `?dir=${encodeURIComponent(directory)}`;
            }
            const response = await this.request(path, {
                method: 'POST',
            });
            const data = response.data;
            if (!data.success) {
                throw new Error(data.error || 'Failed to rescan');
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    async validatePlaylists() {
        try {
            const response = await this.request('api/music/validate-playlists', { method: 'POST' });
            const data = response.data;
            if (!data.success) {
                throw new Error(data.error || 'Failed to validate playlists');
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
}
//# sourceMappingURL=MusicApiClient.js.map