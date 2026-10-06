import { createContext } from 'react'

import type { MusicProvider } from './types/MusicProvider'
import type { ServerConnection } from './types/ServerConnection'

export interface MusicProviderContextValue {
  provider: MusicProvider | null
  connection: ServerConnection | null
  setProvider: (
    provider: MusicProvider,
    connection: ServerConnection,
  ) => void
  disconnect: () => void
}

export const MusicProviderContext =
  createContext<
    MusicProviderContextValue | undefined
  >(undefined)