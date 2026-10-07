import { createContext } from 'react'

import type { MusicTrack } from '../providers/types/MusicTypes'

export interface PlayerContextValue {
  currentTrack: MusicTrack | null
  isPlaying: boolean
  isLoading: boolean
  playbackError: string | null
  currentTime: number
  duration: number
  volume: number

  play: (
    track: MusicTrack,
  ) => Promise<void>

  pause: () => void

  togglePlayPause: () => Promise<void>

  seek: (time: number) => void

  setVolume: (volume: number) => void

  clearPlaybackError: () => void
}

export const PlayerContext =
  createContext<
    PlayerContextValue | undefined
  >(undefined)