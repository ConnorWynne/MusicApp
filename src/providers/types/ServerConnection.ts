export type MusicProviderType =
  | 'navidrome'
  | 'jellyfin'
  | 'unknown'

export interface ServerConnection {
  id: string
  name: string
  type: MusicProviderType
  url: string
  username: string
}