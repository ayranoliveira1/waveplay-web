import { useState, useRef, useEffect } from 'react'
import { stream } from '../services/stream'
import { API_BASE_URL } from '../constants/api'
import { getAccessToken } from '../services/token-storage'
import type { StreamConflictError } from '../types/api'

const PING_INTERVAL = 60_000

interface StartStreamParams {
  profileId: string
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  season?: number
  episode?: number
}

export function useStream() {
  const [streamId, setStreamId] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [sessionKilled, setSessionKilled] = useState(false)
  const [conflict, setConflict] = useState<StreamConflictError | null>(null)

  const streamIdRef = useRef<string | null>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearPing() {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
  }

  function startPing(id: string) {
    clearPing()
    pingIntervalRef.current = setInterval(async () => {
      const alive = await stream.ping(id)
      if (!alive) {
        clearPing()
        setSessionKilled(true)
      }
    }, PING_INTERVAL)
  }

  async function stopStream() {
    clearPing()
    const id = streamIdRef.current
    if (id) {
      streamIdRef.current = null
      setStreamId(null)
      setSessionKilled(false)
      await stream.stop(id)
    }
  }

  async function startStream(params: StartStreamParams): Promise<boolean> {
    await stopStream()

    setIsStarting(true)
    setSessionKilled(false)
    setConflict(null)

    try {
      const result = await stream.start(params)

      if (result.ok) {
        streamIdRef.current = result.streamId
        setStreamId(result.streamId)
        startPing(result.streamId)
        return true
      } else {
        setConflict(result.conflict)
        return false
      }
    } catch {
      return false
    } finally {
      setIsStarting(false)
    }
  }

  async function killRemoteStream(remoteStreamId: string) {
    await stream.kill(remoteStreamId)
  }

  function clearConflict() {
    setConflict(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPing()
      const id = streamIdRef.current
      if (id) {
        stream.stop(id)
      }
    }
  }, [])

  // beforeunload — fetch with keepalive (sendBeacon only supports POST)
  useEffect(() => {
    function handleBeforeUnload() {
      const id = streamIdRef.current
      if (id) {
        const token = getAccessToken()
        fetch(`${API_BASE_URL}/streams/${id}`, {
          method: 'DELETE',
          keepalive: true,
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return {
    streamId,
    isStarting,
    sessionKilled,
    conflict,
    startStream,
    stopStream,
    killRemoteStream,
    clearConflict,
  }
}
