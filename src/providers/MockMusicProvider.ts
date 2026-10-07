import type { MusicProvider } from './types/MusicProvider'
import type {
  MusicAlbum,
  MusicArtist,
  MusicLyrics,
  MusicPlaylist,
  MusicSearchResults,
  MusicTrack,
} from './types/MusicTypes'
import type { ServerConnection } from './types/ServerConnection'

const connection: ServerConnection = {
  id: 'mock-server',
  name: 'Demo Music Server',
  type: 'unknown',
  url: 'http://localhost',
  username: 'demo',
}

const demoAlbum: MusicAlbum = {
  id: 'album-1',
  title: 'Demo Album',
  artistName: 'Demo Artist',
  year: 2026,
  songCount: 3,
}

const demoTracks: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'First Song',
    artistName: 'Demo Artist',
    albumId: demoAlbum.id,
    albumName: demoAlbum.title,
    trackNumber: 1,
    duration: 210,
  },
  {
    id: 'track-2',
    title: 'Second Song',
    artistName: 'Demo Artist',
    albumId: demoAlbum.id,
    albumName: demoAlbum.title,
    trackNumber: 2,
    duration: 195,
  },
  {
    id: 'track-3',
    title: 'Final Song',
    artistName: 'Demo Artist',
    albumId: demoAlbum.id,
    albumName: demoAlbum.title,
    trackNumber: 3,
    duration: 240,
  },
]

export class MockMusicProvider implements MusicProvider {
  readonly connection = connection

  async testConnection(): Promise<void> {
    return
  }

  async getRecentlyAddedAlbums(): Promise<MusicAlbum[]> {
    return [demoAlbum]
  }

  async getRecentlyPlayedTracks(): Promise<MusicTrack[]> {
    return [demoTracks[0]]
  }

  async getArtists(): Promise<MusicArtist[]> {
    return [
      {
        id: 'artist-1',
        name: 'Demo Artist',
        albumCount: 1,
        songCount: 3,
      },
    ]
  }

  async getAlbums(): Promise<MusicAlbum[]> {
    return [demoAlbum]
  }

  async getAlbum(albumId: string,): Promise<MusicAlbum | null> {
    return albumId === demoAlbum.id
        ? demoAlbum
        : null
}

  async getAlbumTracks(): Promise<MusicTrack[]> {
    return demoTracks
  }

  async getArtistTracks(): Promise<MusicTrack[]> {
    return demoTracks
  }

  async search(query: string): Promise<MusicSearchResults> {
    const normalizedQuery = query.toLowerCase()

    return {
      artists: normalizedQuery.includes('demo')
        ? [
            {
              id: 'artist-1',
              name: 'Demo Artist',
            },
          ]
        : [],
      albums: normalizedQuery.includes('demo')
        ? [demoAlbum]
        : [],
      tracks: normalizedQuery.includes('song')
        ? demoTracks
        : [],
    }
  }

  async getLyrics(): Promise<MusicLyrics | null> {
    return null
  }

  async getStreamUrl(): Promise<string> {
    throw new Error('Demo provider does not provide audio')
  }

  async getCoverArtUrl(): Promise<string> {
    throw new Error('Demo provider does not provide artwork')
  }

  async setFavourite(): Promise<void> {
    return
  }

  async setRating(): Promise<void> {
    return
  }

  async scrobble(): Promise<void> {
    return
  }

  async getPlaylists(): Promise<MusicPlaylist[]> {
    return []
  }

  async getPlaylistTracks(): Promise<MusicTrack[]> {
    return []
  }
}