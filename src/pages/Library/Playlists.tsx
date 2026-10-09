
import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  createLocalPlaylist,
  deleteLocalPlaylist,
  getLocalPlaylists,
  updateLocalPlaylist,
  type LocalPlaylist,
} from '../../services/playlistStorage'

function Playlists() {
  const [playlists, setPlaylists] = useState<LocalPlaylist[]>(
    () => getLocalPlaylists(),
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlaylist, setEditingPlaylist] =
    useState<LocalPlaylist | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  function openCreateDialog() {
    setEditingPlaylist(null)
    setName('')
    setDescription('')
    setError('')
    setDialogOpen(true)
  }

  function openEditDialog(playlist: LocalPlaylist) {
    setEditingPlaylist(playlist)
    setName(playlist.name)
    setDescription(playlist.description)
    setError('')
    setDialogOpen(true)
  }

  function savePlaylist() {
    try {
      if (editingPlaylist) {
        updateLocalPlaylist(editingPlaylist.id, {
          name,
          description,
        })
      } else {
        createLocalPlaylist(name, description)
      }

      setPlaylists(getLocalPlaylists())
      setDialogOpen(false)
      setError('')
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save playlist.',
      )
    }
  }

  function removePlaylist(playlist: LocalPlaylist) {
    const confirmed = window.confirm(
      `Delete "${playlist.name}"? This won't delete any music files.`,
    )

    if (!confirmed) return

    try {
      deleteLocalPlaylist(playlist.id)
      setPlaylists(getLocalPlaylists())
    } catch {
      setError('Unable to delete playlist.')
    }
  }

  return (
    <section className="library-page">
      <p className="eyebrow">LIBRARY</p>

      <div className="playlist-page-heading">
        <div>
          <h2>Playlists</h2>
          <p className="library-server">
            Your personal music collections
          </p>
        </div>

        <button
          type="button"
          className="album-action-button album-action-primary"
          onClick={openCreateDialog}
        >
          + Create playlist
        </button>
      </div>

      {error && !dialogOpen && (
        <p className="library-error">{error}</p>
      )}

      {playlists.length === 0 ? (
        <div className="playlist-empty">
          <div className="playlist-empty-icon">♫</div>
          <h3>Your playlists start here</h3>
          <p>
            Create a playlist, then add songs from your library.
          </p>
          <button
            type="button"
            className="album-action-button album-action-secondary"
            onClick={openCreateDialog}
          >
            Create your first playlist
          </button>
        </div>
      ) : (
        <div className="playlist-grid">
          {playlists.map((playlist) => (
            <article className="playlist-card" key={playlist.id}>
              <Link
                to={`/library/playlist/${encodeURIComponent(playlist.id)}`}
                className="playlist-card-link"
              >
                <div className="playlist-card-art">
                  <span>♫</span>
                </div>

                <div className="playlist-card-info">
                  <strong>{playlist.name}</strong>
                  <span>
                    {playlist.tracks.length}{' '}
                    {playlist.tracks.length === 1 ? 'song' : 'songs'}
                  </span>
                  {playlist.description && (
                    <span>{playlist.description}</span>
                  )}
                </div>
              </Link>

              <div className="playlist-card-actions">
                <button
                  type="button"
                  onClick={() => openEditDialog(playlist)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="playlist-delete-button"
                  onClick={() => removePlaylist(playlist)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {dialogOpen && (
        <div
          className="playlist-dialog-backdrop"
          onClick={() => setDialogOpen(false)}
        >
          <section
            className="playlist-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="playlist-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="playlist-dialog-title">
              {editingPlaylist ? 'Edit playlist' : 'Create playlist'}
            </h3>

            <label htmlFor="playlist-name">Name</label>
            <input
              id="playlist-name"
              autoFocus
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Late night listening"
            />

            <label htmlFor="playlist-description">
              Description <span>(optional)</span>
            </label>
            <textarea
              id="playlist-description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What is this playlist for?"
            />

            {error && (
              <p className="library-error">{error}</p>
            )}

            <div className="playlist-dialog-actions">
              <button
                type="button"
                className="album-action-button album-action-secondary"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="album-action-button album-action-primary"
                onClick={savePlaylist}
              >
                {editingPlaylist ? 'Save changes' : 'Create'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default Playlists
