export interface MusicArtist {
  id: string
  name: string
  albumCount?: number
  songCount?: number
  imageUrl?: string
}

export interface MusicAlbum {
  id: string
  title: string
  artistId?: string
  artistName: string
  year?: number
  genre?: string
  songCount?: number
  duration?: number
  coverArtId?: string
  coverArtUrl?: string
}

export interface MusicTrack {
  id: string
  title: string
  artistId?: string
  artistName: string
  albumId?: string
  albumName?: string
  albumArtistName?: string
  trackNumber?: number
  discNumber?: number
  year?: number
  genre?: string
  duration?: number
  bitrate?: number
  contentType?: string
  suffix?: string
  coverArtId?: string
  coverArtUrl?: string
}

export interface MusicPlaylist {
  id: string
  name: string
  trackCount?: number
  duration?: number
  owner?: string
  isPublic?: boolean
  coverArtUrl?: string
}

export interface MusicLyricsLine {
  startTimeMs: number
  text: string
}

export interface MusicLyrics {
  displayArtist?: string
  displayTitle?: string
  synced: boolean
  lines: MusicLyricsLine[]
}

export interface MusicSearchResults {
  artists: MusicArtist[]
  albums: MusicAlbum[]
  tracks: MusicTrack[]
}