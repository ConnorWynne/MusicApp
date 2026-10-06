import { OpenSubsonicClient } from './OpenSubsonicClient'

import type { MusicProvider } from '../types/MusicProvider'
import type {
  MusicAlbum,
  MusicArtist,
  MusicLyrics,
  MusicPlaylist,
  MusicSearchResults,
  MusicTrack,
} from '../types/MusicTypes'
import type { ServerConnection } from '../types/ServerConnection'

interface NavidromeArtist {
  id: string
  name: string
  albumCount?: number
  songCount?: number
  artistImageUrl?: string
}

interface NavidromeAlbum {
  id: string
  name: string
  artist?: string
  artistId?: string
  year?: number
  genre?: string
  songCount?: number
  duration?: number
  coverArt?: string
}

interface NavidromeSong {
  id: string
  title: string
  artist?: string
  artistId?: string
  album?: string
  albumId?: string
  albumArtist?: string
  track?: number
  discNumber?: number
  year?: number
  genre?: string
  duration?: number
  bitRate?: number
  contentType?: string
  suffix?: string
  coverArt?: string
}

interface NavidromePlaylist {
  id: string
  name: string
  songCount?: number
  duration?: number
  owner?: string
  public?: boolean
  coverArt?: string
}

interface ArtistsResponse {
  artists?: {
    index?: Array<{
      artist: NavidromeArtist
    }>
  }
}

interface AlbumsResponse {
  albumList2?: {
    album?: NavidromeAlbum[]
  }
}

interface AlbumSongsResponse {
  album?: NavidromeSong[]
}

interface ArtistResponse {
  artist?: {
    song?: NavidromeSong[]
  }
}

interface SearchResponse {
  searchResult3?: {
    artist?: NavidromeArtist[]
    album?: NavidromeAlbum[]
    song?: NavidromeSong[]
  }
}

interface NowPlayingResponse {
  nowPlaying?: {
    entry?: NavidromeSong[]
  }
}

interface LyricsResponse {
  lyricsList?: {
    structuredLyrics?: Array<{
      displayArtist?: string
      displayTitle?: string
      synced?: boolean
      line?: Array<{
        start?: number
        value?: string
      }>
    }>
  }
}

interface PlaylistsResponse {
  playlists?: {
    playlist?: NavidromePlaylist[]
  }
}

interface PlaylistResponse {
  playlist?: {
    entry?: NavidromeSong[]
  }
}

export class NavidromeProvider implements MusicProvider {
  readonly connection: ServerConnection

  private readonly client: OpenSubsonicClient

  constructor(
    connection: ServerConnection,
    password: string,
  ) {
    this.connection = connection

    this.client = new OpenSubsonicClient(
      connection.url,
      connection.username,
      password,
    )
  }

  async testConnection(): Promise<void> {
    await this.client.request('ping')
  }

  async getRecentlyAddedAlbums(
    limit = 20,
  ): Promise<MusicAlbum[]> {
    const response =
      await this.client.request<AlbumsResponse>(
        'getAlbumList2',
        {
          type: 'newest',
          size: limit,
          offset: 0,
        },
      )

    return (response.albumList2?.album ?? []).map(
      (album) => this.mapAlbum(album),
    )
  }

  async getRecentlyPlayedTracks(
    limit = 20,
  ): Promise<MusicTrack[]> {
    const response =
      await this.client.request<NowPlayingResponse>(
        'getNowPlaying',
      )

    return (response.nowPlaying?.entry ?? [])
      .slice(0, limit)
      .map((song) => this.mapTrack(song))
  }

  async getArtists(): Promise<MusicArtist[]> {
    const response =
      await this.client.request<ArtistsResponse>(
        'getArtists',
      )

    const artists: MusicArtist[] = []

    for (const index of response.artists?.index ?? []) {
      artists.push(this.mapArtist(index.artist))
    }

    return artists
  }

  async getAlbums(
    limit = 50,
    offset = 0,
  ): Promise<MusicAlbum[]> {
    const response =
      await this.client.request<AlbumsResponse>(
        'getAlbumList2',
        {
          type: 'alphabeticalByName',
          size: limit,
          offset,
        },
      )

    return (response.albumList2?.album ?? []).map(
      (album) => this.mapAlbum(album),
    )
  }

  async getAlbumTracks(
    albumId: string,
  ): Promise<MusicTrack[]> {
    const response =
      await this.client.request<AlbumSongsResponse>(
        'getAlbum',
        {
          id: albumId,
        },
      )

    return (response.album ?? []).map(
      (song) => this.mapTrack(song),
    )
  }

  async getArtistTracks(
    artistId: string,
  ): Promise<MusicTrack[]> {
    const response =
      await this.client.request<ArtistResponse>(
        'getArtist',
        {
          id: artistId,
        },
      )

    return (response.artist?.song ?? []).map(
      (song) => this.mapTrack(song),
    )
  }

  async search(
    query: string,
  ): Promise<MusicSearchResults> {
    const response =
      await this.client.request<SearchResponse>(
        'search3',
        {
          query,
          artistCount: 50,
          albumCount: 50,
          songCount: 50,
        },
      )

    const result = response.searchResult3

    return {
      artists: (result?.artist ?? []).map(
        (artist) => this.mapArtist(artist),
      ),

      albums: (result?.album ?? []).map(
        (album) => this.mapAlbum(album),
      ),

      tracks: (result?.song ?? []).map(
        (song) => this.mapTrack(song),
      ),
    }
  }

  async getLyrics(
    trackId: string,
  ): Promise<MusicLyrics | null> {
    try {
      const response =
        await this.client.request<LyricsResponse>(
          'getLyricsBySongId',
          {
            id: trackId,
          },
        )

      const structured =
        response.lyricsList?.structuredLyrics?.[0]

      if (!structured) {
        return null
      }

      return {
        displayArtist: structured.displayArtist,
        displayTitle: structured.displayTitle,
        synced: structured.synced ?? false,

        lines: (structured.line ?? []).map(
          (line) => ({
            startTimeMs: line.start ?? 0,
            text: line.value ?? '',
          }),
        ),
      }
    } catch {
      return null
    }
  }

  async getStreamUrl(
    trackId: string,
  ): Promise<string> {
    return this.client.buildAuthenticatedUrl(
      'stream',
      {
        id: trackId,
      },
    )
  }

  async getCoverArtUrl(
    coverArtId: string,
    size?: number,
  ): Promise<string> {
    return this.client.buildAuthenticatedUrl(
      'getCoverArt',
      {
        id: coverArtId,
        ...(size !== undefined ? { size } : {}),
      },
    )
  }

  async setFavourite(
    trackId: string,
    favourite: boolean,
  ): Promise<void> {
    await this.client.request(
      favourite ? 'star' : 'unstar',
      {
        id: trackId,
      },
    )
  }

  async setRating(
    trackId: string,
    rating: number | null,
  ): Promise<void> {
    await this.client.request(
      'setRating',
      {
        id: trackId,
        rating: rating ?? 0,
      },
    )
  }

  async scrobble(
    trackId: string,
    submission = true,
  ): Promise<void> {
    await this.client.request(
      'scrobble',
      {
        id: trackId,
        submission,
      },
    )
  }

  async getPlaylists(): Promise<MusicPlaylist[]> {
    const response =
      await this.client.request<PlaylistsResponse>(
        'getPlaylists',
      )

    return (response.playlists?.playlist ?? []).map(
      (playlist) => ({
        id: playlist.id,
        name: playlist.name,
        trackCount: playlist.songCount,
        duration: playlist.duration,
        owner: playlist.owner,
        isPublic: playlist.public,

        coverArtUrl: playlist.coverArt
          ? this.client.buildAuthenticatedUrl(
              'getCoverArt',
              {
                id: playlist.coverArt,
              },
            )
          : undefined,
      }),
    )
  }

  async getPlaylistTracks(
    playlistId: string,
  ): Promise<MusicTrack[]> {
    const response =
      await this.client.request<PlaylistResponse>(
        'getPlaylist',
        {
          id: playlistId,
        },
      )

    return (response.playlist?.entry ?? []).map(
      (song) => this.mapTrack(song),
    )
  }

  private mapArtist(
    artist: NavidromeArtist,
  ): MusicArtist {
    return {
      id: artist.id,
      name: artist.name,
      albumCount: artist.albumCount,
      songCount: artist.songCount,
      imageUrl: artist.artistImageUrl,
    }
  }

  private mapAlbum(
    album: NavidromeAlbum,
  ): MusicAlbum {
    return {
      id: album.id,
      title: album.name,
      artistId: album.artistId,
      artistName: album.artist ?? 'Unknown Artist',
      year: album.year,
      genre: album.genre,
      songCount: album.songCount,
      duration: album.duration,
      coverArtId: album.coverArt,

      coverArtUrl: album.coverArt
        ? this.client.buildAuthenticatedUrl(
            'getCoverArt',
            {
              id: album.coverArt,
            },
          )
        : undefined,
    }
  }

  private mapTrack(
    song: NavidromeSong,
  ): MusicTrack {
    return {
      id: song.id,
      title: song.title,
      artistId: song.artistId,
      artistName: song.artist ?? 'Unknown Artist',
      albumId: song.albumId,
      albumName: song.album,
      albumArtistName: song.albumArtist,
      trackNumber: song.track,
      discNumber: song.discNumber,
      year: song.year,
      genre: song.genre,
      duration: song.duration,
      bitrate: song.bitRate,
      contentType: song.contentType,
      suffix: song.suffix,
      coverArtId: song.coverArt,

      coverArtUrl: song.coverArt
        ? this.client.buildAuthenticatedUrl(
            'getCoverArt',
            {
              id: song.coverArt,
            },
          )
        : undefined,
    }
  }
}