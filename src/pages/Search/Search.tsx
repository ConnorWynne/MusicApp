
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { usePlayer } from '../../player/usePlayer'
import { useMusicProvider } from '../../providers/useMusicProviders'
import type {
  MusicAlbum,
  MusicArtist,
  MusicTrack,
} from '../../providers/types/MusicTypes'

import './Search.css'

function Search() {
  const { provider } = useMusicProvider()
  const { playQueue } = usePlayer()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [albums, setAlbums] = useState<MusicAlbum[]>([])
  const [artists, setArtists] = useState<MusicArtist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)


    useEffect(() => {
      const term = query.trim()
      let cancelled = false

      if (!provider || !term) {
        return () => {
          cancelled = true
        }
      }

      const timeout = window.setTimeout(async () => {
        setLoading(true)
        setError(null)

        try {
          const results = await provider.search(term)

          if (cancelled) return

          setTracks(results.tracks)
          setAlbums(results.albums)
          setArtists(results.artists)
          setHasSearched(true)
        } catch {
          if (cancelled) return

          setTracks([])
          setAlbums([])
          setArtists([])
          setError('Search failed. Check your server connection and try again.')
          setHasSearched(true)
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
        }
      }, 300)

      return () => {
        cancelled = true
        window.clearTimeout(timeout)
      }
    }, [query, provider])


  async function playTrack(track: MusicTrack) {
    const index = tracks.findIndex(item => item.id === track.id)

    if (index >= 0) {
      await playQueue(tracks, index)
    }
  }

  return (
    <section className="search-page">
      <header className="page-heading">
        <p className="eyebrow">DISCOVER</p>
        <h1>Search your music</h1>
        <p>Find tracks, albums and artists in your library.</p>
      </header>

      <label className="search-field">
        <span className="search-field-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="search"
          value={query}
          
          onChange={(event) => {
            setQuery(event.target.value)
            setHasSearched(false)

            if (!event.target.value.trim()) {
              setTracks([])
              setAlbums([])
              setArtists([])
              setError(null)
              setLoading(false)
            }
          }}

          placeholder="What do you want to listen to?"
          aria-label="Search tracks, albums and artists"
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </label>

      {!provider && (
        <div className="search-message">
          <h2>Connect your music server</h2>
          <p>Connect to Navidrome in Settings to search your library.</p>
          <Link to="/settings">Open Settings</Link>
        </div>
      )}

      {loading && (
        <p className="search-status" role="status">
          Searching your library…
        </p>
      )}

      {error && (
        <p className="search-error" role="alert">{error}</p>
      )}

      {!query.trim() && provider && (
        <p className="search-hint">
          Start typing to search your music.
        </p>
      )}

      {hasSearched && !loading && !error && (
        <>
          {tracks.length === 0 &&
            albums.length === 0 &&
            artists.length === 0 && (
              <div className="search-message">
                <h2>No results found</h2>
                <p>Try another song, artist or album name.</p>
              </div>
            )}

          {tracks.length > 0 && (
            <section className="search-section">
              <h2>Songs</h2>
              <div className="search-track-list">
                {tracks.map(track => (
                  <button
                    type="button"
                    className="search-track"
                    key={track.id}
                    onClick={() => void playTrack(track)}
                  >
                    <span className="search-track-art">
                      {track.coverArtUrl ? (
                        <img
                          src={track.coverArtUrl}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <span aria-hidden="true">♫</span>
                      )}
                    </span>
                    <span className="search-track-info">
                      <span className="search-result-title">
                        {track.title}
                      </span>
                      <span className="search-result-subtitle">
                        {track.artistName}
                        {track.albumName
                          ? ` · ${track.albumName}`
                          : ''}
                      </span>
                    </span>
                    <span className="search-play-icon" aria-hidden="true">
                      ▶
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {albums.length > 0 && (
            <section className="search-section">
              <h2>Albums</h2>
              <div className="search-card-grid">
                {albums.map(album => (
                  <button
                    type="button"
                    className="search-album-card"
                    key={album.id}
                    onClick={() =>
                      navigate(
                        `/library/album/${encodeURIComponent(album.id)}`,
                      )
                    }
                  >
                    {album.coverArtUrl ? (
                      <img
                        src={album.coverArtUrl}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <span className="search-placeholder-art">♫</span>
                    )}
                    <span className="search-result-title">
                      {album.title}
                    </span>
                    <span className="search-result-subtitle">
                      {album.artistName}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {artists.length > 0 && (
            <section className="search-section">
              <h2>Artists</h2>
              <div className="search-artist-list">
                {artists.map(artist => (
                  <Link
                    className="search-artist"
                    key={artist.id}
                    to={`/library/artist/${encodeURIComponent(artist.id)}`}
                  >
                    {artist.imageUrl ? (
                      <img src={artist.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="search-artist-placeholder">
                        ♫
                      </span>
                    )}
                    <span>{artist.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </section>
  )
}

export default Search
