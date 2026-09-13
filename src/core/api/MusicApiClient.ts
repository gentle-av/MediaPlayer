import { BaseApiClient } from './BaseApiClient.js';
import { Metadata } from '../entities/music/Metadata.js';

export interface MusicListResponse {
  success: boolean;
  error?: string;
  files: Array<{
    title?: string;
    artist?: string;
    album?: string;
    duration?: number;
    track?: number;
    year?: number;
    genre?: string;
    path: string;
  }>;
}

export interface TracksResponse {
  success: boolean;
  error?: string;
  tracks: Array<{
    title?: string;
    artist?: string;
    album?: string;
    duration?: number;
    track?: number;
    year?: number;
    genre?: string;
    path: string;
  }>;
}

export interface ArtistsResponse {
  success: boolean;
  error?: string;
  artists: string[];
}

export interface AlbumItem {
  album: string;
  artist: string;
  year: number;
}

export interface AlbumsResponse {
  success: boolean;
  error?: string;
  albums: AlbumItem[];
}

export interface PaginatedAlbumsResponse {
  success: boolean;
  error?: string;
  albums: AlbumItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ActionResponse {
  success: boolean;
  error?: string;
}

export class MusicApiClient extends BaseApiClient<unknown> {
  constructor() {
    super('api/music');
  }

  public async getAlbumArtBlob(
    album: string,
    artist: string,
  ): Promise<Blob | null> {
    try {
      const url = this.buildUrl('api/music/albumart/by-album');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ album, artist }),
      });
      if (!response.ok) return null;
      return await response.blob();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async getAllTracks(): Promise<Metadata[]> {
    try {
      const response = await this.request<MusicListResponse>('api/music/list');
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tracks');
      }
      const tracks: Metadata[] = [];
      for (const file of data.files) {
        try {
          tracks.push(Metadata.fromJson(file));
        } catch (error) {
          console.warn(error);
        }
      }
      return tracks;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getTracksByArtist(artist: string): Promise<Metadata[]> {
    try {
      const path = `api/music/tracks/artist/${encodeURIComponent(artist)}`;
      const response = await this.request<TracksResponse>(path);
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tracks by artist');
      }
      return data.tracks.map((track) => Metadata.fromJson(track));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getTracksByAlbum(
    album: string,
    artist?: string,
  ): Promise<Metadata[]> {
    try {
      let path = `api/music/tracks/album/${encodeURIComponent(album)}`;
      if (artist) {
        path += `?artist=${encodeURIComponent(artist)}`;
      }
      const response = await this.request<TracksResponse>(path);
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tracks by album');
      }
      return data.tracks.map((track) => Metadata.fromJson(track));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getArtists(): Promise<string[]> {
    try {
      const response = await this.request<ArtistsResponse>('api/music/artists');
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch artists');
      }
      return data.artists || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getAlbums(artist?: string): Promise<AlbumItem[]> {
    try {
      let path = 'api/music/albums';
      if (artist) {
        path += `?artist=${encodeURIComponent(artist)}`;
      }
      const response = await this.request<AlbumsResponse>(path);
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch albums');
      }
      return data.albums || [];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getAlbumsPaginated(
    page: number = 1,
    pageSize: number = 20,
    artist?: string,
  ): Promise<{
    albums: AlbumItem[];
    pagination: PaginatedAlbumsResponse['pagination'] | Record<string, never>;
  }> {
    try {
      let path = `api/music/albums/paginated?page=${page}&pageSize=${pageSize}`;
      if (artist) {
        path += `&artist=${encodeURIComponent(artist)}`;
      }
      const response = await this.request<PaginatedAlbumsResponse>(path);
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch albums');
      }
      return {
        albums: data.albums || [],
        pagination: data.pagination || {},
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async forceRescan(directory?: string): Promise<void> {
    try {
      let path = 'api/music/remove-missing';
      if (directory) {
        path += `?dir=${encodeURIComponent(directory)}`;
      }
      const response = await this.request<ActionResponse>(path, {
        method: 'POST',
      });
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Failed to rescan');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async validatePlaylists(): Promise<void> {
    try {
      const response = await this.request<ActionResponse>(
        'api/music/validate-playlists',
        { method: 'POST' },
      );
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || 'Failed to validate playlists');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
