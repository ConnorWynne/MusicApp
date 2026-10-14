import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { useMusicProvider } from '../providers/useMusicProviders'

import type { MusicTrack } from '../providers/types/MusicTypes'

import { PlayerContext } from './PlayerContext'

import type { RepeatMode } from './PlayerContext'

import { ResonanceNativePlayer, type ResonancePlaybackState } from './ResonanceNativePlayer'

import { Capacitor } from '@capacitor/core'


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

  const playTrackAtIndexRef = useRef<
    ((index: number, track?: MusicTrack) => Promise<void>) | null
  >(null)

  const nativeTrackEndedHandlerRef =
    useRef<(() => void) | null>(null)

  const nativeNavigationHandlerRef = useRef<
    ((action: 'next' | 'previous') => void) | null
  >(null)

    function getScrobbleThreshold(
        track: MusicTrack,
        ): number {
        const duration =
            track.duration ?? 0

        if (duration <= 0) {
            return 240
        }

        return Math.min(
            duration / 2,
            240,
        )
        }

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

  const [nativePlaybackState, setNativePlaybackState] =
    useState<ResonancePlaybackState | null>(null)


  useEffect(() => {
    let cancelled = false
    let listenerHandle:
      | { remove: () => Promise<void> }
      | undefined

    void ResonanceNativePlayer.addListener(
      'trackEnded',
      () => {
        console.log('[Resonance] Received native trackEnded event')

        if (cancelled) {
          return
        }

        console.log('[Resonance] Calling native track-ended handler')
        nativeTrackEndedHandlerRef.current?.()
      },
    ).then((handle) => {
      if (cancelled) {
        void handle.remove()
      } else {
        listenerHandle = handle
      }
    }).catch((error) => {
      console.error(
        '[Resonance] Failed to subscribe to native track-ended event:',
        error,
      )
    })

    return () => {
      cancelled = true

      if (listenerHandle) {
        void listenerHandle.remove()
      }
    }
  }, [])

  /*
   * Keep the provider ref current without
   * putting provider into the audio setup effect.
   */
  useEffect(() => {
    providerRef.current = provider
  }, [provider])

  
  useEffect(() => {
    let cancelled = false
    let listenerHandle:
      | { remove: () => Promise<void> }
      | undefined

    void ResonanceNativePlayer.addListener(
      'playbackState',
      (state) => {
        if (cancelled) {
          return
        }

        setNativePlaybackState(state)
      },
    ).then((handle) => {
      if (cancelled) {
        void handle.remove()
      } else {
        listenerHandle = handle
      }
    }).catch((error) => {
      console.error(
        '[Resonance] Failed to subscribe to native playback state:',
        error,
      )
    })

    return () => {
      cancelled = true
      if (listenerHandle) {
        void listenerHandle.remove()
      }
    }
  }, [])




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
    
  const [nativePlaybackActive, setNativePlaybackActive] = useState(false)

  const [volume, setVolumeState] =
    useState(1)

  const [shuffle, setShuffle] = useState(false)
  const [repeatMode, setRepeatMode] =
    useState<RepeatMode>('off')

  const shuffleRef = useRef(false)
  const repeatModeRef =
  useRef<RepeatMode>('off')

  const scrobbleTrackIdRef =
    useRef<string | null>(null)

    const scrobbleSubmittedRef =
    useRef(false)

    const scrobbleSubmissionInFlightRef =
    useRef(false)

    const nowPlayingSubmittedRef =
    useRef(false)

    const nowPlayingSubmissionInFlightRef =
    useRef(false)

    const playedTimeRef =
    useRef(0)

    const lastAudioTimeRef =
    useRef(0)


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

    function resetScrobbleState(
        trackId: string,
        ): void {
        scrobbleTrackIdRef.current =
            trackId

        scrobbleSubmittedRef.current =
            false

        scrobbleSubmissionInFlightRef.current =
            false

        nowPlayingSubmittedRef.current =
            false

        nowPlayingSubmissionInFlightRef.current =
            false

        playedTimeRef.current =
            0

        lastAudioTimeRef.current =
            0
        }

    async function submitNowPlaying(
    trackId: string,
    ): Promise<void> {
    const activeProvider =
        providerRef.current

    if (!activeProvider) {
        return
    }

    if (
        scrobbleTrackIdRef.current !==
        trackId
    ) {
        return
    }

    if (
        nowPlayingSubmittedRef.current ||
        nowPlayingSubmissionInFlightRef.current
    ) {
        return
    }

    nowPlayingSubmissionInFlightRef.current =
        true

    try {
        await activeProvider.scrobble(
        trackId,
        false,
        )

        nowPlayingSubmittedRef.current =
        true
    } catch (error) {
        console.error(
        '[Resonance] Failed to submit now-playing state:',
        error,
        )
    } finally {
        nowPlayingSubmissionInFlightRef.current =
        false
    }
    }

    async function submitScrobble(
  trackId: string,
): Promise<void> {
  const activeProvider =
    providerRef.current

  if (!activeProvider) {
    return
  }

  if (
    scrobbleTrackIdRef.current !==
    trackId
  ) {
    return
  }

  if (
    scrobbleSubmittedRef.current ||
    scrobbleSubmissionInFlightRef.current
  ) {
    return
  }

  scrobbleSubmissionInFlightRef.current =
    true

  try {
    await activeProvider.scrobble(
      trackId,
      true,
    )

    scrobbleSubmittedRef.current =
      true
  } catch (error) {
    // Do not retry on every timeupdate event.
    // A failed submission is skipped for this track.
    scrobbleSubmittedRef.current = true

    console.error(
      '[Resonance] Failed to submit scrobble:',
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error),
    )
  } finally {
    scrobbleSubmissionInFlightRef.current = false
  }
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
    const currentTime =
        audio.currentTime

    setCurrentTime(
        currentTime,
    )

    const previousTime =
        lastAudioTimeRef.current

    const elapsed =
        currentTime - previousTime

    /*
    * Normal playback produces small positive
    * time differences.
    *
    * A large jump usually means the user
    * sought to another position.
    *
    * We do not count seeking as listening.
    */
    if (
        elapsed > 0 &&
        elapsed <= 2
    ) {
        playedTimeRef.current +=
        elapsed
    }

    lastAudioTimeRef.current =
        currentTime

    const track =
        queueRef.current[
        queueIndexRef.current
        ]

    if (!track) {
        return
    }

    if (
        scrobbleSubmittedRef.current
    ) {
        return
    }

    const threshold =
        getScrobbleThreshold(
        track,
        )

    if (
        playedTimeRef.current >=
        threshold
    ) {
        void submitScrobble(
        track.id,
        )
    }
    }

    function handleLoadedMetadata() {
      setDuration(
        Number.isFinite(audio.duration)
          ? audio.duration
          : 0,
      )
    }

    const handleEnded = () => {
    const endedTrack =
        queueRef.current[
        queueIndexRef.current
        ]

    if (
        endedTrack &&
        !scrobbleSubmittedRef.current
    ) {
        void submitScrobble(
        endedTrack.id,
        )
    }

    const currentQueue =
        queueRef.current

    const currentIndex =
        queueIndexRef.current

    const currentShuffle =
        shuffleRef.current

    const currentRepeatMode =
        repeatModeRef.current

    if (
        currentQueue.length === 0
    ) {
        setIsPlaying(false)
        return
    }

    if (
        currentRepeatMode === 'one'
    ) {
        void playTrackAtIndexRef.current?.(
        currentIndex,
        )

        return
    }

    /*
    * Shuffle uses the same playback order
    * as the Next / Previous buttons.
    */
    if (currentShuffle) {
        const playbackOrder =
        shuffleOrderRef.current

        const currentPlaybackPosition =
        playbackOrder.indexOf(
            currentIndex,
        )

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
            void playTrackAtIndexRef.current?.(
            nextQueueIndex,
            )
        }

        return
        }

        if (
        currentRepeatMode === 'all'
        ) {
        const newShuffleOrder =
            createShuffleOrder(
            currentQueue.length,
            currentIndex,
            )

        shuffleOrderRef.current =
            newShuffleOrder

        const nextQueueIndex =
            newShuffleOrder[1]

        if (
            nextQueueIndex !== undefined
        ) {
            void playTrackAtIndexRef.current?.(
            nextQueueIndex,
            )
        }

        return
        }

        setIsPlaying(false)
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
        void playTrackAtIndexRef.current?.(0)
        return
        }

        setIsPlaying(false)
        return
    }

    void playTrackAtIndexRef.current?.(
        nextIndex,
    )
    }

    function handleError() {
      const message =
        getMediaErrorMessage(
          audio.error,
        )

      console.error(
        '[Resonance] Audio element error: ' +
          JSON.stringify({
            code: audio.error?.code ?? null,
            message: audio.error?.message ?? null,
            networkState: audio.networkState,
            readyState: audio.readyState,
            paused: audio.paused,
            currentSrcPresent: Boolean(audio.currentSrc),
            visibilityState: document.visibilityState,
          }),
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

        console.info('[Resonance] Stream URL created for next track', {
          trackId: queueTrack.id,
          appVisibility: document.visibilityState,
          audioReadyState: audio.readyState,
          audioNetworkState: audio.networkState,
        })

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

      resetScrobbleState(queueTrack.id)

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

      void submitNowPlaying(
        queueTrack.id,
      )

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
        '[Resonance] Playback failed: ' +
          JSON.stringify({
            name:
              error instanceof Error
                ? error.name
                : typeof error,
            message:
              error instanceof Error
                ? error.message
                : String(error),
            visibilityState: document.visibilityState,
            audioPaused: audio.paused,
            audioErrorCode: audio.error?.code ?? null,
            audioErrorMessage: audio.error?.message ?? null,
            audioNetworkState: audio.networkState,
            audioReadyState: audio.readyState,
          }),
      )

      setIsPlaying(false)
      setIsLoading(false)
      setPlaybackError(message)
    }
  }


  useEffect(() => {
    playTrackAtIndexRef.current = playTrackAtIndex
  }, [playTrackAtIndex])


    async function playNativeTrackAtIndex(
      index: number,
      track?: MusicTrack,
    ): Promise<void> {
      const activeProvider = providerRef.current
      const selectedTrack = track ?? queueRef.current[index]

      if (!activeProvider) {
        setPlaybackError(
          'Connect a music server before playing music.',
        )
        return
      }

      if (!selectedTrack) {
        return
      }

      const requestId = ++playRequestRef.current

      try {
        setPlaybackError(null)
        setIsLoading(true)

        // Prevent HTML audio and Media3 playing together.
        audioRef.current?.pause()

        const streamUrl =
          await activeProvider.getStreamUrl(selectedTrack.id)

        if (requestId !== playRequestRef.current) {
          return
        }

        resetScrobbleState(selectedTrack.id)

        // Start synchronising React with native playback.
        setNativePlaybackActive(true)

        await ResonanceNativePlayer.playTrack({
          url: streamUrl,
          title: selectedTrack.title,
          artist: selectedTrack.artistName,
          album: selectedTrack.albumName,
        })

        if (requestId !== playRequestRef.current) {
          return
        }

        queueIndexRef.current = index
        setQueueIndex(index)
        setCurrentTrack(selectedTrack)
        setCurrentTime(0)
        setDuration(selectedTrack.duration ?? 0)
        setIsPlaying(true)
        setIsLoading(false)
      } catch (error) {
        if (requestId !== playRequestRef.current) {
          return
        }

        console.error(
          '[Resonance] Native queue playback failed:',
          error,
        )

        setNativePlaybackActive(false)
        setIsPlaying(false)
        setIsLoading(false)
        setPlaybackError(
          error instanceof Error
            ? error.message
            : 'Native playback failed.',
        )
      }
    }

    async function playQueueIndex(
      index: number,
      track?: MusicTrack,
    ): Promise<void> {
      if (Capacitor.isNativePlatform()) {
        await playNativeTrackAtIndex(index, track)
      } else {
        await playTrackAtIndex(index, track)
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

      // Use Media3 for normal single-track playback
      // on native platforms. Keep browser playback unchanged.
      if (Capacitor.isNativePlatform()) {
        const requestId = ++playRequestRef.current

        try {
          setPlaybackError(null)
          setIsLoading(true)

          // Never allow HTML audio to play alongside Media3.
          audioRef.current?.pause()

          const activeProvider = providerRef.current

          if (!activeProvider) {
            throw new Error(
              'Connect a music server before playing music.',
            )
          }

          const streamUrl =
            await activeProvider.getStreamUrl(track.id)

          // Ignore an outdated request if another track
          // was selected while the stream URL was loading.
          if (requestId !== playRequestRef.current) {
            return
          }

          resetScrobbleState(track.id)
          setNativePlaybackActive(true)

          await ResonanceNativePlayer.playTrack({
            url: streamUrl,
            title: track.title,
            artist: track.artistName,
            album: track.albumName,
          })

          if (requestId !== playRequestRef.current) {
            return
          }

          setCurrentTrack(track)
          setCurrentTime(0)
          setDuration(track.duration ?? 0)
          setIsPlaying(true)
          setIsLoading(false)
        } catch (error) {
          if (requestId !== playRequestRef.current) {
            return
          }

          console.error(
            '[Resonance] Native single-track playback failed:',
            error,
          )

          setNativePlaybackActive(false)
          setIsPlaying(false)
          setIsLoading(false)
          setPlaybackError(
            error instanceof Error
              ? error.message
              : 'Native playback failed.',
          )
        }

        return
      }

      // Existing HTML audio playback for the web.
      await playTrackAtIndex(0, track)
    }


  function playNextTrack(track: MusicTrack): void {
    const currentQueue = queueRef.current
    const currentIndex = queueIndexRef.current

    // If nothing is currently selected, play this track.
    if (currentQueue.length === 0 || currentIndex < 0) {
      updateQueue([track], 0)

      if (shuffleRef.current) {
        shuffleOrderRef.current = [0]
      }

      void playQueueIndex(0, track)
      return
    }

    // Insert immediately after the current track.
    const insertIndex = currentIndex + 1
    const nextQueue = [...currentQueue]

    nextQueue.splice(insertIndex, 0, track)

    // Keep the current track selected.
    updateQueue(nextQueue, currentIndex)

    // Adjust shuffle indexes so the new track plays next.
    if (shuffleRef.current) {
      const oldOrder = shuffleOrderRef.current
      const playbackOrder =
        oldOrder.length > 0
          ? [...oldOrder]
          : currentQueue.map((_, index) => index)

      const adjustedOrder = playbackOrder.map((index) =>
        index >= insertIndex ? index + 1 : index,
      )

      const currentPosition =
        adjustedOrder.indexOf(currentIndex)

      adjustedOrder.splice(
        currentPosition >= 0
          ? currentPosition + 1
          : adjustedOrder.length,
        0,
        insertIndex,
      )

      shuffleOrderRef.current = adjustedOrder
    }
  }

  function addToQueue(track: MusicTrack): void {
    const currentQueue = queueRef.current
    const newTrackIndex = currentQueue.length
    const nextQueue = [...currentQueue, track]

    // Keep the current playback position unchanged.
    updateQueue(nextQueue, queueIndexRef.current)

    // If shuffle is active, put this track at the end
    // of the existing playback order.
    if (shuffleRef.current) {
      const playbackOrder =
        shuffleOrderRef.current.length > 0
          ? [...shuffleOrderRef.current]
          : currentQueue.map((_, index) => index)

      playbackOrder.push(newTrackIndex)
      shuffleOrderRef.current = playbackOrder
    }
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

    if (Capacitor.isNativePlatform()) {
      await playNativeTrackAtIndex(safeIndex, track)
    } else {
      await playTrackAtIndex(safeIndex, track)
    }
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

    if (Capacitor.isNativePlatform()) {
      await playNativeTrackAtIndex(index, track)
    } else {
      await playTrackAtIndex(index, track)
    }
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
                void playQueueIndex(nextIndex, nextTrack)
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
      if (nativePlaybackActive) {
        void ResonanceNativePlayer.pause().catch((error) => {
          console.error('[Resonance] Native pause failed:', error)
          setPlaybackError('Unable to pause native playback.')
        })
        return
      }

      audioRef.current?.pause()
      setIsLoading(false)
    }


  async function togglePlayPause() {
    
    if (nativePlaybackActive) {
      try {
        setPlaybackError(null)

        if (nativePlaybackState?.isPlaying) {
          await ResonanceNativePlayer.pause()
        } else {
          await ResonanceNativePlayer.resume()
        }
      } catch (error) {
        console.error('[Resonance] Native play/pause failed:', error)
        setPlaybackError('Unable to change native playback state.')
      }

      return
    }

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
          '[Resonance] Playback failed:',
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
    const nextShuffle = !shuffleRef.current

    shuffleRef.current = nextShuffle
    setShuffle(nextShuffle)

    if (nextShuffle) {
      const currentIndex = queueIndexRef.current

      if (
        queueRef.current.length > 0 &&
        currentIndex >= 0
      ) {
        shuffleOrderRef.current = createShuffleOrder(
          queueRef.current.length,
          currentIndex,
        )
      }
    }
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
            await playQueueIndex(
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
                await playQueueIndex(
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

                await playQueueIndex(
                nextQueueIndex,
                nextTrack,
                )
            }
            } else {
            const firstTrack =
                currentQueue[0]

            if (firstTrack) {
                await playQueueIndex(
                0,
                firstTrack,
                )
            }
            }
        }
        }

      useEffect(() => {
        nativeTrackEndedHandlerRef.current = () => {
          console.log('[Resonance] Native track ended — advancing queue')
          void next()
        }

        nativeNavigationHandlerRef.current = (action) => {
          if (action === 'next') {
            void next()
          } else {
            void previous()
          }
        }
      })

      useEffect(() => {
        let cancelled = false
        let listenerHandle:
          | { remove: () => Promise<void> }
          | undefined

        void ResonanceNativePlayer.addListener(
          'nativeNavigation',
          (event) => {
            if (cancelled) {
              return
            }
            console.log('[Resonance] Native navigation received:', event.action);
            nativeNavigationHandlerRef.current?.(event.action)
          },
        ).then((handle) => {
          if (cancelled) {
            void handle.remove()
          } else {
            listenerHandle = handle
          }
        }).catch((error) => {
          console.error(
            '[Resonance] Failed to subscribe to native navigation:',
            error,
          )
        })

        return () => {
          cancelled = true

          if (listenerHandle) {
            void listenerHandle.remove()
          }
        }
      }, [])



    function getPlaybackOrder(): number[] {
        if (!shuffle) {
            return queueRef.current.map(
            (_, index) => index,
            )
        }

        return shuffleOrderRef.current
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
                await playQueueIndex(
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
            await playQueueIndex(
                previousQueueIndex,
                previousTrack,
            )
            }
        }
        }

      function seek(time: number) {
        if (nativePlaybackActive) {
          if (!Number.isFinite(time)) {
            console.warn('[Resonance] Ignoring invalid native seek time:', time)
            return
          }

          const nextTime = Math.max(
            0,
            Math.min(time, duration > 0 ? duration : time),
          )

          const positionMs = Math.round(nextTime * 1000)

          if (!Number.isFinite(positionMs) || positionMs < 0) {
            console.warn('[Resonance] Ignoring invalid native seek position:', positionMs)
            return
          }

          console.log('[Resonance] Seek request:', {
            timeSeconds: time,
            durationSeconds: duration,
            nextTimeSeconds: nextTime,
            positionMs,
            positionMsType: typeof positionMs,
          })

          void ResonanceNativePlayer.seekTo({ positionMs })
            .then(() => {
              setCurrentTime(nextTime)
              setPlaybackError(null)
            })
            .catch((error) => {
              console.error('[Resonance] Native seek failed:', error)
              setPlaybackError('Unable to seek in native playback.')
            })

          return
        }

        const audio = audioRef.current

        if (!audio || !Number.isFinite(time)) {
          return
        }

        const nextTime = Math.max(
          0,
          Math.min(time, Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : time),
        )

        audio.currentTime = nextTime
        setCurrentTime(nextTime)
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

  const canGoPrevious =
    queue.length > 0 &&
    (repeatMode === 'all' || queueIndex > 0)

  const canGoNext =
    queue.length > 0 &&
    (repeatMode === 'all' || (queueIndex >= 0 && queueIndex < queue.length - 1))

  const nativeState = nativePlaybackActive ? nativePlaybackState : null

  const value = {
    currentTrack,
    queue,
    queueIndex,

    canGoNext,
    canGoPrevious,

    isPlaying: nativeState?.isPlaying ?? isPlaying,
    isLoading: nativeState?.isLoading ?? isLoading,
    playbackError: nativeState?.error
      ? `Native playback failed: ${nativeState.error}`
      : playbackError,

    currentTime: nativeState
      ? Math.max(0, nativeState.positionMs) / 1000
      : currentTime,
    duration: nativeState && nativeState.durationMs >= 0
      ? nativeState.durationMs / 1000
      : duration,
    volume,

    shuffle,
    repeatMode,

    play,
    playNextTrack,
    addToQueue,
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
  }

  return (
    <PlayerContext.Provider
      value={value}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export default PlayerProvider