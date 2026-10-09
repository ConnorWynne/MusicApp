
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  getLocalPlaylist,
  removeTrackFromLocalPlaylist,
  moveTrackInLocalPlaylist,
  type LocalPlaylist,
} from '../../services/playlistStorage'

import { usePlayer } from '../../player/usePlayer'

function formatDuration(duration?: number) {
  if (duration === undefined || duration <= 0) {
    return '--:--'
  }

  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function Playlist() {
  const { playlistId } = useParams<{ playlistId: string }>()
  const { currentTrack, isPlaying, playQueue } = usePlayer()

  const [playlist, setPlaylist] = useState<LocalPlaylist | null>(
    () => (playlistId ? getLocalPlaylist(playlistId) : null)
  )

  const [error, setError] = useState('')


  function refreshPlaylist() {
    if (!playlistId) return

    setPlaylist(getLocalPlaylist(playlistId))
  }

  function playTrack(index: number) {
    if (!playlist || playlist.tracks.length === 0) return

    void playQueue(playlist.tracks, index)
  }

  function removeTrack(trackId: string) {
    if (!playlistId) return

    try {
      removeTrackFromLocalPlaylist(playlistId, trackId)
      refreshPlaylist()
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Unable to remove track.',
      )
    }
  }

  function moveTrack(fromIndex: number, toIndex: number) {
    if (!playlistId) return

    try {
      moveTrackInLocalPlaylist(playlistId, fromIndex, toIndex)
      refreshPlaylist()
    } catch (moveError) {
      setError(
        moveError instanceof Error
          ? moveError.message
          : 'Unable to reorder tracks.',
      )
    }
  }

  if (!playlist) {
    return (
      <section className="library-page">
        <Link to="/library/playlists" className="back-link">
          ← Playlists
        </Link>
        <h2>Playlist not found</h2>
        <p className="library-message">
          This local playlist may have been deleted.
        </p>
      </section>
    )
  }

  const totalDuration = playlist.tracks.reduce(
    (total, track) => total + (track.duration ?? 0),
    0,
  )

  return (
    <section className="library-page">
      <Link to="/library/playlists" className="back-link">
        ← Playlists
      </Link>

      <div className="album-header">
        <div className="album-header-art">
          <div className="album-header-art-placeholder">♫</div>
        </div>

        <div className="album-header-info">
          <p className="eyebrow">LOCAL PLAYLIST</p>
          <h2>{playlist.name}</h2>

          {playlist.description && (
            <p className="album-artist">
              {playlist.description}
            </p>
          )}

          <p className="album-meta">
            {playlist.tracks.length}{' '}
            {playlist.tracks.length === 1 ? 'song' : 'songs'}
            {' · '}
            {formatDuration(totalDuration)}
          </p>

          {playlist.tracks.length > 0 && (
            <div className="album-actions">
              <button
                type="button"
                className="album-action-button album-action-primary"
                onClick={() => playTrack(0)}
              >
                ▶ Play
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="library-error">{error}</p>}

      {playlist.tracks.length === 0 ? (
        <div className="playlist-empty">
          <div className="playlist-empty-icon">♫</div>
          <h3>This playlist is empty</h3>
          <p>
            Add songs from All Songs to start building your playlist.
          </p>
          <Link
            to="/library/songs"
            className="album-action-button album-action-primary"
          >
            Browse songs
          </Link>
        </div>
      ) : (
        <div className="track-list">
          {playlist.tracks.map((track, index) => {
            const isCurrent = currentTrack?.id === track.id

            return (
              <div
                className={
                  isCurrent
                    ? 'playlist-track-row track-row-active'
                    : 'playlist-track-row'
                }
                key={`${track.id}-${index}`}
              >
                <button
                  type="button"
                  className="playlist-track-play"
                  onClick={() => playTrack(index)}
                  aria-label={`Play ${track.title}`}
                >
                  {isCurrent && isPlaying ? '▶' : index + 1}
                </button>

                <button
                  type="button"
                  className="playlist-track-info"
                  onClick={() => playTrack(index)}
                >
                  <span className="track-title">{track.title}</span>
                  <span className="track-artist">
                    {track.artistName}
                    {track.albumName ? ` · ${track.albumName}` : ''}
                  </span>
                </button>

                <span className="track-duration">
                  {formatDuration(track.duration)}
                </span>

                <div className="playlist-track-actions">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveTrack(index, index - 1)}
                    aria-label={`Move ${track.title} up`}
                    title="Move up"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    disabled={index === playlist.tracks.length - 1}
                    onClick={() => moveTrack(index, index + 1)}
                    aria-label={`Move ${track.title} down`}
                    title="Move down"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    className="playlist-remove-track"
                    onClick={() => removeTrack(track.id)}
                    aria-label={`Remove ${track.title}`}
                    title="Remove from playlist"
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Playlist
