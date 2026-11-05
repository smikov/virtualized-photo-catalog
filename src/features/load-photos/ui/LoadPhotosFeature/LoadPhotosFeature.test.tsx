/**
 * Проверяем панель управления загрузкой: кнопки, состояния и прогресс.
 *
 * Почему так: пользователь взаимодействует именно с этим компонентом, поэтому тесты
 * идут от действий («нажал», «дождался») и видимого результата, а не от внутренних
 * вызовов. Загрузка страниц мокается — иначе тест зависел бы от сети.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { LoadPhotosFeature } from './LoadPhotosFeature'
import { fetchPhotoPage, type PhotoPage } from '@/entities/photo'
import { createPhoto, createPhotos } from '@/testing/fixtures'
import { renderWithStore } from '@/testing/renderWithStore'
import { pendingUntilAbort } from '@/testing/deferred'

vi.mock('@/entities/photo', { spy: true })

const mockedFetch = vi.mocked(fetchPhotoPage)

function renderFeature(props: { autoLoad?: boolean } = {}) {
  return renderWithStore(<LoadPhotosFeature {...props} />).store
}

/** Мок, который сам не ответит — только по отмене */
function mockPendingUntilAbort() {
  mockedFetch.mockImplementation(({ signal }) => pendingUntilAbort<PhotoPage>(signal))
}

describe('LoadPhotosFeature', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
  })

  it('cancels the request when the user clicks the cancel button', async () => {
    mockPendingUntilAbort()
    const store = renderFeature()

    const cancelButton = await screen.findByRole('button', { name: 'Отменить загрузку' })
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(store.getState().loadPhotos.status).toBe('cancelled')
    })
    expect(screen.getByRole('button', { name: 'Повторить загрузку' })).toBeInTheDocument()
  })

  it('shows the error and retries the request', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Не удалось загрузить данные после 3 попыток'))
    const store = renderFeature()

    const retryButton = await screen.findByRole('button', { name: 'Повторить загрузку' })
    expect(screen.getByText('Не удалось загрузить данные')).toBeInTheDocument()
    expect(screen.getByText(/после 3 попыток/)).toBeInTheDocument()

    mockedFetch.mockResolvedValueOnce({ photos: [createPhoto()], totalCount: 1 })
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(store.getState().loadPhotos.status).toBe('succeeded')
    })
    expect(screen.getByText('Успешно загружено записей: 1')).toBeInTheDocument()
  })

  it('waits for the user action when autoload is off', () => {
    const store = renderFeature({ autoLoad: false })

    expect(mockedFetch).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Загрузить данные' })).toBeInTheDocument()
    expect(store.getState().loadPhotos.status).toBe('idle')
  })

  it('starts loading when the user clicks the load button', async () => {
    mockedFetch.mockResolvedValue({ photos: [createPhoto()], totalCount: 1 })
    const store = renderFeature({ autoLoad: false })

    fireEvent.click(screen.getByRole('button', { name: 'Загрузить данные' }))

    await waitFor(() => {
      expect(store.getState().loadPhotos.status).toBe('succeeded')
    })
    expect(mockedFetch).toHaveBeenCalledTimes(1)
  })

  it('offers a retry after cancelling a manual load', async () => {
    mockPendingUntilAbort()
    const store = renderFeature({ autoLoad: false })

    fireEvent.click(screen.getByRole('button', { name: 'Загрузить данные' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Отменить загрузку' }))

    await waitFor(() => {
      expect(store.getState().loadPhotos.status).toBe('cancelled')
    })
    expect(screen.getByText('Загрузка отменена')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Повторить загрузку' })).toBeInTheDocument()
  })

  it('keeps the bar at zero until the total is known', async () => {
    let resolveFirst: (page: PhotoPage) => void = () => {}
    mockedFetch.mockImplementation(({ start }) => {
      if (start === 0) {
        return new Promise<PhotoPage>((resolve) => {
          resolveFirst = resolve
        })
      }
      return new Promise<PhotoPage>(() => {})
    })
    renderFeature()

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('Соединяемся с сервером…')).toBeInTheDocument()

    resolveFirst({ photos: createPhotos(500), totalCount: 5000 })

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10')
    })
  })

  it('falls back to an indeterminate bar when the total is unknown', async () => {
    let finishFirst: (page: PhotoPage) => void = () => {}
    mockedFetch.mockImplementation(({ start }) => {
      if (start === 0) {
        return new Promise<PhotoPage>((resolve) => {
          finishFirst = resolve
        })
      }
      // Вторая страница «висит»: состояние нужно застать в процессе
      return new Promise<PhotoPage>(() => {})
    })
    renderFeature()

    finishFirst({ photos: createPhotos(500), totalCount: null })

    await waitFor(() => {
      expect(screen.getByText('Загружено записей: 500')).toBeInTheDocument()
    })
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })
})
