
import { useEffect, useId, useRef, useState } from 'react'

import type { MusicTrack } from '../../providers/types/MusicTypes'
import { usePlayer } from '../../player/usePlayer'
import { createPortal } from 'react-dom'
import { Capacitor } from '@capacitor/core'

import {
  addTrackToLocalPlaylist,
  getLocalPlaylists,
  type LocalPlaylist,
} from '../../services/playlistStorage'

interface TrackMoreMenuProps {
  track: MusicTrack
}

function TrackMoreMenu({ track }: TrackMoreMenuProps) {
  const { playNextTrack, addToQueue, testNativePlayback, } = usePlayer()

  const [menuOpen, setMenuOpen] = useState(false)
  const [playlistPickerOpen, setPlaylistPickerOpen] = useState(false)
  const [playlists, setPlaylists] = useState<LocalPlaylist[]>([])

  const menuId = useId()

  const menuRef = useRef<HTMLDivElement>(null)

  // Close this menu when another song's menu opens.
  useEffect(() => {
    function handleCloseOtherMenus(event: Event) {
      const customEvent = event as CustomEvent<string>

      if (customEvent.detail !== menuId) {
        setMenuOpen(false)
      }
    }

    window.addEventListener(
      'musicapp:close-track-menus',
      handleCloseOtherMenus,
    )

    return () => {
      window.removeEventListener(
        'musicapp:close-track-menus',
        handleCloseOtherMenus,
      )
    }
  }, [menuId])

  
useEffect(() => {
  if (!menuOpen) return

  function handleOutsidePointerDown(event: PointerEvent) {
    const target = event.target

    if (
      target instanceof Node &&
      menuRef.current &&
      !menuRef.current.contains(target)
    ) {
      setMenuOpen(false)
    }
  }

    function handleEscape(event: KeyboardEvent) {
        if (event.key === 'Escape') {
        setMenuOpen(false)
        }
    }

    document.addEventListener(
        'pointerdown',
        handleOutsidePointerDown,
        true,
    )
    document.addEventListener('keydown', handleEscape)

    return () => {
        document.removeEventListener(
        'pointerdown',
        handleOutsidePointerDown,
        true,
        )
        document.removeEventListener('keydown', handleEscape)
    }
    }, [menuOpen])


  function openPlaylistPicker() {
    setPlaylists(getLocalPlaylists())
    setPlaylistPickerOpen(true)
  }

  function addToPlaylist(playlistId: string) {
    addTrackToLocalPlaylist(playlistId, track)
    setPlaylists(getLocalPlaylists())
  }

  function playlistContainsTrack(playlist: LocalPlaylist) {
    return playlist.tracks.some(
      (playlistTrack) => playlistTrack.id === track.id,
    )
  }

  function toggleMenu() {
    if (!menuOpen) {
      window.dispatchEvent(
        new CustomEvent('musicapp:close-track-menus', {
          detail: menuId,
        }),
      )
    }

    setMenuOpen((open) => !open)
  }

  return (
    <div className="track-more-menu" ref={menuRef}>
      <button
        type="button"
        className="track-more-button"
        aria-label={`More options for ${track.title}`}
        aria-expanded={menuOpen}
        onClick={toggleMenu}
      >
        ⋯
      </button>

      {menuOpen && (
        <div className="track-more-dropdown">
        
          {Capacitor.isNativePlatform() && (
            <button
              type="button"
              onClick={async () => {
                setMenuOpen(false)
                await testNativePlayback(track)
              }}
            >
              Test native playback (temporary)
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playNextTrack(track)
              setMenuOpen(false)
            }}
          >
            Play next
          </button>

          <button
            type="button"
            onClick={() => {
              addToQueue(track)
              setMenuOpen(false)
            }}
          >
            Add to queue
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              openPlaylistPicker()
            }}
          >
            Add to playlist
          </button>
        </div>
      )}

      {playlistPickerOpen && createPortal(
        <div
          className="playlist-picker-backdrop"
          onClick={() => setPlaylistPickerOpen(false)}
        >
          <section
            className="playlist-picker"
            role="dialog"
            aria-modal="true"
            aria-label="Add to playlist"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="playlist-picker-header">
              <h3>Playlists</h3>

              <button
                type="button"
                aria-label="Close playlists"
                onClick={() => setPlaylistPickerOpen(false)}
              >
                ×
              </button>
            </header>

            {playlists.length === 0 ? (
              <p className="playlist-picker-empty">
                No playlists yet. Create one in your Library.
              </p>
            ) : (
              <div className="playlist-picker-list">
                {playlists.map((playlist) => {
                  const alreadyAdded = playlistContainsTrack(playlist)

                  return (
                    <div
                      className="playlist-picker-row"
                      key={playlist.id}
                    >
                      <span>{playlist.name}</span>

                      <button
                        type="button"
                        className={
                          alreadyAdded
                            ? 'playlist-picker-status is-added'
                            : 'playlist-picker-status'
                        }
                        aria-label={
                          alreadyAdded
                            ? `Already in ${playlist.name}`
                            : `Add to ${playlist.name}`
                        }
                        disabled={alreadyAdded}
                        onClick={() => addToPlaylist(playlist.id)}
                      >
                        {alreadyAdded ? '✓' : '+'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>,
        document.body,
      )}
    </div>
  )
}

export default TrackMoreMenu
