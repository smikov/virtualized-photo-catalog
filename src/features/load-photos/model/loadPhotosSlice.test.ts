/**
 * Проверяем оркестрацию загрузки в сторе — самый сложный участок проекта.
 *
 * Почему так: здесь живут гонки, порядок страниц, отмена и частичные сбои. Эти случаи
 * невозможно воспроизвести руками на живом API, поэтому загрузка страниц мокается,
 * а тесты управляют временем ответов вручную (deferred/отложенные промисы).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadPhotos, cancelLoad } from './loadPhotosSlice'
import { fetchPhotoPage, type PhotoPage } from '@/entities/photo'
import { REQUEST_CANCELLED_MESSAGE } from '@/shared/api'
import { createPhoto, createPhotoPage } from '@/testing/fixtures'
import { createTestStore } from '@/testing/createTestStore'
import { createDeferred } from '@/testing/deferred'
import { reportError } from '@/shared/lib/errorReporter'

vi.mock('@/entities/photo', { spy: true })

vi.mock('@/shared/lib/errorReporter', () => ({ reportError: vi.fn() }))

const mockedFetchPage = vi.mocked(fetchPhotoPage)
const PAGE_SIZE = 500
const page = createPhotoPage

describe('loadPhotosSlice: постраничная загрузка', () => {
  beforeEach(() => {
    mockedFetchPage.mockReset()
  })

  it('sets loading state while the first page is in flight', () => {
    mockedFetchPage.mockReturnValue(createDeferred<PhotoPage>().promise)
    const store = createTestStore()

    void store.dispatch(loadPhotos())

    expect(store.getState().loadPhotos).toMatchObject({
      status: 'loading',
      progress: 0,
      loadedPages: 0,
    })
  })

  it('loads every page and merges them by page order', async () => {
    const totalCount = PAGE_SIZE * 3
    mockedFetchPage.mockImplementation(async ({ start }) => page(start, PAGE_SIZE, totalCount))
    const store = createTestStore()

    await store.dispatch(loadPhotos())

    const state = store.getState().loadPhotos
    expect(state.status).toBe('succeeded')
    expect(state.data).toHaveLength(totalCount)
    expect(state.data[0].id).toBe(1)
    expect(state.data.at(-1)?.id).toBe(totalCount)
    expect(mockedFetchPage).toHaveBeenCalledTimes(3)
    expect(state.progress).toBe(100)
  })

  it('keeps page order when responses arrive out of order', async () => {
    const totalCount = PAGE_SIZE * 3
    mockedFetchPage.mockImplementation(async ({ start }) => {
      await new Promise((resolve) => setTimeout(resolve, start === 0 ? 30 : 0))
      return page(start, PAGE_SIZE, totalCount)
    })
    const store = createTestStore()

    await store.dispatch(loadPhotos())

    const ids = store.getState().loadPhotos.data.map((photo) => photo.id)
    expect(ids).toEqual([...ids].sort((left, right) => left - right))
  })

  it('grows progress as pages arrive', async () => {
    const totalCount = PAGE_SIZE * 4
    mockedFetchPage.mockImplementation(async ({ start }) => page(start, PAGE_SIZE, totalCount))
    const store = createTestStore()
    const progressHistory: number[] = []
    const unsubscribe = store.subscribe(() => {
      progressHistory.push(store.getState().loadPhotos.progress)
    })

    await store.dispatch(loadPhotos())
    unsubscribe()

    expect(progressHistory).toContain(25)
    expect(progressHistory).toContain(50)
    expect(progressHistory.at(-1)).toBe(100)
  })

  it('loads until a short page when the total is unknown', async () => {
    mockedFetchPage.mockImplementation(async ({ start }) => {
      if (start === 0) return page(0, PAGE_SIZE, null)
      if (start === PAGE_SIZE) return page(PAGE_SIZE, PAGE_SIZE, null)
      return page(start, 120, null)
    })
    const store = createTestStore()

    await store.dispatch(loadPhotos())

    const state = store.getState().loadPhotos
    expect(state.totalPages).toBeNull()
    expect(state.data).toHaveLength(PAGE_SIZE * 2 + 120)
    expect(mockedFetchPage).toHaveBeenCalledTimes(3)
    expect(state.progress).toBe(100)
  })

  it('fails the whole load when one page cannot be fetched', async () => {
    mockedFetchPage.mockImplementation(async ({ start }) => {
      if (start === PAGE_SIZE) throw new Error('Не удалось загрузить данные после 3 попыток')
      return page(start, PAGE_SIZE, PAGE_SIZE * 2)
    })
    const store = createTestStore()

    await store.dispatch(loadPhotos())

    const state = store.getState().loadPhotos
    expect(state.status).toBe('failed')
    expect(state.error).toContain('после 3 попыток')
    expect(reportError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ scope: 'loadPhotos' })
    )
  })

  it('marks state as cancelled when the user aborts the request', async () => {
    mockedFetchPage.mockImplementation(
      ({ signal }) =>
        new Promise<PhotoPage>((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new Error(REQUEST_CANCELLED_MESSAGE)))
        })
    )
    const store = createTestStore()

    const loadPromise = store.dispatch(loadPhotos())
    await store.dispatch(cancelLoad())
    await loadPromise

    const state = store.getState().loadPhotos
    expect(state.status).toBe('cancelled')
    expect(state.error).toBeNull()
  })

  it('ignores the outcome of a superseded request', async () => {
    let resolveFirst: (value: PhotoPage) => void = () => {}
    let resolveSecond: (value: PhotoPage) => void = () => {}
    const firstPage = new Promise<PhotoPage>((resolve) => {
      resolveFirst = resolve
    })
    const secondPage = new Promise<PhotoPage>((resolve) => {
      resolveSecond = resolve
    })

    mockedFetchPage.mockImplementationOnce(() => firstPage).mockImplementationOnce(() => secondPage)

    const store = createTestStore()
    const firstLoad = store.dispatch(loadPhotos())
    const secondLoad = store.dispatch(loadPhotos())

    resolveFirst({ photos: [createPhoto({ id: 999 })], totalCount: 1 })
    await firstLoad
    expect(store.getState().loadPhotos.status).toBe('loading')

    resolveSecond({ photos: [createPhoto({ id: 1 })], totalCount: 1 })
    await secondLoad

    const state = store.getState().loadPhotos
    expect(state.status).toBe('succeeded')
    expect(state.data.map((photo) => photo.id)).toEqual([1])
  })

  it('stops the whole pool after the first failed page', async () => {
    const totalPages = 5
    const totalCount = PAGE_SIZE * totalPages
    mockedFetchPage.mockImplementation(({ start, signal }) => {
      if (start === 0) return Promise.resolve(page(0, PAGE_SIZE, totalCount))
      if (start === PAGE_SIZE) return Promise.reject(new Error('Сервер ответил ошибкой 500'))
      return new Promise<PhotoPage>((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new Error(REQUEST_CANCELLED_MESSAGE)))
      })
    })
    const store = createTestStore()

    await store.dispatch(loadPhotos())

    const state = store.getState().loadPhotos
    expect(state.status).toBe('failed')
    expect(state.error).toContain('500')
    expect(mockedFetchPage).toHaveBeenCalledTimes(4)
  })
})
