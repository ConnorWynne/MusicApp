import { useEffect, useState } from 'react'

import { useMusicProvider } from '../../providers/useMusicProviders'
import type { MusicTrack } from '../../providers/types/MusicTypes'
import { usePlayer } from '../../player/usePlayer'
import TrackMoreMenu from '../../components/playlists/TrackMoreMenu'

function formatDuration(duration?: number) {
  if (!duration || duration <= 0) {
    return '--:--'
  }

  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return `${minutes}:${seconds
    .toString()
    .padStart(2, '0')}`
}

function Songs() {
  const { provider } = useMusicProvider()

  const {
    currentTrack,
    isPlaying,
    playQueue,
  } = usePlayer()

  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (!provider) {
      return
    }

    const currentProvider = provider
    let cancelled = false

    async function loadSongs() {
      setLoading(true)
      setError('')
      setTracks([])
      setHasMore(true)

      try {
        const results =
          await currentProvider.getTracks(100, 0)

        if (!cancelled) {
          setTracks(results)
          setHasMore(results.length === 100)
        }
      } catch (loadError) {
        if (!cancelled) {
          if (loadError instanceof Error) {
            setError(loadError.message)
          } else {
            setError(
              'Unable to load your songs.',
            )
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadSongs()

    return () => {
      cancelled = true
    }
  }, [provider])

  async function loadMore() {
    if (
      !provider ||
      loadingMore ||
      !hasMore
    ) {
      return
    }

    setLoadingMore(true)

    try {
      const results =
        await provider.getTracks(
          100,
          tracks.length,
        )

      setTracks((currentTracks) => [
        ...currentTracks,
        ...results,
      ])

      setHasMore(results.length === 100)
    } catch (loadError) {
      if (loadError instanceof Error) {
        setError(loadError.message)
      } else {
        setError(
          'Unable to load more songs.',
        )
      }
    } finally {
      setLoadingMore(false)
    }
  }

  async function playTrack(index: number) {
    await playQueue(tracks, index)
  }

  if (!provider) {
    return (
      <section>
        <p className="eyebrow">LIBRARY</p>

        <h2>All Songs</h2>

        <p>
          Connect a music server in Settings to
          browse your songs.
        </p>
      </section>
    )
  }

  return (
    <section className="library-page">
      <p className="eyebrow">LIBRARY</p>

      <h2>All Songs</h2>

      <p className="library-server">
        Every song in your music library
      </p>

      {loading && (
        <p className="library-message">
          Loading songs...
        </p>
      )}

      {error && (
        <p className="library-error">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        tracks.length === 0 && (
          <p className="library-message">
            No songs were found.
          </p>
        )}

      {tracks.length > 0 && (
        <>
          <div className="song-list">
            {tracks.map((track, index) => {
              const isCurrent =
                currentTrack?.id === track.id
              
                  return (
                    <div
                      className={
                        isCurrent
                          ? 'song-row song-row-active'
                          : 'song-row'
                      }
                      key={track.id}
                    >
                      <button
                        type="button"
                        className="song-row-play"
                        onClick={() => {
                          void playTrack(index)
                        }}
                        aria-label={`Play ${track.title}`}
                      >
                        <span className="song-row-number">
                          {isCurrent && isPlaying ? '▶' : index + 1}
                        </span>

                        <span className="song-row-info">
                          <strong>{track.title}</strong>

                          <span>
                            {track.artistName}
                            {track.albumName ? ` • ${track.albumName}` : ''}
                          </span>
                        </span>

                        <span className="song-row-duration">
                          {formatDuration(track.duration)}
                        </span>
                      </button>

                      <TrackMoreMenu track={track} />
                    </div>
                  )
            })}
          </div>

          {hasMore && (
            <div className="song-list-more">
              <button
                type="button"
                className="library-load-more"
                disabled={loadingMore}
                onClick={() => {
                  void loadMore()
                }}
              >
                {loadingMore
                  ? 'Loading...'
                  : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Songs