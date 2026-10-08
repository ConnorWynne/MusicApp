import { usePlayer } from '../../player/usePlayer'

interface ExpandedPlayerProps {
  onClose: () => void
}

function ExpandedPlayer({
  onClose,
}: ExpandedPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    shuffle,
    repeatMode,
    togglePlayPause,
    toggleShuffle,
    cycleRepeatMode,
    next,
    previous,
    seek,
    canGoNext,
    canGoPrevious,
  } = usePlayer()

  if (!currentTrack) {
    return null
  }

  return (
    <section
      className="expanded-player"
      aria-label="Now playing"
    >
      <button
        type="button"
        className="expanded-player-close"
        onClick={onClose}
        aria-label="Close player"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="expanded-player-content">
        <div className="expanded-player-artwork">
          {currentTrack.coverArtUrl ? (
            <img
              src={
                currentTrack.coverArtUrl
              }
              alt={`${currentTrack.title} artwork`}
            />
          ) : (
            <div
              className="expanded-player-artwork-placeholder"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="expanded-player-info">
          <h1>
            {currentTrack.title}
          </h1>

          <p>
            {currentTrack.artistName}
          </p>

          {currentTrack.albumName && (
            <span>
              {currentTrack.albumName}
            </span>
          )}
        </div>

        <div className="expanded-player-actions">
          <button
            type="button"
            aria-label={
              shuffle
                ? 'Turn shuffle off'
                : 'Turn shuffle on'
            }
            className={
              shuffle
                ? 'expanded-player-control expanded-player-control-active'
                : 'expanded-player-control'
            }
            onClick={toggleShuffle}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M4 7h3c4 0 6 10 10 10h3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M17 14l3 3-3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M4 17h3c1.5 0 2.5-1 3.5-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M14 9.5C15 8 16 7 17 7h3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M17 4l3 3-3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            className="expanded-player-control"
            disabled={!canGoPrevious}
            onClick={() => {
              void previous()
            }}
            aria-label="Previous track"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M6 5v14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M18 6l-9 6 9 6z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            type="button"
            className={ isPlaying ? 'expanded-player-play expanded-player-play-playing' : 'expanded-player-play'}
            onClick={() => {
              void togglePlayPause()
            }}
            aria-label={
              isPlaying
                ? 'Pause'
                : 'Play'
            }
          >
            {isLoading ? (
              <span
                className="expanded-player-loading"
                aria-hidden="true"
              />
            ) : isPlaying ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M7 5v14M17 5v14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M8 5v14l11-7z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="expanded-player-control"
            disabled={!canGoNext}
            onClick={() => {
              void next()
            }}
            aria-label="Next track"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M18 5v14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M6 6l9 6-9 6z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            type="button"
           className={
              repeatMode === 'all'
                ? 'expanded-player-control expanded-player-control-repeat-all'
                : repeatMode === 'one'
                  ? 'expanded-player-control expanded-player-control-repeat-one'
                  : 'expanded-player-control'
            }
            onClick={cycleRepeatMode}
            aria-label={`Repeat: ${repeatMode}`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M7 7h10l-2.5-2.5M17 17H7l2.5 2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M17 7a5 5 0 010 10M7 17a5 5 0 010-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="expanded-player-progress">
          <span>
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(event) => {
              seek(
                Number(event.target.value),
              )
            }}
            aria-label="Track progress"
          />

          <span>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </section>
  )
}

function formatTime(
  seconds: number,
): string {
  if (!Number.isFinite(seconds)) {
    return '0:00'
  }

  const minutes =
    Math.floor(seconds / 60)

  const remainingSeconds =
    Math.floor(seconds % 60)

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

export default ExpandedPlayer