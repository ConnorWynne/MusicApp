import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useMusicProvider } from '../../providers/useMusicProviders'
import { usePlayer } from '../../player/usePlayer'

import type {
  MusicAlbum,
  MusicTrack,
} from '../../providers/types/MusicTypes'

function Album() {
  const { albumId } = useParams<{ albumId: string }>()
  const { provider } = useMusicProvider()

  const {
    currentTrack,
    isPlaying,
    playQueue,
  } = usePlayer()

  const [album, setAlbum] =
    useState<MusicAlbum | null>(null)

  const [tracks, setTracks] =
    useState<MusicTrack[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (!provider || !albumId) {
      return
    }

    const currentProvider = provider
    const currentAlbumId = albumId

    let cancelled = false

    async function loadAlbum() {
      try {
        const [albumResult, albumTracks] =
          await Promise.all([
            currentProvider.getAlbum(
              currentAlbumId,
            ),
            currentProvider.getAlbumTracks(
              currentAlbumId,
            ),
          ])

        if (cancelled) {
          return
        }

        setAlbum(albumResult)
        setTracks(albumTracks)
        setLoading(false)
      } catch (loadError) {
        if (cancelled) {
          return
        }

        if (loadError instanceof Error) {
          setError(loadError.message)
        } else {
          setError(
            'Unable to load this album.',
          )
        }

        setLoading(false)
      }
    }

    void loadAlbum()

    return () => {
      cancelled = true
    }
  }, [provider, albumId])

  if (!provider) {
    return (
      <section>
        <p className="eyebrow">
          ALBUM
        </p>

        <h2>Not connected</h2>

        <p>
          Connect a music server before
          opening an album.
        </p>
      </section>
    )
  }

  if (!albumId) {
    return (
      <section>
        <p className="eyebrow">
          ALBUM
        </p>

        <h2>Invalid album</h2>

        <p>
          No album was specified.
        </p>

        <Link
          className="back-link"
          to="/library"
        >
          Back to library
        </Link>
      </section>
    )
  }

  if (loading) {
    return (
      <section>
        <p className="eyebrow">
          ALBUM
        </p>

        <h2>Loading...</h2>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <p className="eyebrow">
          ALBUM
        </p>

        <h2>Something went wrong</h2>

        <p className="library-error">
          {error}
        </p>

        <Link
          className="back-link"
          to="/library"
        >
          Back to library
        </Link>
      </section>
    )
  }

  if (!album) {
    return (
      <section>
        <p className="eyebrow">
          ALBUM
        </p>

        <h2>Album not found</h2>

        <Link
          className="back-link"
          to="/library"
        >
          Back to library
        </Link>
      </section>
    )
  }

  return (
    <section className="album-page">
      <Link
        className="back-link"
        to="/library"
      >
        ← Library
      </Link>

      <div className="album-header">
        <div className="album-header-art">
          {album.coverArtUrl ? (
            <img
              src={album.coverArtUrl}
              alt={`${album.title} cover`}
            />
          ) : (
            <div className="album-art-placeholder">
              ♪
            </div>
          )}
        </div>

        <div className="album-header-info">
          <p className="eyebrow">
            ALBUM
          </p>

          <h2>{album.title}</h2>

          <p className="album-artist">
            {album.artistName}
          </p>

          <p className="album-meta">
            {album.year ?? 'Unknown year'}
            {' · '}
            {tracks.length} tracks
          </p>
        </div>
      </div>

      <div className="track-list">
        {tracks.map((track, index) => {
          const isCurrentTrack =
            currentTrack?.id === track.id

          return (
            <button
              key={track.id}
              type="button"
              className={
                isCurrentTrack
                  ? 'track-row track-row-active'
                  : 'track-row'
              }
              onClick={() => {
                void playQueue(tracks, index,)
              }}
              aria-label={`Play ${track.title} by ${track.artistName}`}
            >
              <span className="track-number">
                {isCurrentTrack && isPlaying
                  ? '▶'
                  : track.trackNumber ??
                    index + 1}
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
                {formatDuration(
                  track.duration,
                )}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function formatDuration(
  seconds: number | undefined,
): string {
  if (seconds === undefined) {
    return '--:--'
  }

  const minutes = Math.floor(
    seconds / 60,
  )

  const remainingSeconds = Math.floor(
    seconds % 60,
  )

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

export default Album