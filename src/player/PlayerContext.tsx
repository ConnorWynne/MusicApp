import { createContext } from 'react'

import type { MusicTrack } from '../providers/types/MusicTypes'

export type RepeatMode = 'off' | 'all' | 'one'

export interface PlayerContextValue {
  currentTrack: MusicTrack | null
  queue: MusicTrack[]
  queueIndex: number
  repeatMode: RepeatMode
  shuffle: boolean

  canGoNext: boolean
  canGoPrevious: boolean

  isPlaying: boolean
  isLoading: boolean
  playbackError: string | null
  cycleRepeatMode: () => void
  toggleShuffle: () => void

  currentTime: number
  duration: number
  volume: number

  play: (
    track: MusicTrack,
  ) => Promise<void>

  playNextTrack: (track: MusicTrack) => void
  addToQueue: (track: MusicTrack) => void

  playQueue: (
    tracks: MusicTrack[],
    startIndex?: number,
  ) => Promise<void>

  playQueueTrack: (
    index: number,
  ) => void

  removeFromQueue: (
    index: number,
  ) => void

  moveQueueItem: (
    fromIndex: number,
    toIndex: number,    
  ) => void

  clearQueue: () => void

  pause: () => void

  togglePlayPause: () => Promise<void>

  next: () => Promise<void>

  previous: () => Promise<void>

  seek: (time: number) => void

  setVolume: (volume: number) => void

  clearPlaybackError: () => void
}

export const PlayerContext =
  createContext<
    PlayerContextValue | undefined
  >(undefined)