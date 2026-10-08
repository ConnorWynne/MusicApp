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

    const shuffleOrderRef =
    useRef<number[]>([])

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

  async function playQueueTrack(
    index: number,
  ): Promise<void> {
    const tracks =
      queueRef.current

      const track = tracks[index]

      if (!track) {
        return
      }

      await playTrackAtIndex(
        index,
        track,
      )
    }

      function removeFromQueue(
            index: number,
        ): void {
            const currentQueue =
            queueRef.current

            if (
            index < 0 ||
            index >= currentQueue.length
            ) {
            return
            }

            const currentIndex =
            queueIndexRef.current

            const nextQueue =
            currentQueue.filter(
                (_, queueIndex) =>
                queueIndex !== index,
            )

            if (nextQueue.length === 0) {
            audioRef.current?.pause()

            if (audioRef.current) {
                audioRef.current.removeAttribute('src')
                audioRef.current.load()
            }

            queueRef.current = []
            queueIndexRef.current = -1

            setQueue([])
            setQueueIndex(-1)
            setCurrentTrack(null)
            setCurrentTime(0)
            setDuration(0)
            setIsPlaying(false)
            setIsLoading(false)

            return
            }

            let nextIndex = currentIndex

            if (index < currentIndex) {
            nextIndex -= 1
            }

            if (index === currentIndex) {
            nextIndex = Math.min(
                currentIndex,
                nextQueue.length - 1,
            )
            }

            const nextTrack = nextQueue[nextIndex]
            updateQueue(
            nextQueue,
            nextIndex,
            )

            if (index === currentIndex && nextTrack) {
                void playTrackAtIndex(nextIndex, nextTrack,)
            }
        }
  
      function moveQueueItem(
        fromIndex: number,
        toIndex: number,
    ): void {
        const currentQueue =
        queueRef.current

        if (
        fromIndex < 0 ||
        fromIndex >= currentQueue.length ||
        toIndex < 0 ||
        toIndex >= currentQueue.length ||
        fromIndex === toIndex
        ) {
        return
        }

        const nextQueue =
        [...currentQueue]

        const [
        movedTrack,
        ] = nextQueue.splice(
        fromIndex,
        1,
        )

        if (!movedTrack) {
        return
        }

        nextQueue.splice(
        toIndex,
        0,
        movedTrack,
        )

        const currentIndex =
        queueIndexRef.current

        let nextIndex =
        currentIndex

        if (currentIndex === fromIndex) {
        nextIndex = toIndex
        } else if (
        fromIndex < currentIndex &&
        toIndex >= currentIndex
        ) {
        nextIndex -= 1
        } else if (
        fromIndex > currentIndex &&
        toIndex <= currentIndex
        ) {
        nextIndex += 1
        }

        updateQueue(
        nextQueue,
        nextIndex,
        )
    }

      function clearQueue(): void {
        audioRef.current?.pause()

        if (audioRef.current) {
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
        }

        queueRef.current = []
        queueIndexRef.current = -1

        setQueue([])
        setQueueIndex(-1)
        setCurrentTrack(null)
        setCurrentTime(0)
        setDuration(0)
        setIsPlaying(false)
        setIsLoading(false)
        setPlaybackError(null)
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

    function toggleShuffle(): void {
    setShuffle(
        currentShuffle => {
        const nextShuffle =
            !currentShuffle

        if (nextShuffle) {
            const currentIndex =
            queueIndexRef.current

            if (
            queueRef.current.length > 0 &&
            currentIndex >= 0
            ) {
            shuffleOrderRef.current =
                createShuffleOrder(
                queueRef.current.length,
                currentIndex,
                )
            }
        }

        return nextShuffle
        },
    )
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

        function createShuffleOrder(
        length: number,
        startIndex: number,
        ): number[] {
        const remaining = Array.from(
            { length },
            (_, index) => index,
        ).filter(
            index => index !== startIndex,
        )

        for (
            let index = remaining.length - 1;
            index > 0;
            index -= 1
        ) {
            const randomIndex =
            Math.floor(
                Math.random() * (index + 1),
            )

            const temporary =
            remaining[index]

            remaining[index] =
            remaining[randomIndex]

            remaining[randomIndex] =
            temporary
        }

        return [
            startIndex,
            ...remaining,
        ]
        }

        async function next(): Promise<void> {
        const currentQueue =
            queueRef.current

        if (currentQueue.length === 0) {
            return
        }

        const playbackOrder =
            getPlaybackOrder()

        const currentPlaybackPosition =
            playbackOrder.indexOf(
            queueIndexRef.current,
            )

        // Repeat One
        if (repeatMode === 'one') {
            const currentTrack =
            currentQueue[
                queueIndexRef.current
            ]

            if (currentTrack) {
            await playTrackAtIndex(
                queueIndexRef.current,
                currentTrack,
            )
            }

            return
        }

        // There is another track in the
        // current playback order.
        const nextPlaybackPosition =
            currentPlaybackPosition + 1

        if (
            nextPlaybackPosition <
            playbackOrder.length
        ) {
            const nextQueueIndex =
            playbackOrder[
                nextPlaybackPosition
            ]

            if (
            nextQueueIndex !== undefined
            ) {
            const nextTrack =
                currentQueue[nextQueueIndex]

            if (nextTrack) {
                await playTrackAtIndex(
                nextQueueIndex,
                nextTrack,
                )
            }
            }

            return
        }

        // We reached the end.
        // Repeat All loops back around.
        if (repeatMode === 'all') {
            if (shuffle) {
            const newShuffleOrder =
                createShuffleOrder(
                currentQueue.length,
                queueIndexRef.current,
                )

            shuffleOrderRef.current =
                newShuffleOrder

            const nextQueueIndex =
                newShuffleOrder[1]

            if (
                nextQueueIndex !== undefined
            ) {
                const nextTrack =
                currentQueue[nextQueueIndex]

                await playTrackAtIndex(
                nextQueueIndex,
                nextTrack,
                )
            }
            } else {
            const firstTrack =
                currentQueue[0]

            if (firstTrack) {
                await playTrackAtIndex(
                0,
                firstTrack,
                )
            }
            }
        }
        }

    function getPlaybackOrder(): number[] {
        if (!shuffle) {
            return queueRef.current.map(
            (_, index) => index,
            )
        }

        return shuffleOrderRef.current
        }

    function getCanGoPrevious(): boolean {
        if (queueRef.current.length === 0) {
            return false
        }

        if (repeatMode === 'all') {
            return true
        }

        const playbackOrder =
            getPlaybackOrder()

        const playbackPosition =
            playbackOrder.indexOf(
            queueIndexRef.current,
            )

        return playbackPosition > 0
        }

        function getCanGoNext(): boolean {
        if (queueRef.current.length === 0) {
            return false
        }

        if (repeatMode === 'all') {
            return true
        }

        const playbackOrder =
            getPlaybackOrder()

        const playbackPosition =
            playbackOrder.indexOf(
            queueIndexRef.current,
            )

        return (
            playbackPosition >= 0 &&
            playbackPosition <
            playbackOrder.length - 1
        )
        }

        async function previous(): Promise<void> {
        const currentQueue =
            queueRef.current

        if (currentQueue.length === 0) {
            return
        }

        const playbackOrder =
            getPlaybackOrder()

        const currentPlaybackPosition =
            playbackOrder.indexOf(
            queueIndexRef.current,
            )

        if (currentPlaybackPosition <= 0) {
            if (repeatMode === 'all') {
            const previousQueueIndex =
                playbackOrder[
                playbackOrder.length - 1
                ]

            if (
                previousQueueIndex !== undefined
            ) {
                const previousTrack =
                currentQueue[
                    previousQueueIndex
                ]

                if (previousTrack) {
                await playTrackAtIndex(
                    previousQueueIndex,
                    previousTrack,
                )
                }
            }
            }

            return
        }

        const previousPlaybackPosition =
            currentPlaybackPosition - 1

        const previousQueueIndex =
            playbackOrder[
            previousPlaybackPosition
            ]

        if (
            previousQueueIndex !== undefined
        ) {
            const previousTrack =
            currentQueue[previousQueueIndex]

            if (previousTrack) {
            await playTrackAtIndex(
                previousQueueIndex,
                previousTrack,
            )
            }
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
      queue,
      queueIndex,

      canGoNext: getCanGoNext(),
      canGoPrevious: getCanGoPrevious(),

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
      playQueueTrack,
      removeFromQueue,
      moveQueueItem,
      clearQueue,

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
      playQueueTrack,
      removeFromQueue,
      moveQueueItem,
      clearQueue,
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