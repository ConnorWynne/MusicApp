import { useState } from 'react'

import { NavidromeProvider } from '../../providers/navidrome/NavidromeProvider'
import { useMusicProvider } from '../../providers/useMusicProviders'
import type { ServerConnection } from '../../providers/types/ServerConnection'

function Settings() {
  const { provider, connection, setProvider, disconnect } =
    useMusicProvider()

  const [serverUrl, setServerUrl] = useState(
    connection?.url ??
      'https://music.alphamonke.ooguy.com',
  )

  const [username, setUsername] = useState(
    connection?.username ?? '',
  )

  const [password, setPassword] = useState('')

  const [status, setStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >(provider ? 'success' : 'idle')

  const [message, setMessage] = useState(
    provider ? 'Connected successfully.' : '',
  )

  async function handleTestConnection() {
    setStatus('testing')
    setMessage('Testing connection...')

    const nextConnection: ServerConnection = {
      id: 'navidrome-server',
      name: 'Navidrome',
      type: 'navidrome',
      url: serverUrl.trim(),
      username: username.trim(),
    }

    try {
      const nextProvider = new NavidromeProvider(
        nextConnection,
        password,
      )

      await nextProvider.testConnection()

      setProvider(
        nextProvider,
        nextConnection,
      )

      setStatus('success')
      setMessage('Connected successfully.')
      setPassword('')
    } catch (error) {
      setStatus('error')

      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage(
          'Unable to connect to the server.',
        )
      }
    }
  }

  function handleDisconnect() {
    disconnect()

    setPassword('')
    setStatus('idle')
    setMessage('Disconnected.')
  }

  return (
    <section className="settings-page">
      <p className="eyebrow">SETTINGS</p>

      <h2>Music server</h2>

      <p>
        Connect Resonance to your Navidrome server.
      </p>

      <form
        className="server-form"
        onSubmit={(event) => {
          event.preventDefault()
          void handleTestConnection()
        }}
      >
        <label htmlFor="server-url">
          Server URL
        </label>

        <input
          id="server-url"
          type="url"
          value={serverUrl}
          onChange={(event) => {
            setServerUrl(event.target.value)
            setStatus('idle')
            setMessage('')
          }}
          placeholder="https://music.example.com"
          autoComplete="url"
          required
        />

        <label htmlFor="server-username">
          Username
        </label>

        <input
          id="server-username"
          type="text"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value)
            setStatus('idle')
            setMessage('')
          }}
          placeholder="Navidrome username"
          autoComplete="username"
          required
        />

        <label htmlFor="server-password">
          Password
        </label>

        <input
          id="server-password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            setStatus('idle')
            setMessage('')
          }}
          placeholder={
            provider
              ? 'Enter password to reconnect'
              : 'Navidrome password'
          }
          autoComplete="current-password"
          required={!provider}
        />

        <button
          type="submit"
          disabled={status === 'testing'}
        >
          {status === 'testing'
            ? 'Testing...'
            : provider
              ? 'Reconnect'
              : 'Connect'}
        </button>
      </form>

      {message && (
        <div
          className={`connection-status connection-status-${status}`}
          role="status"
        >
          {message}
        </div>
      )}

      {provider && (
        <button
          type="button"
          className="disconnect-button"
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      )}
    </section>
  )
}

export default Settings