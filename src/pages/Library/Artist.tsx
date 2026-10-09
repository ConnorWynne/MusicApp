import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

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

function Artist() {
  const { artistId } = useParams<{
    artistId: string
  }>()

  const { provider } = useMusicProvider()

  const {
    currentTrack,
    isPlaying,
    playQueue,
  } = usePlayer()

  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [artistName, setArtistName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!provider || !artistId) {
      return
    }

    const currentProvider = provider
    let cancelled = false

    async function loadTracks() {
        if(!artistId) {
            return
        }
      setLoading(true)
      setError('')

      try {
        const results =
          await currentProvider.getArtistTracks(
            artistId,
          )

        if (!cancelled) {
          setTracks(results)

          if(results.length > 0) {
            setArtistName(results[0].artistName)
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          if (loadError instanceof Error) {
            setError(loadError.message)
          } else {
            setError(
              'Unable to load this artist.',
            )
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadTracks()

    return () => {
      cancelled = true
    }
  }, [provider, artistId])

  async function playTrack(index: number) {
    await playQueue(tracks, index)
  }

  if (!provider) {
    return (
      <section>
        <p className="eyebrow">LIBRARY</p>

        <h2>Artist</h2>

        <p>
          Connect a music server in Settings to
          browse this artist.
        </p>
      </section>
    )
  }

  return (
    <section className="library-page">
      <Link
        to="/library/artists"
        className="back-link"
      >
        ← Artists
      </Link>

      <p className="eyebrow">ARTIST</p>

      <h2>{artistName || 'Artist'}</h2>

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
            This artist has no songs.
          </p>
        )}

      {tracks.length > 0 && (
        <>
          <p className="library-server">
            {tracks.length}{' '}
            {tracks.length === 1
              ? 'song'
              : 'songs'}
          </p>

          <div className="track-list">
            {tracks.map((track, index) => {
              const isCurrent =
                currentTrack?.id === track.id

              return (
                <div
                  className={
                    isCurrent
                      ? 'track-row track-row-active'
                      : 'track-row'
                  }
                  key={track.id}
                >
                  <button
                    type="button"
                    className="track-row-play"
                    onClick={() => {
                      void playTrack(index)
                    }}
                    aria-label={`Play ${track.title}`}
                  >
                    <span className="track-number">
                      {isCurrent && isPlaying ? '▶' : index + 1}
                    </span>

                    <span className="track-info">
                      <span className="track-title">{track.title}</span>
                      <span className="track-artist">
                        {track.albumName ?? 'Unknown Album'}
                      </span>
                    </span>

                    <span className="track-duration">
                      {formatDuration(track.duration)}
                    </span>
                  </button>

                  <TrackMoreMenu track={track} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}

export default Artist