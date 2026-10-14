
import { registerPlugin } from '@capacitor/core'


export interface ResonancePlaybackState {
  title: string
  artist: string
  album: string
  isPlaying: boolean
  isLoading: boolean
  playbackState: number
  durationMs: number
  positionMs: number
  error: string
}

export interface ResonancePlaybackStateEvent {
  playbackState: ResonancePlaybackState
}


export interface ResonancePlayerPlugin {
  playTrack(options: {
    url: string
    title: string
    artist?: string
    album?: string
  }): Promise<{ accepted: boolean }>

  pause(): Promise<void>

  resume(): Promise<void>

  seekTo(options: {
    positionMs: number
  }): Promise<void>

  
  addListener(
    eventName: 'playbackState',
    listenerFunc: (state: ResonancePlaybackState) => void,
  ): Promise<{ remove: () => Promise<void> }>

    addListener(
    eventName: 'trackEnded',
    listenerFunc: () => void,
  ): Promise<{ remove: () => Promise<void> }>

    addListener(
    eventName: 'nativeNavigation',
    listenerFunc: (event: {
      action: 'next' | 'previous'
    }) => void,
  ): Promise<{ remove: () => Promise<void> }>

}

export const ResonanceNativePlayer =
  registerPlugin<ResonancePlayerPlugin>('ResonancePlayer')
