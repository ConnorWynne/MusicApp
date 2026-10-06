import { useEffect, useState } from 'react'

import { useMusicProvider } from '../../providers/useMusicProviders'
import type { MusicAlbum } from '../../providers/types/MusicTypes'

function Library() {
  const { provider, connection } = useMusicProvider()

  const [albums, setAlbums] = useState<MusicAlbum[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!provider) {
      return
    }

    const currentProvider = provider
    let cancelled = false

    async function loadAlbums() {
      setLoading(true)
      setError('')

      try {
        const results = await currentProvider.getAlbums(50, 0)

        if (!cancelled) {
          setAlbums(results)
        }
      } catch (loadError) {
        if (!cancelled) {
          if (loadError instanceof Error) {
            setError(loadError.message)
          } else {
            setError(
              'Unable to load your music library.',
            )
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadAlbums()

    return () => {
      cancelled = true
    }
  }, [provider])

  if (!provider) {
    return (
      <section>
        <p className="eyebrow">LIBRARY</p>

        <h2>Your music</h2>

        <p>
          Connect a music server in Settings to
          browse your library.
        </p>
      </section>
    )
  }

  return (
    <section className="library-page">
      <p className="eyebrow">LIBRARY</p>

      <h2>Your music</h2>

      <p className="library-server">
        Connected to {connection?.name}
      </p>

      {loading && (
        <p className="library-message">
          Loading your library...
        </p>
      )}

      {error && (
        <p className="library-error">
          {error}
        </p>
      )}

      {!loading && !error && albums.length === 0 && (
        <p className="library-message">
          No albums were found.
        </p>
      )}

      {albums.length > 0 && (
        <div className="album-grid">
          {albums.map((album) => (
            <article
              className="album-card"
              key={album.id}
            >
              <div className="album-art">
                {album.coverArtUrl ? (
                  <img
                    src={album.coverArtUrl}
                    alt={`${album.title} cover`}
                    loading="lazy"
                  />
                ) : (
                  <div className="album-art-placeholder">
                    ♪
                  </div>
                )}
              </div>

              <div className="album-card-info">
                <h3>{album.title}</h3>

                <p>{album.artistName}</p>

                {album.year && (
                  <span>{album.year}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Library