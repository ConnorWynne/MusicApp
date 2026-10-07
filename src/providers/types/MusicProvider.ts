import type {
  MusicAlbum,
  MusicArtist,
  MusicLyrics,
  MusicPlaylist,
  MusicSearchResults,
  MusicTrack,
} from './MusicTypes'

import type { ServerConnection } from './ServerConnection'

export interface MusicProvider {
  readonly connection: ServerConnection

  /**
   * Verify that the server is reachable and the credentials work.
   */
  testConnection(): Promise<void>

  /**
   * Fetch recently added albums.
   */
  getRecentlyAddedAlbums(limit?: number): Promise<MusicAlbum[]>

  /**
   * Fetch recently played tracks.
   */
  getRecentlyPlayedTracks(limit?: number): Promise<MusicTrack[]>

  /**
   * Fetch artists.
   */
  getArtists(): Promise<MusicArtist[]>

  /**
   * Fetch albums.
   */
  getAlbums(limit?: number, offset?: number): Promise<MusicAlbum[]>

  /**
   * fetch a single album by its ID. Returns null if the album is not found.
   */
  getAlbum(albumId: string): Promise<MusicAlbum | null>

  /**
   * Fetch the tracks belonging to an album.
   */
  getAlbumTracks(albumId: string): Promise<MusicTrack[]>

  /**
   * Fetch tracks belonging to an artist.
   */
  getArtistTracks(artistId: string): Promise<MusicTrack[]>

  /**
   * Search the music library.
   */
  search(query: string): Promise<MusicSearchResults>

  /**
   * Get lyrics for a track.
   */
  getLyrics(trackId: string): Promise<MusicLyrics | null>

  /**
   * Get a playable stream URL for a track.
   */
  getStreamUrl(trackId: string): Promise<string>

  /**
   * Get album artwork.
   */
  getCoverArtUrl(
    coverArtId: string,
    size?: number,
  ): Promise<string>

  /**
   * Mark a track as a favourite.
   */
  setFavourite(trackId: string, favourite: boolean): Promise<void>

  /**
   * Set a rating from 1-5, or clear it.
   */
  setRating(trackId: string, rating: number | null): Promise<void>

  /**
   * Tell the server that a track was played.
   */
  scrobble(
    trackId: string,
    submission?: boolean,
  ): Promise<void>

  /**
   * Fetch playlists.
   */
  getPlaylists(): Promise<MusicPlaylist[]>

  /**
   * Fetch tracks in a playlist.
   */
  getPlaylistTracks(playlistId: string): Promise<MusicTrack[]>
}