import {
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { MusicProviderContext } from './MusicProviderContext'
import type { MusicProvider } from './types/MusicProvider'
import type { ServerConnection } from './types/ServerConnection'

interface MusicProviderProviderProps {
  children: ReactNode
}

function MusicProviderProvider({
  children,
}: MusicProviderProviderProps) {
  const [provider, setProviderState] =
    useState<MusicProvider | null>(null)

  const [connection, setConnection] =
    useState<ServerConnection | null>(null)

  function setProvider(
    nextProvider: MusicProvider,
    nextConnection: ServerConnection,
  ) {
    setProviderState(nextProvider)
    setConnection(nextConnection)
  }

  function disconnect() {
    setProviderState(null)
    setConnection(null)
  }

  const value = useMemo(
    () => ({
      provider,
      connection,
      setProvider,
      disconnect,
    }),
    [provider, connection],
  )

  return (
    <MusicProviderContext.Provider value={value}>
      {children}
    </MusicProviderContext.Provider>
  )
}

export default MusicProviderProvider