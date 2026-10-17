
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMusicProvider } from '../../providers/useMusicProviders'
import { usePlayer } from '../../player/usePlayer'
import type { MusicAlbum, MusicTrack } from '../../providers/types/MusicTypes'
import { getListeningHistory } from '../../services/listeningHistory'
import './Home.css'
import TrackMoreMenu from '../../components/playlists/TrackMoreMenu'

function Home() {
  const { provider } = useMusicProvider()
  const { playQueue } = usePlayer()

  const [albums, setAlbums] = useState<MusicAlbum[]>([])
  const [recentTracks, setRecentTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const location = useLocation()


  useEffect(() => {
  let cancelled = false

  if (!provider) {
    return () => {
      cancelled = true
    }
  }

  async function loadHome() {
    try {
      const newAlbums = await provider!.getRecentlyAddedAlbums(12)

      if (cancelled) return

      setAlbums(newAlbums)
      setRecentTracks(
        getListeningHistory()
          .slice(0, 10)
          .map((entry) => entry.track),
      )
      setError(null)
    } catch {
      if (!cancelled) {
        setError('Unable to load your music. Check your server connection.')
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }

  void loadHome()

  return () => {
    cancelled = true
  }
}, [provider, location.key])


  async function playRecentTrack(track: MusicTrack) {
    const index = recentTracks.findIndex(item => item.id === track.id)

    if (index >= 0) {
      await playQueue(recentTracks, index)
    }
  }

  if (!provider) {
    return (
      <section className="home-page">
        <header className="home-heading">
          <p className="eyebrow">YOUR MUSIC. YOUR SERVERS.</p>
          <h1>Welcome to Resonance</h1>
          <p>Your music, all in one place.</p>
        </header>

        <section className="home-empty">
          <h2>Connect your music server</h2>
          <p>
            Connect to Navidrome in Settings to see your albums
            and recently played tracks here.
          </p>
          <Link to="/settings" className="home-action">
            Open Settings
          </Link>
        </section>

        <HomeShortcuts />
      </section>
    )
  }

  return (
    <section className="home-page">
      <header className="home-heading">
        <p className="eyebrow">YOUR MUSIC. YOUR SERVERS.</p>
        <h1>Welcome back</h1>
        <p>Your music, all in one place.</p>
      </header>

      <HomeShortcuts />

      {error && <p className="home-error" role="alert">{error}</p>}

      <section className="home-section">
        <div className="home-section-heading">
          <h2>Recently added</h2>
          <Link to="/library/albums">See all</Link>
        </div>

        {loading && albums.length === 0 ? (
          <p className="home-muted">Loading albums…</p>
        ) : albums.length > 0 ? (
          <div className="home-album-row">
            {albums.map(album => (
              <Link
                key={album.id}
                to={`/library/album/${encodeURIComponent(album.id)}`}
                className="home-album-card"
              >
                {album.coverArtUrl ? (
                  <img
                    src={album.coverArtUrl}
                    alt=""
                    className="home-album-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="home-album-cover home-artwork-placeholder">
                    <span aria-hidden="true">♫</span>
                  </div>
                )}

                <span className="home-album-title">{album.title}</span>
                <span className="home-album-artist">{album.artistName}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="home-muted">
            No recently added albums to show yet.
          </p>
        )}
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <h2>Recently played</h2>
          <Link to="/library/songs">Your songs</Link>
        </div>

        {loading && recentTracks.length === 0 ? (
          <p className="home-muted">Loading tracks…</p>
        ) : recentTracks.length > 0 ? (
<div className="home-track-list">
  {recentTracks.map((track, index) => (
    <div
      key={`${track.id}-${index}`}
      className="home-track-row"
    >
      <button
        type="button"
        className="home-track"
        onClick={() => void playRecentTrack(track)}
      >
        {track.coverArtUrl ? (
          <img
            src={track.coverArtUrl}
            alt=""
            className="home-track-cover"
            loading="lazy"
          />
        ) : (
          <div className="home-track-cover home-artwork-placeholder">
            <span aria-hidden="true">♫</span>
          </div>
        )}

        <span className="home-track-details">
          <span className="home-track-title">{track.title}</span>
          <span className="home-track-subtitle">
            {track.artistName}
            {track.albumName ? ` · ${track.albumName}` : ''}
          </span>
        </span>

        <span className="home-track-play" aria-hidden="true">▶</span>
      </button>

      <TrackMoreMenu track={track} />
    </div>
  ))}
</div>
        ) : (
          <p className="home-muted">
            Your recently played tracks will appear here when available.
          </p>
        )}
      </section>

      <section className="home-section home-discover">
        <h2>In the mood for something else?</h2>
        <p>Search your collection for your next favourite track.</p>
        <Link to="/search" className="home-action">
          Search your music →
        </Link>
      </section>
    </section>
  )
}

function HomeShortcuts() {
  return (
    <nav className="home-shortcuts" aria-label="Music shortcuts">
      <Link to="/library">Library</Link>
      <Link to="/library/albums">Albums</Link>
      <Link to="/library/artists">Artists</Link>
      <Link to="/search">Search</Link>
    </nav>
  )
}

export default Home
