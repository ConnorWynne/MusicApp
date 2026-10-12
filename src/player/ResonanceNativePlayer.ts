
import { registerPlugin } from '@capacitor/core'

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
}

export const ResonanceNativePlayer =
  registerPlugin<ResonancePlayerPlugin>('ResonancePlayer')
