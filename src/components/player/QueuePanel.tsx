import { usePlayer } from '../../player/usePlayer'

import type { MusicTrack } from '../../providers/types/MusicTypes'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'

import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface QueuePanelProps {
    onClose: () => void
}


interface SortableQueueItemProps {
  track: MusicTrack
  index: number
  queueIndex: number
  onPlay: (index: number) => void
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  queueLength: number
}

function SortableQueueItem({
  track,
  index,
  queueIndex,
  onPlay,
  onMove,
  onRemove,
  queueLength,
}: SortableQueueItemProps) {
  const itemId = `${track.id}-${index}`

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId })

  const style = {
  transform: transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX ?? 1}) scaleY(${transform.scaleY ?? 1})`
    : undefined,
    transition,
    opacity: isDragging ? 0.55 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        index === queueIndex
          ? 'queue-item queue-item-active'
          : 'queue-item'
      }
    >
      <button
        type="button"
        className="queue-drag-handle"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${track.title} to reorder`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M8 5h8M8 12h8M8 19h8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        type="button"
        className="queue-item-main"
        onClick={() => onPlay(index)}
        aria-label={`Play ${track.title}`}
      >
        <span className="queue-item-number">
          {index === queueIndex ? '▶' : index + 1}
        </span>

        <span className="queue-item-info">
          <span className="queue-item-title">{track.title}</span>
          <span className="queue-item-artist">{track.artistName}</span>
        </span>
      </button>

      <div className="queue-item-actions">
        <button
          type="button"
          className="queue-action"
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          aria-label={`Move ${track.title} up`}
        >
          ↑
        </button>

        <button
          type="button"
          className="queue-action"
          disabled={index === queueLength - 1}
          onClick={() => onMove(index, index + 1)}
          aria-label={`Move ${track.title} down`}
        >
          ↓
        </button>

        <button
          type="button"
          className="queue-action queue-action-remove"
          onClick={() => onRemove(index)}
          aria-label={`Remove ${track.title} from queue`}
        >
          ×
        </button>
      </div>
    </div>
  )
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

  
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }),
  useSensor(TouchSensor, {
    activationConstraint: { delay: 180, tolerance: 8 },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
)

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event

  if (!over || active.id === over.id) return

  const from = queue.findIndex(
    (track, index) => `${track.id}-${index}` === active.id,
  )
  const to = queue.findIndex(
    (track, index) => `${track.id}-${index}` === over.id,
  )

  if (from !== -1 && to !== -1) {
    moveQueueItem(from, to)
  }
}


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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={queue.map((track, index) => `${track.id}-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="queue-list">
                {queue.map((track, index) => (
                  <SortableQueueItem
                    key={`${track.id}-${index}`}
                    track={track}
                    index={index}
                    queueIndex={queueIndex}
                    queueLength={queue.length}
                    onPlay={(trackIndex) => {
                      void playQueueTrack(trackIndex)
                    }}
                    onMove={moveQueueItem}
                    onRemove={removeFromQueue}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

    </section>
  )
}

export default QueuePanel