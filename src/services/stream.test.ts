import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'
import { stream } from './stream'

vi.mock('./api', () => ({ api: { post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))

const post = vi.mocked(api.post)
const del = vi.mocked(api.delete)

const params = {
  profileId: 'profile-1',
  tmdbId: 1396,
  type: 'series' as const,
  title: 'Breaking Bad',
}
const started = { success: true, data: { streamId: 'row-1' }, error: null }
const deleted = { success: true, data: undefined, error: null }
const conflict = {
  statusCode: 409,
  code: 'MAX_STREAMS_REACHED',
  message: 'Você atingiu o limite de 1 tela(s) simultânea(s) do seu plano.',
  maxStreams: 1,
  activeStreams: [],
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('stream', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('só envia o POST do start depois que o DELETE do stop anterior responde', async () => {
    const pendingDelete = deferred<typeof deleted>()
    del.mockReturnValue(pendingDelete.promise)
    post.mockResolvedValue(started)

    const stopping = stream.stop('row-1')
    const starting = stream.start(params)
    await flush()
    expect(post).not.toHaveBeenCalled()

    pendingDelete.resolve(deleted)
    await stopping
    await expect(starting).resolves.toEqual({ ok: true, streamId: 'row-1' })
    expect(post).toHaveBeenCalledOnce()
  })

  it('start abandonado antes de responder encerra a stream antes do start seguinte', async () => {
    const calls: string[] = []
    const firstPost = deferred<typeof started>()
    post
      .mockImplementationOnce(() => {
        calls.push('POST')
        return firstPost.promise
      })
      .mockImplementationOnce(async () => {
        calls.push('POST')
        return started
      })
    del.mockImplementation(async (path) => {
      calls.push(`DELETE ${path}`)
      return deleted
    })

    let left = false
    const first = stream.start(params, () => left)
    await flush()
    left = true
    const second = stream.start(params)
    await flush()

    firstPost.resolve(started)
    await expect(first).resolves.toEqual({ ok: false, conflict: null })
    await expect(second).resolves.toEqual({ ok: true, streamId: 'row-1' })
    expect(calls).toEqual(['POST', 'DELETE /streams/row-1', 'POST'])
  })

  it.each([
    ['objeto', conflict],
    ['lista', [conflict]],
  ])('devolve o conflito de limite de telas com error como %s', async (_, error) => {
    post.mockResolvedValue({ success: false, data: null, error } as never)

    await expect(stream.start(params)).resolves.toEqual({ ok: false, conflict })
  })
})
