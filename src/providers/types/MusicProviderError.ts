export type MusicProviderErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_FAILED'
  | 'NOT_FOUND'
  | 'NOT_SUPPORTED'
  | 'SERVER_ERROR'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN'

export class MusicProviderError extends Error {
  readonly code: MusicProviderErrorCode

  constructor(
    code: MusicProviderErrorCode,
    message: string,
  ) {
    super(message)

    this.name = 'MusicProviderError'
    this.code = code
  }
}