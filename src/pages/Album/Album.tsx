import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useMusicProvider } from '../../providers/useMusicProviders'
import type {
  MusicAlbum,
  MusicTrack,
} from '../../providers/types/MusicTypes'
import { usePlayer } from '../../player/usePlayer'

function formatDuration(duration?: number) {
  if (!duration || duration <= 0) {
    return '--:--'
  }

  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function Album() {
  const { albumId } = useParams<{ albumId: string }>()
  const { provider } = useMusicProvider()

  const {
    currentTrack,
    isPlaying,
    playQueue,
    toggleShuffle,
  } = usePlayer()

  const [album, setAlbum] = useState<MusicAlbum | null>(null)
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!provider || !albumId) {
      return
    }

    const currentProvider = provider
    let cancelled = false

    async function loadAlbum() {
      if (!albumId) {
        return
      }

      setLoading(true)
      setError('')
      setAlbum(null)
      setTracks([])

      try {
        const [albumResult, trackResults] = await Promise.all([
          currentProvider.getAlbum(albumId),
          currentProvider.getAlbumTracks(albumId),
        ])

        if (!cancelled) {
          setAlbum(albumResult)
          setTracks(trackResults)

          if (!albumResult) {
            setError('Album not found.')
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load this album.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadAlbum()

    return () => {
      cancelled = true
    }
  }, [provider, albumId])

  async function playTrack(index: number) {
    await playQueue(tracks, index)
  }

  function shuffleAlbum() {
    if (tracks.length === 0) return

    toggleShuffle()
    void playQueue(tracks, 0)
    }

  if (!provider) {
    return (
      <section className="library-page">
        <p className="eyebrow">LIBRARY</p>
        <h2>Album</h2>
        <p>
          Connect a music server in Settings to browse your albums.
        </p>
      </section>
    )
  }

  return (
    <section className="library-page">
      <Link to="/library/albums" className="back-link">
        ← Albums
      </Link>

      {loading && (
        <p className="library-message">Loading album...</p>
      )}

      {error && (
        <p className="library-error">{error}</p>
      )}

      {!loading && album && (
        <>
            <div className="album-header">
            <div className="album-header-art">
                {album.coverArtUrl ? (
                <img src={album.coverArtUrl} alt={`${album.title} album artwork`} />
                ) : (
                <div className="album-header-art-placeholder">
                    ♫
                </div>
                )}
            </div>

            <div className="album-header-info">
                <p className="eyebrow">ALBUM</p>

                <h2>{album.title}</h2>

                <p className="album-artist">
                {album.artistName}
                </p>

                <p className="album-meta">
                {[
                    album.year,
                    `${tracks.length} ${tracks.length === 1 ? 'song' : 'songs'}`,
                ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                {tracks.length > 0 && (
                <div className="album-actions">
                    <button
                    type="button"
                    className="album-action-button album-action-primary"
                    onClick={() => void playTrack(0)}
                    >
                    <span aria-hidden="true">▶</span>
                    Play
                    </button>

                    <button
                    type="button"
                    className="album-action-button album-action-secondary"
                    onClick={shuffleAlbum}
                    >
                    <span aria-hidden="true">⤨</span>
                    Shuffle
                    </button>
                </div>
                )}
            </div>
            </div>


          {tracks.length === 0 && !loading && (
            <p className="library-message">
              This album has no tracks.
            </p>
          )}

          {tracks.length > 0 && (
            <div className="track-list">
              {tracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id

                return (
                  <button
                    type="button"
                    className={
                      isCurrent
                        ? 'track-row track-row-active'
                        : 'track-row'
                    }
                    key={track.id}
                    onClick={() => void playTrack(index)}
                  >
                    <span className="track-number">
                      {isCurrent && isPlaying ? '▶' : index + 1}
                    </span>

                    <span className="track-info">
                      <span className="track-title">
                        {track.title}
                      </span>

                      <span className="track-artist">
                        {track.artistName}
                      </span>
                    </span>

                    <span className="track-duration">
                      {formatDuration(track.duration)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Album
