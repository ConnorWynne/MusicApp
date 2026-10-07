import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { useMusicProvider } from '../providers/useMusicProviders'
import type { MusicTrack } from '../providers/types/MusicTypes'

import { PlayerContext } from './PlayerContext'

interface PlayerProviderProps {
  children: ReactNode
}

function getMediaErrorMessage(
  error: MediaError | null,
): string {
  if (!error) {
    return 'The audio stream could not be played.'
  }

  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return 'Audio playback was aborted.'

    case MediaError.MEDIA_ERR_NETWORK:
      return 'The audio stream could not be loaded from the music server.'

    case MediaError.MEDIA_ERR_DECODE:
      return 'The browser could not decode this audio stream.'

    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'This audio stream is not supported by the browser.'

    default:
      return 'The audio stream could not be played.'
  }
}

function getPlayErrorMessage(
  error: unknown,
): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'The browser blocked audio playback. Try clicking the track again.'
    }

    if (error.name === 'NotSupportedError') {
      return 'The browser does not support this audio stream.'
    }

    if (error.message) {
      return `Audio playback failed: ${error.message}`
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message
  }

  return 'Audio playback failed.'
}

function PlayerProvider({
  children,
}: PlayerProviderProps) {
  const { provider } =
    useMusicProvider()

  const audioRef =
    useRef<HTMLAudioElement | null>(null)

  /*
   * Every call to play() gets a new request ID.
   *
   * If the user clicks another track while the
   * previous stream URL is still being retrieved,
   * the old request will no longer be allowed to
   * replace the newer track.
   */
  const playRequestRef =
    useRef(0)

  const [currentTrack, setCurrentTrack] =
    useState<MusicTrack | null>(null)

  const [isPlaying, setIsPlaying] =
    useState(false)

  const [isLoading, setIsLoading] =
    useState(false)

  const [playbackError, setPlaybackError] =
    useState<string | null>(null)

  const [currentTime, setCurrentTime] =
    useState(0)

  const [duration, setDuration] =
    useState(0)

  const [volume, setVolumeState] =
    useState(1)

  /*
   * Create the audio element once.
   */
  useEffect(() => {
    const audio = new Audio()

    audio.preload = 'auto'
    audio.volume = volume

    audioRef.current = audio

    function handlePlay() {
      setIsPlaying(true)
      setIsLoading(false)
      setPlaybackError(null)
    }

    function handlePlaying() {
      setIsPlaying(true)
      setIsLoading(false)
      setPlaybackError(null)
    }

    function handlePause() {
      setIsPlaying(false)
    }

    function handleWaiting() {
      if (!audio.paused) {
        setIsLoading(true)
      }
    }

    function handleCanPlay() {
      setIsLoading(false)
    }

    function handleTimeUpdate() {
      setCurrentTime(
        audio.currentTime,
      )
    }

    function handleLoadedMetadata() {
      setDuration(
        Number.isFinite(audio.duration)
          ? audio.duration
          : 0,
      )
    }

    function handleEnded() {
      setIsPlaying(false)
      setIsLoading(false)
      setCurrentTime(0)
    }

    function handleError() {
      const message =
        getMediaErrorMessage(
          audio.error,
        )

      console.error(
        '[MusicApp] Audio element error:',
        {
          code: audio.error?.code,
          message: audio.error?.message,
          currentSrc: audio.currentSrc
            ? '[authenticated stream URL]'
            : '',
          networkState:
            audio.networkState,
          readyState:
            audio.readyState,
        },
      )

      setIsPlaying(false)
      setIsLoading(false)
      setPlaybackError(message)
    }

    audio.addEventListener(
      'play',
      handlePlay,
    )

    audio.addEventListener(
      'playing',
      handlePlaying,
    )

    audio.addEventListener(
      'pause',
      handlePause,
    )

    audio.addEventListener(
      'waiting',
      handleWaiting,
    )

    audio.addEventListener(
      'canplay',
      handleCanPlay,
    )

    audio.addEventListener(
      'timeupdate',
      handleTimeUpdate,
    )

    audio.addEventListener(
      'loadedmetadata',
      handleLoadedMetadata,
    )

    audio.addEventListener(
      'ended',
      handleEnded,
    )

    audio.addEventListener(
      'error',
      handleError,
    )

    return () => {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()

      audio.removeEventListener(
        'play',
        handlePlay,
      )

      audio.removeEventListener(
        'playing',
        handlePlaying,
      )

      audio.removeEventListener(
        'pause',
        handlePause,
      )

      audio.removeEventListener(
        'waiting',
        handleWaiting,
      )

      audio.removeEventListener(
        'canplay',
        handleCanPlay,
      )

      audio.removeEventListener(
        'timeupdate',
        handleTimeUpdate,
      )

      audio.removeEventListener(
        'loadedmetadata',
        handleLoadedMetadata,
      )

      audio.removeEventListener(
        'ended',
        handleEnded,
      )

      audio.removeEventListener(
        'error',
        handleError,
      )

      audioRef.current = null
    }
  }, [])

  /*
   * Keep the HTML audio element synchronized with
   * the React volume state.
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume =
        volume
    }
  }, [volume])


  async function play(
    track: MusicTrack,
  ): Promise<void> {
    if (!provider) {
      const message =
        'Connect a music server before playing music.'

      setPlaybackError(message)

      return
    }

    const audio =
      audioRef.current

    if (!audio) {
      const message =
        'The audio player is not available.'

      setPlaybackError(message)

      return
    }

    const requestId =
      ++playRequestRef.current

    setPlaybackError(null)
    setIsLoading(true)

    try {
      const isSameTrack =
        currentTrack?.id === track.id

      if (!isSameTrack) {
        /*
         * Ask the active music provider for the
         * authenticated stream URL.
         */
        const streamUrl =
          await provider.getStreamUrl(
            track.id,
          )

        /*
         * Another track may have been clicked
         * while we were waiting for the server.
         */
        if (
          requestId !==
          playRequestRef.current
        ) {
          return
        }

        audio.pause()

        audio.src = streamUrl
        audio.currentTime = 0

        /*
         * Explicitly tell the browser to load
         * the new stream.
         */
        audio.load()

        setCurrentTrack(track)
        setCurrentTime(0)
        setDuration(
          track.duration ?? 0,
        )
      }

      await audio.play()
    } catch (error) {
      if (
        requestId !==
        playRequestRef.current
      ) {
        return
      }

      const message =
        getPlayErrorMessage(error)

      console.error(
        '[MusicApp] Playback failed:',
        error,
      )

      setIsPlaying(false)
      setIsLoading(false)
      setPlaybackError(message)

      /*
       * Do not rethrow this.
       *
       * The player already exposed the failure
       * through playbackError, and this prevents
       * the album button's `void play()` from
       * creating an unhandled promise rejection.
       */
      return
    }
  }

  function pause() {
    audioRef.current?.pause()
    setIsLoading(false)
  }

  async function togglePlayPause() {
    const audio =
      audioRef.current

    if (
      !audio ||
      !currentTrack
    ) {
      return
    }

    if (audio.paused) {
      setPlaybackError(null)
      setIsLoading(true)

      try {
        await audio.play()
      } catch (error) {
        const message =
          getPlayErrorMessage(error)

        console.error(
          '[MusicApp] Playback failed:',
          error,
        )

        setIsPlaying(false)
        setIsLoading(false)
        setPlaybackError(message)
      }
    } else {
      audio.pause()
    }
  }

  function seek(time: number) {
    const audio =
      audioRef.current

    if (!audio) {
      return
    }

    const nextTime =
      Math.max(
        0,
        Math.min(
          time,
          audio.duration || time,
        ),
      )

    audio.currentTime =
      nextTime

    setCurrentTime(
      nextTime,
    )
  }

  function setVolume(
    volumeValue: number,
  ) {
    const nextVolume =
      Math.max(
        0,
        Math.min(
          1,
          volumeValue,
        ),
      )

    setVolumeState(
      nextVolume,
    )

    if (audioRef.current) {
      audioRef.current.volume =
        nextVolume
    }
  }

  function clearPlaybackError() {
    setPlaybackError(null)
  }

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      isLoading,
      playbackError,
      currentTime,
      duration,
      volume,
      play,
      pause,
      togglePlayPause,
      seek,
      setVolume,
      clearPlaybackError,
    }),
    [
      currentTrack,
      isPlaying,
      isLoading,
      playbackError,
      currentTime,
      duration,
      volume,
    ],
  )

  return (
    <PlayerContext.Provider
      value={value}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export default PlayerProvider