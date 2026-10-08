import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useMusicProvider } from '../../providers/useMusicProviders'
import type { MusicArtist } from '../../providers/types/MusicTypes'

function Artists() {
  const { provider } = useMusicProvider()

  const [artists, setArtists] = useState<MusicArtist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!provider) {
      return
    }

    const currentProvider = provider
    let cancelled = false

    async function loadArtists() {
      setLoading(true)
      setError('')

      try {
        const results =
          await currentProvider.getArtists()

        if (!cancelled) {
          setArtists(results)
        }
      } catch (loadError) {
        if (!cancelled) {
          if (loadError instanceof Error) {
            setError(loadError.message)
          } else {
            setError(
              'Unable to load your artists.',
            )
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadArtists()

    return () => {
      cancelled = true
    }
  }, [provider])

  if (!provider) {
    return (
      <section>
        <p className="eyebrow">LIBRARY</p>

        <h2>Artists</h2>

        <p>
          Connect a music server in Settings to
          browse your artists.
        </p>
      </section>
    )
  }

  return (
    <section className="library-page">
      <p className="eyebrow">LIBRARY</p>

      <h2>Artists</h2>

      <p className="library-server">
        Artists in your music library
      </p>

      {loading && (
        <p className="library-message">
          Loading artists...
        </p>
      )}

      {error && (
        <p className="library-error">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        artists.length === 0 && (
          <p className="library-message">
            No artists were found.
          </p>
        )}

      {artists.length > 0 && (
        <div className="artist-grid">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              to={`/library/artist/${encodeURIComponent(
                artist.id,
              )}`}
              className="artist-card"
            >
              <div className="artist-card-icon">
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  '♪'
                )}
              </div>

              <div className="artist-card-info">
                <h3>{artist.name}</h3>

                {artist.songCount !== undefined && (
                  <span>
                    {artist.songCount}{' '}
                    {artist.songCount === 1
                      ? 'song'
                      : 'songs'}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default Artists