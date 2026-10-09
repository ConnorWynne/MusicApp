import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useMusicProvider } from '../../providers/useMusicProviders'
import type { MusicAlbum } from '../../providers/types/MusicTypes'

function Albums() {
  const { provider } = useMusicProvider()

  const [albums, setAlbums] = useState<MusicAlbum[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (!provider) return

    const currentProvider = provider
    let cancelled = false

    async function loadAlbums() {
      setLoading(true)
      setError('')
      setAlbums([])
      setHasMore(true)

      try {
        const results = await currentProvider.getAlbums(100, 0)

        if (!cancelled) {
          setAlbums(results)
          setHasMore(results.length === 100)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load albums.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadAlbums()

    return () => {
      cancelled = true
    }
  }, [provider])

  async function loadMore() {
    if (!provider || loadingMore || !hasMore) return

    setLoadingMore(true)
    setError('')

    try {
      const results = await provider.getAlbums(100, albums.length)

      setAlbums((current) => [...current, ...results])
      setHasMore(results.length === 100)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load more albums.',
      )
    } finally {
      setLoadingMore(false)
    }
  }

  if (!provider) {
    return (
      <section className="library-page">
        <p className="eyebrow">LIBRARY</p>
        <h2>Albums</h2>
        <p>Connect a music server in Settings to browse albums.</p>
      </section>
    )
  }

  return (
    <section className="library-page">
      <p className="eyebrow">LIBRARY</p>
      <h2>Albums</h2>
      <p className="library-server">Albums in your music library</p>

      {loading && (
        <p className="library-message">Loading albums...</p>
      )}

      {error && (
        <p className="library-error">{error}</p>
      )}

      {!loading && !error && albums.length === 0 && (
        <p className="library-message">No albums were found.</p>
      )}

      {albums.length > 0 && (
        <>
          <div className="album-grid">
            {albums.map((album) => (
              <Link
                key={album.id}
                to={`/library/album/${encodeURIComponent(album.id)}`}
                className="album-card"
              >
                <div className="album-card-artwork">
                  {album.coverArtUrl ? (
                    <img
                      src={album.coverArtUrl}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span>♫</span>
                  )}
                </div>

                <div className="album-card-info">
                  <strong>{album.title}</strong>
                  <span>{album.artistName}</span>
                  {album.year && <span>{album.year}</span>}
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="song-list-more">
              <button
                type="button"
                className="library-load-more"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Albums