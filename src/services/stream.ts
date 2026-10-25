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
  | { ok: false; conflict: StreamConflictError | null }

// A API devolve o mesmo streamId a cada start do perfil: na troca de episódio, um DELETE
// da sessão anterior que chegue depois do POST da nova derrubaria a stream nova.
let queue: Promise<unknown> = Promise.resolve()

function inOrder<T>(op: () => Promise<T>): Promise<T> {
  const run = queue.then(op)
  queue = run.catch(() => undefined)
  return run
}

async function stopNow(streamId: string) {
  try {
    await api.delete(`/streams/${streamId}`)
  } catch (err) {
    console.warn('Failed to stop stream', err)
  }
}

export const stream = {
  start(params: StartStreamParams, abandoned = () => false): Promise<StartStreamResult> {
    return inOrder(async () => {
      const res = await api.post<{ streamId: string }>('/streams/start', params)

      if (res.success) {
        // Saiu da tela antes de a stream subir: não pode ficar uma tela ocupada sem ninguém.
        if (abandoned()) {
          await stopNow(res.data.streamId)
          return { ok: false, conflict: null }
        }
        return { ok: true, streamId: res.data.streamId }
      }

      // O 409 de limite de telas vem com `error` como objeto; os demais erros, como lista.
      const error = Array.isArray(res.error) ? res.error[0] : res.error
      if (error?.code === 'MAX_STREAMS_REACHED') {
        return {
          ok: false,
          conflict: error as unknown as StreamConflictError,
        }
      }

      throw new Error(error?.message ?? 'Erro ao iniciar reprodução')
    })
  },

  async ping(streamId: string): Promise<boolean> {
    const res = await api.put<null>(`/streams/${streamId}/ping`)
    if (import.meta.env.DEV) console.log('Ping stream', { streamId, success: res.success })
    return res.success
  },

  stop(streamId: string): Promise<void> {
    return inOrder(() => stopNow(streamId))
  },

  async kill(streamId: string): Promise<void> {
    const res = await api.delete(`/streams/${streamId}`)
    if (!res.success) {
      throw new Error('Erro ao encerrar stream')
    }
  },
}
