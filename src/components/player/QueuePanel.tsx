import { usePlayer } from '../../player/usePlayer'

interface QueuePanelProps {
    onClose: () => void
}

function QueuePanel({ onClose, }: QueuePanelProps) {
  const {
    queue,
    queueIndex,
    playQueueTrack,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
  } = usePlayer()

  return (
    <section
      className="queue-panel"
      aria-label="Playback queue"
    >
      <div className="queue-panel-header">
        <div>
          <p className="eyebrow">
            UP NEXT
          </p>

          <h2>
            Queue
          </h2>
        </div>

        <div className="queue-panel-actions">
          <span className="queue-count">
            {queue.length}{' '}
            {queue.length === 1
              ? 'track'
              : 'tracks'}
          </span>

          <button
            type="button"
            className="queue-clear-button"
            disabled={
              queue.length === 0
            }
            onClick={clearQueue}
          >
            Clear
          </button>
          <button
            type="button"
            className="queue-close-button"
            aria-label="Close queue"
            onClick={onClose}
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
        </div>
      </div>

      {queue.length === 0 ? (
        <p className="queue-empty">
          Your playback queue is empty.
        </p>
      ) : (
        <div className="queue-list">
          {queue.map(
            (track, index) => (
              <div
                className={
                  index === queueIndex
                    ? 'queue-item queue-item-active'
                    : 'queue-item'
                }
                key={`${track.id}-${index}`}
              >
                <button
                  type="button"
                  className="queue-item-main"
                  onClick={() => {
                    void playQueueTrack(
                      index,
                    )
                  }}
                  aria-label={`Play ${track.title}`}
                >
                  <span className="queue-item-number">
                    {index === queueIndex ? (
                        <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        >
                        <path
                            d="M8 5v14l11-7z"
                            fill="currentColor"
                        />
                        </svg>
                    ) : (
                        index + 1
                    )}
                    </span>

                  <span className="queue-item-info">
                    <span className="queue-item-title">
                      {track.title}
                    </span>

                    <span className="queue-item-artist">
                      {track.artistName}
                    </span>
                  </span>
                </button>

                <div className="queue-item-actions">
                  <button
                    type="button"
                    className="queue-action"
                    disabled={
                      index === 0
                    }
                    onClick={() => {
                      moveQueueItem(
                        index,
                        index - 1,
                      )
                    }}
                    aria-label={`Move ${track.title} up`}
                  >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                        d="M12 19V5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        />

                        <path
                        d="M6 11l6-6 6 6"
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
                    className="queue-action"
                    disabled={
                      index ===
                      queue.length - 1
                    }
                    onClick={() => {
                      moveQueueItem(
                        index,
                        index + 1,
                      )
                    }}
                    aria-label={`Move ${track.title} down`}
                  >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                        d="M12 5v14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        />

                        <path
                        d="M6 13l6 6 6-6"
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
                    className="queue-action queue-action-remove"
                    onClick={() => {
                      removeFromQueue(
                        index,
                      )
                    }}
                    aria-label={`Remove ${track.title} from queue`}
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
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  )
}

export default QueuePanel