import { api } from './api'
import type { StreamConflictError } from '../types/api'

interface StartStreamParams {
  profileId: string
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  season?: number
  episode?: number
}

type StartStreamResult =
  | { ok: true; streamId: string }
  | { ok: false; conflict: StreamConflictError }

export const stream = {
  async start(params: StartStreamParams): Promise<StartStreamResult> {
    const res = await api.post<{ streamId: string }>('/streams/start', params)

    if (res.success) {
      return { ok: true, streamId: res.data.streamId }
    }

    const error = res.error?.[0]
    if (error?.code === 'MAX_STREAMS_REACHED') {
      return {
        ok: false,
        conflict: error as unknown as StreamConflictError,
      }
    }

    throw new Error(error?.message ?? 'Erro ao iniciar reprodução')
  },

  async ping(streamId: string): Promise<boolean> {
    const res = await api.put<null>(`/streams/${streamId}/ping`)
    console.log('Ping stream', { streamId, success: res.success })
    return res.success
  },

  async stop(streamId: string): Promise<void> {
    try {
      await api.delete(`/streams/${streamId}`)
    } catch {
      // Silent fail
    }
  },

  async kill(streamId: string): Promise<void> {
    const res = await api.delete(`/streams/${streamId}`)
    if (!res.success) {
      throw new Error('Erro ao encerrar stream')
    }
  },
}
