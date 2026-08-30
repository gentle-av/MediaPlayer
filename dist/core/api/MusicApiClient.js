import { Metadata } from "../entities/music/Metadata.js";
import { Config } from "../config/Config.js";
export class MusicApiClient {
    constructor() {
        this.baseUrl = Config.getConfig().baseUrl;
    }
    async getAllTracks() {
        try {
            const response = await fetch(`${this.baseUrl}/api/music/list`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch tracks');
            }
            const tracks = [];
            const problematicPaths = [];
            for (const file of data.files) {
                try {
                    const track = new Metadata(file.title || 'Unknown', file.artist || 'Unknown Artist', file.album || 'Unknown Album', file.duration || 0, file.track || 0, file.year || 0, file.genre || 'Unknown', file.path);
                    tracks.push(track);
                }
                catch (error) {
                    console.warn('❌ Skipping track due to validation error:', file.path);
                    if (error instanceof Error) {
                        console.warn('  Error details:', error.message);
                    }
                    else {
                        console.warn('  Error details:', String(error));
                    }
                    problematicPaths.push(file.path);
                }
            }
            if (problematicPaths.length > 0) {
                console.log(`⚠️ ${problematicPaths.length} problematic paths:`);
                problematicPaths.forEach(path => console.log(`  - ${path}`));
            }
            console.log(`✅ Loaded ${tracks.length} tracks (${problematicPaths.length} skipped)`);
            return tracks;
        }
        catch (error) {
            console.error('Error fetching tracks:', error);
            throw error;
        }
    }
    async getTracksByArtist(artist) {
        try {
            const response = await fetch(`${this.baseUrl}/api/music/tracks/artist/${encodeURIComponent(artist)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch tracks by artist');
            }
            return data.tracks.map((track) => new Metadata(track.title || 'Unknown', track.artist || 'Unknown Artist', track.album || 'Unknown Album', track.duration || 0, track.track || 0, track.year || 0, track.genre || 'Unknown', track.path));
        }
        catch (error) {
            console.error(`Error fetching tracks for artist ${artist}:`, error);
            throw error;
        }
    }
    async getTracksByAlbum(album, artist) {
        try {
            let url = `${this.baseUrl}/api/music/tracks/album/${encodeURIComponent(album)}`;
            if (artist) {
                url += `?artist=${encodeURIComponent(artist)}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch tracks by album');
            }
            return data.tracks.map((track) => new Metadata(track.title || 'Unknown', track.artist || 'Unknown Artist', track.album || 'Unknown Album', track.duration || 0, track.track || 0, track.year || 0, track.genre || 'Unknown', track.path));
        }
        catch (error) {
            console.error(`Error fetching tracks for album ${album}:`, error);
            throw error;
        }
    }
    async getArtists() {
        try {
            const response = await fetch(`${this.baseUrl}/api/music/artists`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch artists');
            }
            return data.artists || [];
        }
        catch (error) {
            console.error('Error fetching artists:', error);
            throw error;
        }
    }
    async getAlbums(artist) {
        try {
            let url = `${this.baseUrl}/api/music/albums`;
            if (artist) {
                url += `?artist=${encodeURIComponent(artist)}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch albums');
            }
            return data.albums || [];
        }
        catch (error) {
            console.error('Error fetching albums:', error);
            throw error;
        }
    }
    async getAlbumsPaginated(page = 1, pageSize = 20, artist) {
        try {
            let url = `${this.baseUrl}/api/music/albums/paginated?page=${page}&pageSize=${pageSize}`;
            if (artist) {
                url += `&artist=${encodeURIComponent(artist)}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch albums');
            }
            return {
                albums: data.albums || [],
                pagination: data.pagination || {}
            };
        }
        catch (error) {
            console.error('Error fetching albums with pagination:', error);
            throw error;
        }
    }
    async forceRescan(directory) {
        try {
            let url = `${this.baseUrl}/api/music/remove-missing`;
            if (directory) {
                url += `?dir=${encodeURIComponent(directory)}`;
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to rescan');
            }
        }
        catch (error) {
            console.error('Error during rescan:', error);
            throw error;
        }
    }
    async validatePlaylists() {
        try {
            const response = await fetch(`${this.baseUrl}/api/music/validate-playlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to validate playlists');
            }
        }
        catch (error) {
            console.error('Error validating playlists:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=MusicApiClient.js.map