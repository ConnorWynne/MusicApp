import { useContext } from 'react'

import {
  MusicProviderContext,
  type MusicProviderContextValue,
} from './MusicProviderContext'

export function useMusicProvider(): MusicProviderContextValue {
  const context = useContext(MusicProviderContext)

  if (!context) {
    throw new Error(
      'useMusicProvider must be used inside MusicProviderProvider',
    )
  }

  return context
}