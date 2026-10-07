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

import type { RepeatMode, } from './PlayerContext'

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
   * Queue state.
   *
   * React state is used for the UI.
   * Refs are used by the audio event handlers,
   * because the audio element only gets created once.
   */
  const [queue, setQueue] =
    useState<MusicTrack[]>([])

  const [queueIndex, setQueueIndex] =
    useState(-1)

  const queueRef =
    useRef<MusicTrack[]>([])

  const queueIndexRef =
    useRef(-1)

  const providerRef =
    useRef(provider)

  /*
   * Keep the provider ref current without
   * putting provider into the audio setup effect.
   */
  useEffect(() => {
    providerRef.current = provider
  }, [provider])

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

  const [shuffle, setShuffle] = useState(false)
  const [repeatMode, setRepeatMode] =
    useState<RepeatMode>('off')

  const shuffleRef = useRef(false)
  const repeatModeRef =
  useRef<RepeatMode>('off')

  /*
   * Update the queue in both React state and
   * refs so event handlers always see the
   * latest queue.
   */
  function updateQueue(
    nextQueue: MusicTrack[],
    nextIndex: number,
  ) {
    queueRef.current = nextQueue
    queueIndexRef.current =
      nextIndex

    setQueue(nextQueue)
    setQueueIndex(nextIndex)
  }

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

        const handleEnded = () => {
        const currentQueue =
            queueRef.current

        const currentIndex =
            queueIndexRef.current

        const currentShuffle =
            shuffleRef.current

        const currentRepeatMode =
            repeatModeRef.current

        if (currentRepeatMode === 'one') {
            void playTrackAtIndex(
            currentIndex,
            )

            return
        }

        if (
            currentShuffle &&
            currentQueue.length > 1
        ) {
            const availableIndexes =
            currentQueue
                .map((_, index) => index)
                .filter(
                (index) =>
                    index !== currentIndex,
                )

            const randomIndex =
            availableIndexes[
                Math.floor(
                Math.random() *
                    availableIndexes.length,
                )
            ]

            void playTrackAtIndex(
            randomIndex,
            )

            return
        }

        const nextIndex =
            currentIndex + 1

        if (
            nextIndex >=
            currentQueue.length
        ) {
            if (
            currentRepeatMode === 'all'
            ) {
            void playTrackAtIndex(0)
            return
            }

            setIsPlaying(false)
            return
        }

        void playTrackAtIndex(
            nextIndex,
        )
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
   * Keep volume synchronized with the
   * audio element.
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume =
        volume
    }
  }, [volume])

  /*
   * Load a specific queue entry.
   *
   * This is kept separate from playQueue()
   * so the ended event can use it.
   */
  async function playTrackAtIndex(
    index: number,
    track?: MusicTrack,
  ): Promise<void> {
    const activeProvider =
      providerRef.current

    const audio =
      audioRef.current

    if (!activeProvider) {
      const message =
        'Connect a music server before playing music.'

      setPlaybackError(message)
      return
    }

    if (!audio) {
      const message =
        'The audio player is not available.'

      setPlaybackError(message)
      return
    }

    const queueTrack =
      track ?? queueRef.current[index]

    if (!queueTrack) {
      return
    }

    const requestId =
      ++playRequestRef.current

    setPlaybackError(null)
    setIsLoading(true)

    try {
      const streamUrl =
        await activeProvider.getStreamUrl(
          queueTrack.id,
        )

      /*
       * A different track may have been
       * requested while we waited.
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
      audio.load()

      queueIndexRef.current =
        index

      setQueueIndex(index)
      setCurrentTrack(queueTrack)
      setCurrentTime(0)
      setDuration(
        queueTrack.duration ?? 0,
      )

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
    }
  }

  /*
   * Play one track as a one-item queue.
   *
   * This preserves the existing play()
   * behavior for callers that only have a track.
   */
  async function play(
    track: MusicTrack,
  ): Promise<void> {
    updateQueue([track], 0)

    await playTrackAtIndex(
      0,
      track,
    )
  }

  /*
   * Start playback using a complete queue.
   *
   * Example:
   *
   * playQueue(albumTracks, 4)
   *
   * starts track 5 and retains tracks 6+
   * as upcoming tracks.
   */
  async function playQueue(
    tracks: MusicTrack[],
    startIndex = 0,
  ): Promise<void> {
    if (tracks.length === 0) {
      return
    }

    const safeIndex =
      Math.max(
        0,
        Math.min(
          startIndex,
          tracks.length - 1,
        ),
      )

    const nextQueue =
      [...tracks]

    updateQueue(
      nextQueue,
      safeIndex,
    )

    const track =
      nextQueue[safeIndex]

    if (!track) {
      return
    }

    await playTrackAtIndex(
      safeIndex,
      track,
    )
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

    const toggleShuffle = () => {
    setShuffle((current) => {
        const next = !current

        shuffleRef.current = next

        return next
    })
    }

    const cycleRepeatMode = () => {
    setRepeatMode((current) => {
        let next: RepeatMode

        if (current === 'off') {
        next = 'all'
        } else if (current === 'all') {
        next = 'one'
        } else {
        next = 'off'
        }

        repeatModeRef.current = next

        return next
    })
    }

  async function next(): Promise<void> {
    const tracks =
      queueRef.current

    const currentIndex =
      queueIndexRef.current

    const nextIndex =
      currentIndex + 1

    if (
      nextIndex >= tracks.length
    ) {
      return
    }

    const nextTrack =
      tracks[nextIndex]

    if (!nextTrack) {
      return
    }

    await playTrackAtIndex(
      nextIndex,
      nextTrack,
    )
  }

  async function previous(): Promise<void> {
    const audio =
      audioRef.current

    if (!audio) {
      return
    }

    /*
     * Standard music-player behavior:
     *
     * If we're more than 3 seconds into
     * the current song, restart it.
     *
     * Otherwise go to the previous track.
     */
    if (audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }

    const tracks =
      queueRef.current

    const currentIndex =
      queueIndexRef.current

    const previousIndex =
      currentIndex - 1

    if (previousIndex < 0) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }

    const previousTrack =
      tracks[previousIndex]

    if (!previousTrack) {
      return
    }

    await playTrackAtIndex(
      previousIndex,
      previousTrack,
    )
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
      queue,
      queueIndex,

      isPlaying,
      isLoading,
      playbackError,

      currentTime,
      duration,
      volume,

      shuffle,
      repeatMode,

      play,
      playQueue,

      pause,
      togglePlayPause,

      next,
      previous,

      seek,
      setVolume,

      toggleShuffle,
      cycleRepeatMode,

      clearPlaybackError,
    }),
    [
      currentTrack,
      queue,
      queueIndex,
      isPlaying,
      isLoading,
      playbackError,
      currentTime,
      duration,
      volume,
      shuffle,
      repeatMode,
      toggleShuffle,
      cycleRepeatMode,
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