
import type { MusicTrack } from '../providers/types/MusicTypes'

const STORAGE_KEY = 'musicapp.local-playlists.v1'

export interface LocalPlaylist {
  id: string
  name: string
  description: string
  tracks: MusicTrack[]
  createdAt: string
  updatedAt: string
}

function readPlaylists(): LocalPlaylist[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (item): item is LocalPlaylist =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.description === 'string' &&
        Array.isArray(item.tracks),
    )
  } catch {
    return []
  }
}

function writePlaylists(playlists: LocalPlaylist[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists))
}

function createId(): string {
  return crypto.randomUUID()
}

export function getLocalPlaylists(): LocalPlaylist[] {
  return readPlaylists().sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime(),
  )
}

export function getLocalPlaylist(
  playlistId: string,
): LocalPlaylist | null {
  return readPlaylists().find(
    (playlist) => playlist.id === playlistId,
  ) ?? null
}

export function createLocalPlaylist(
  name: string,
  description = '',
): LocalPlaylist {
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error('Playlist name cannot be empty.')
  }

  const now = new Date().toISOString()

  const playlist: LocalPlaylist = {
    id: createId(),
    name: trimmedName,
    description: description.trim(),
    tracks: [],
    createdAt: now,
    updatedAt: now,
  }

  writePlaylists([...readPlaylists(), playlist])

  return playlist
}

export function updateLocalPlaylist(
  playlistId: string,
  changes: { name?: string; description?: string },
): LocalPlaylist {
  const playlists = readPlaylists()
  const index = playlists.findIndex(
    (playlist) => playlist.id === playlistId,
  )

  if (index === -1) {
    throw new Error('Playlist not found.')
  }

  const current = playlists[index]
  const name = changes.name?.trim() ?? current.name

  if (!name) {
    throw new Error('Playlist name cannot be empty.')
  }

  const updated: LocalPlaylist = {
    ...current,
    name,
    description:
      changes.description?.trim() ?? current.description,
    updatedAt: new Date().toISOString(),
  }

  playlists[index] = updated
  writePlaylists(playlists)

  return updated
}

export function deleteLocalPlaylist(
  playlistId: string,
): void {
  writePlaylists(
    readPlaylists().filter(
      (playlist) => playlist.id !== playlistId,
    ),
  )
}

export function addTrackToLocalPlaylist(
  playlistId: string,
  track: MusicTrack,
): LocalPlaylist {
  const playlists = readPlaylists()
  const playlist = playlists.find(
    (item) => item.id === playlistId,
  )

  if (!playlist) {
    throw new Error('Playlist not found.')
  }

  // Avoid adding the same track twice.
  if (playlist.tracks.some((item) => item.id === track.id)) {
    return playlist
  }

  playlist.tracks.push(track)
  playlist.updatedAt = new Date().toISOString()

  writePlaylists(playlists)

  return playlist
}

export function removeTrackFromLocalPlaylist(
  playlistId: string,
  trackId: string,
): LocalPlaylist {
  const playlists = readPlaylists()
  const playlist = playlists.find(
    (item) => item.id === playlistId,
  )

  if (!playlist) {
    throw new Error('Playlist not found.')
  }

  playlist.tracks = playlist.tracks.filter(
    (track) => track.id !== trackId,
  )
  playlist.updatedAt = new Date().toISOString()

  writePlaylists(playlists)

  return playlist
}

export function moveTrackInLocalPlaylist(
  playlistId: string,
  fromIndex: number,
  toIndex: number,
): LocalPlaylist {
  const playlists = readPlaylists()
  const playlist = playlists.find(
    (item) => item.id === playlistId,
  )

  if (!playlist) {
    throw new Error('Playlist not found.')
  }

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= playlist.tracks.length ||
    toIndex >= playlist.tracks.length
  ) {
    return playlist
  }

  const [track] = playlist.tracks.splice(fromIndex, 1)
  playlist.tracks.splice(toIndex, 0, track)
  playlist.updatedAt = new Date().toISOString()

  writePlaylists(playlists)

  return playlist
}
