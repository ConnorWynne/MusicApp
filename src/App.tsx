import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

import Home from './pages/Home/Home'
import Library from './pages/Library/Library'
import Search from './pages/Search/Search'
import Settings from './pages/Settings/Settings'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <NavLink
            to="/"
            className="app-logo"
          >
            MusicApp
          </NavLink>

          <nav
            className="main-nav"
            aria-label="Main navigation"
          >
            <NavLink to="/" end>
              Home
            </NavLink>

            <NavLink to="/library">
              Library
            </NavLink>

            <NavLink to="/search">
              Search
            </NavLink>

            <NavLink to="/settings">
              Settings
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/library"
            element={<Library />}
          />
          <Route
            path="/search"
            element={<Search />}
          />
          <Route
            path="/settings"
            element={<Settings />}
          />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="mini-player">
          <div className="mini-player-info">
            <span className="mini-player-title">
              Nothing playing
            </span>

            <span className="mini-player-artist">
              Choose something from your library
            </span>
          </div>

          <button
            type="button"
            disabled
            aria-label="Play"
          >
            ▶
          </button>
        </div>

        <nav
          className="bottom-nav"
          aria-label="Mobile navigation"
        >
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/library">
            Library
          </NavLink>

          <NavLink to="/search">
            Search
          </NavLink>

          <NavLink to="/settings">
            Settings
          </NavLink>
        </nav>
      </footer>
    </div>
  )
}

export default App