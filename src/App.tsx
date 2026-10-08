import type {CSSProperties } from 'react'

import {
  NavLink,
  Route,
  Routes,
} from 'react-router-dom'

import { usePlayer } from './player/usePlayer'

import { useState } from 'react'

import './App.css'

import Home from './pages/Home/Home'
import Library from './pages/Library/Library'
import Search from './pages/Search/Search'
import Settings from './pages/Settings/Settings'
import Album from './pages/Album/Album'
import QueuePanel from './components/player/QueuePanel'
import ExpandedPlayer from './components/player/ExpandedPlayer'


function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }


  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

function PreviousIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="player-icon"
    >
      <path
        d="M6 5h2v14H6zM18 6.5L10 12l8 5.5V6.5z"
        fill="currentColor"
      />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="player-icon"
    >
      <path
        d="M16 5h2v14h-2zM6 6.5L14 12l-8 5.5V6.5z"
        fill="currentColor"
      />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="player-icon"
    >
      <path
        d="M8 5.5v13L18 12 8 5.5z"
        fill="currentColor"
      />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="player-icon"
    >
      <path
        d="M7 5h4v14H7zM13 5h4v14h-4z"
        fill="currentColor"
      />
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="player-icon"
    >
      <path
        d="M17 4h3v3h-2V6.8c-1.8.1-3 .8-4.1 2.3l-1.2 1.7-1.4-1 1.2-1.7C13.9 6.1 15.4 5.2 18 5.1V4h-1zm3 13h-3v2h3v-2zm-1.9-2.3c-1.1-.1-2.1-.7-3-1.8l-4.2-5.3C9.8 6 8.2 5 6 5H4v2h2c1.5 0 2.5.6 3.4 1.7l4.2 5.3c1.3 1.7 2.8 2.6 4.5 2.7v1.2l2.8-2.1-2.8-2.1v1zM4 17h2c1.5 0 2.5-.6 3.4-1.7l1-1.3-1.5-1-1 1.3C7.3 15.4 6.7 15 6 15H4v2z"
        fill="currentColor"
      />
    </svg>
  )
}

function RepeatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="player-icon"
    >
      <path
        d="M7 5h9.2l-2-2L15.6 1.6 20 6l-4.4 4.4-1.4-1.4 2-2H7a3 3 0 0 0-3 3v1H2v-1a5 5 0 0 1 5-5zm10 14H7.8l2 2-1.4 1.4L4 18l4.4-4.4 1.4 1.4-2 2H17a3 3 0 0 0 3-3v-1h2v1a5 5 0 0 1-5 5z"
        fill="currentColor"
      />
    </svg>
  )
}

function App() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    playbackError,
    currentTime,
    duration,
    shuffle,
    repeatMode,
    canGoNext,
    canGoPrevious,
    togglePlayPause,
    toggleShuffle,
    cycleRepeatMode,
    next,
    previous,
    seek,
  } = usePlayer()


  const [isSeeking, setIsSeeking] = useState(false)
  const [seekPosition, setSeekPosition] = useState(0)
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [isExpandedPlayerOpen, setIsExpandedPlayerOpen] = useState(false)

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
            <NavLink
              to="/"
              end
            >
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
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/library"
            element={<Library />}
          />
          
          <Route
            path="/library/songs"
            element={
              <section className="library-page">
                <p className="eyebrow">LIBRARY</p>
                <h2>All Songs</h2>
                <p className="library-message">
                  All Songs coming next.
                </p>
              </section>
            }
          />

          <Route
            path="/library/artists"
            element={
              <section className="library-page">
                <p className="eyebrow">LIBRARY</p>
                <h2>Artists</h2>
                <p className="library-message">
                  Artists coming next.
                </p>
              </section>
            }
          />

          <Route
            path="/library/albums"
            element={
              <section className="library-page">
                <p className="eyebrow">LIBRARY</p>
                <h2>Albums</h2>
                <p className="library-message">
                  Albums coming next.
                </p>
              </section>
            }
          />

          <Route
            path="/library/playlists"
            element={
              <section className="library-page">
                <p className="eyebrow">LIBRARY</p>
                <h2>Playlists</h2>
                <p className="library-message">
                  Playlists coming next.
                </p>
              </section>
            }
          />

          <Route
            path="/library/album/:albumId"
            element={<Album />}
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
          {isQueueOpen && (
          <QueuePanel
              onClose={() => {
                setIsQueueOpen(false)
              }}
            />
          )}
          <div className="player-progress">
            <span className="player-time">
              {formatTime(
                isSeeking
                  ? seekPosition
                  : currentTime,
              )}
            </span>

            <input
              className="player-progress-input"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={
                isSeeking
                  ? seekPosition
                  : Math.min(
                      currentTime,
                      duration || 0,
                    )
              }
              disabled={
                !currentTrack ||
                duration <= 0
              }
              aria-label="Track progress"
              onPointerDown={() => {
                setIsSeeking(true)
                setSeekPosition(currentTime)
              }}
              onChange={(event) => {
                setSeekPosition(
                  Number(event.target.value),
                )
              }}
              onPointerUp={(event) => {
                const position = Number(
                  event.currentTarget.value,
                )

                setIsSeeking(false)
                seek(position)
              }}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' ||
                  event.key === ' '
                ) {
                  const position = Number(
                    event.currentTarget.value,
                  )

                  setIsSeeking(false)
                  seek(position)
                }
              }}
              style={{
                '--player-progress': `${
                  duration > 0
                    ? (
                        ((isSeeking
                          ? seekPosition
                          : currentTime) /
                          duration) *
                        100
                      )
                    : 0
                }%`,
              } as CSSProperties}
            />

            <span className="player-time">
              {formatTime(duration)}
            </span>
          </div>
          <div className="mini-player-main">
            <button type="button" className="mini-player-info" disabled={!currentTrack} onClick={() => { setIsExpandedPlayerOpen(true) }}>
              <span className="mini-player-title">
                {isLoading
                  ? 'Loading audio…'
                  : currentTrack?.title ??
                    'Nothing playing'}
              </span>

              <span
                className={
                  playbackError
                    ? 'mini-player-artist mini-player-error'
                    : 'mini-player-artist'
                }
              >
                {playbackError ??
                  currentTrack?.artistName ??
                  'Choose something from your library'}
              </span>
            </button>

            <div className="mini-player-controls-row">
              <button
                type="button"
                className={
                  isQueueOpen
                    ? 'player-control player-control-active'
                    : 'player-control'
                }
                onClick={() => {
                  setIsQueueOpen(
                    current => !current,
                  )
                }}
                aria-label={
                  isQueueOpen
                    ? 'Close queue'
                    : 'Open queue'
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M4 6h16M4 12h10M4 18h7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 15v6M15 18h6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="player-control-wrapper">
                <button
                  type="button"
                  className={
                    shuffle
                      ? 'player-control player-control-active'
                      : 'player-control'
                  }
                  disabled={!currentTrack}
                  aria-label={
                    shuffle
                      ? 'Disable shuffle'
                      : 'Enable shuffle'
                  }
                  onClick={() => {
                    toggleShuffle()
                  }}
                >
                  <ShuffleIcon />
                </button>

                <span className="player-control-tooltip">
                  {shuffle ? 'Shuffle: On' : 'Shuffle: Off'}
                </span>
              </div>

              <div className="mini-player-controls">
              <div className="player-control-wrapper">
                <button
                  type="button"
                  className="player-control"
                  disabled={!canGoPrevious}
                  aria-label="Previous"
                  onClick={() => {
                    void previous()
                  }}
                >
                  <PreviousIcon />
                </button>

                <span className="player-control-tooltip">
                  Previous
                </span>
              </div>

              <div className="player-control-wrapper">
                <button
                  type="button"
                  className={
                    isPlaying
                      ? 'player-control player-control-main player-control-playing'
                      : 'player-control player-control-main'
                  }
                  disabled={!currentTrack}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  onClick={() => {
                    void togglePlayPause()
                  }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>

                <span className="player-control-tooltip">
                  {isPlaying ? 'Pause' : 'Play'}
                </span>
              </div>

              <div className="player-control-wrapper">
                <button
                  type="button"
                  className="player-control"
                  disabled={!canGoNext}
                  aria-label="Next track"
                  onClick={() => {
                    void next()
                  }}
                >
                  <NextIcon />
                </button>

                <span className="player-control-tooltip">
                  Next
                </span>
              </div>
              <div className="player-control-wrapper">
                <button
                  type="button"
                  className={
                    repeatMode === 'all'
                      ? 'player-control player-control-repeat-all'
                      : repeatMode === 'one'
                        ? 'player-control player-control-repeat-one'
                        : 'player-control'
                  }
                  disabled={!currentTrack}
                  aria-label={`Repeat: ${repeatMode}`}
                  onClick={() => {
                    cycleRepeatMode()
                  }}
                >
                  <RepeatIcon />
                </button>

                <span className="player-control-tooltip">
                  {repeatMode === 'all'
                    ? 'Repeat: All'
                    : repeatMode === 'one'
                      ? 'Repeat: One'
                      : 'Repeat: Off'}
                </span>
              </div>
              </div>
            </div>
          </div>
        </div>

        <nav
          className="bottom-nav"
          aria-label="Mobile navigation"
        >
          <NavLink
            to="/"
            end
          >
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
              {isExpandedPlayerOpen && (
            <ExpandedPlayer
              onClose={() => {
                setIsExpandedPlayerOpen(false)
              }}
            />
          )}
    </div>
  )
}

export default App