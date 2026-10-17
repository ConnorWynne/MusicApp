
import type { MusicTrack } from '../providers/types/MusicTypes'

const STORAGE_KEY = 'resonance-listening-history'
const MAX_HISTORY = 100

export interface ListeningHistoryEntry {
  track: MusicTrack
  playedAt: number
}

export function getListeningHistory(): ListeningHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (entry): entry is ListeningHistoryEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        'track' in entry &&
        'playedAt' in entry &&
        typeof entry.playedAt === 'number',
    )
  } catch {
    return []
  }
}

export function recordTrackPlayed(track: MusicTrack): void {
  try {
    const history = getListeningHistory()

    const updated: ListeningHistoryEntry[] = [
      {
        track,
        playedAt: Date.now(),
      },
      ...history.filter(
        (entry) => entry.track.id !== track.id,
      ),
    ].slice(0, MAX_HISTORY)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated),
    )
  } catch (error) {
    console.error(
      '[Resonance] Failed to save listening history:',
      error,
    )
  }
}
