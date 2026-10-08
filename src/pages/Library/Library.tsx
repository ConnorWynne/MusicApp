import { Link } from 'react-router-dom'

import { useMusicProvider } from '../../providers/useMusicProviders'

function Library() {
  const { provider, connection } = useMusicProvider()

  if (!provider) {
    return (
      <section className="library-page">
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

      <div className="library-sections">
        <Link
          to="/library/songs"
          className="library-section-card"
        >
          <span
            className="library-section-icon"
            aria-hidden="true"
          >
            ♪
          </span>

          <span className="library-section-content">
            <strong>All Songs</strong>
            <span>
              Browse every song in your library
            </span>
          </span>
        </Link>

        <Link
          to="/library/artists"
          className="library-section-card"
        >
          <span
            className="library-section-icon"
            aria-hidden="true"
          >
            ♫
          </span>

          <span className="library-section-content">
            <strong>Artists</strong>
            <span>
              Browse music by artist
            </span>
          </span>
        </Link>

        <Link
          to="/library/albums"
          className="library-section-card"
        >
          <span
            className="library-section-icon"
            aria-hidden="true"
          >
            ▣
          </span>

          <span className="library-section-content">
            <strong>Albums</strong>
            <span>
              Browse your albums
            </span>
          </span>
        </Link>

        <Link
          to="/library/playlists"
          className="library-section-card"
        >
          <span
            className="library-section-icon"
            aria-hidden="true"
          >
            ♬
          </span>

          <span className="library-section-content">
            <strong>Playlists</strong>
            <span>
              Browse and manage playlists
            </span>
          </span>
        </Link>
      </div>
    </section>
  )
}

export default Library