import { md5 } from 'js-md5'

import { MusicProviderError } from '../types/MusicProviderError'

const API_VERSION = '1.16.1'
const CLIENT_NAME = 'Resonance'

interface SubsonicResponse {
  'subsonic-response'?: {
    status?: string
    version?: string
    error?: {
      code?: number
      message?: string
    }
    [key: string]: unknown
  }
}

export class OpenSubsonicClient {
  private readonly baseUrl: string
  private readonly username: string
  private readonly password: string

  constructor(
    baseUrl: string,
    username: string,
    password: string,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.username = username
    this.password = password
  }

  async request<T>(
    endpoint: string,
    parameters: Record<string, string | number | boolean | undefined> = {},
  ): Promise<T> {
    const salt = crypto.randomUUID().replace(/-/g, '')
    const token = md5(`${this.password}${salt}`)

    const query = new URLSearchParams({
      u: this.username,
      t: token,
      s: salt,
      v: API_VERSION,
      c: CLIENT_NAME,
      f: 'json',
    })

    for (const [key, value] of Object.entries(parameters)) {
      if (value !== undefined) {
        query.set(key, String(value))
      }
    }

    const url = `${this.baseUrl}/rest/${endpoint}?${query.toString()}`

    let response: Response


    try {
      response = await fetch(url)
    } catch (error) {
      console.error(
        '[Resonance] Navidrome request failed: ' +
          JSON.stringify({
            endpoint,
            errorName:
              error instanceof Error
                ? error.name
                : typeof error,
            errorMessage:
              error instanceof Error
                ? error.message
                : String(error),
          }),
      )

      throw new MusicProviderError(
        'NETWORK_ERROR',
        'Unable to connect to the music server.',
      )
    }


    if (!response.ok) {
      throw new MusicProviderError(
        'SERVER_ERROR',
        `Music server returned HTTP ${response.status}.`,
      )
    }

    let data: SubsonicResponse

    try {
      data = (await response.json()) as SubsonicResponse
    } catch {
      throw new MusicProviderError(
        'INVALID_RESPONSE',
        'The music server returned an invalid response.',
      )
    }

    const result = data['subsonic-response']

    if (!result) {
      throw new MusicProviderError(
        'INVALID_RESPONSE',
        'The music server returned an unexpected response.',
      )
    }

    if (result.status !== 'ok') {
      const errorCode = result.error?.code
      const errorMessage =
        result.error?.message ?? 'The music server rejected the request.'

      if (errorCode === 40 || errorCode === 41) {
        throw new MusicProviderError(
          'AUTHENTICATION_FAILED',
          errorMessage,
        )
      }

      if (errorCode === 70) {
        throw new MusicProviderError(
          'NOT_FOUND',
          errorMessage,
        )
      }

      if (errorCode === 50) {
        throw new MusicProviderError(
          'NOT_SUPPORTED',
          errorMessage,
        )
      }

      throw new MusicProviderError(
        'SERVER_ERROR',
        errorMessage,
      )
    }

    return result as T
  }

    buildAuthenticatedUrl(
        endpoint: string,
        parameters: Record<string, string | number | boolean> = {},
    ): string {
        const salt = crypto.randomUUID().replace(/-/g, '')
        const token = md5(`${this.password}${salt}`)

        const query = new URLSearchParams({
        u: this.username,
        t: token,
        s: salt,
        v: API_VERSION,
        c: CLIENT_NAME,
        })

        for (const [key, value] of Object.entries(parameters)) {
        query.set(key, String(value))
        }

        return `${this.baseUrl}/rest/${endpoint}?${query.toString()}`
    }
}