/**
 * Проверяем сквозной сценарий поиска: данные из стора → фильтрация в таблице → сброс.
 *
 * Почему отдельным файлом: здесь нужны фейковые таймеры (debounce) и полный набор слоёв,
 * а основной тест страницы намеренно остаётся простым дымовым.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, act } from '@testing-library/react'
import { PhotosPage } from './PhotosPage'
import { fetchPhotoPage } from '@/entities/photo'
import { createPhotos } from '@/testing/fixtures'
import { renderWithStore } from '@/testing/renderWithStore'

vi.mock('@/entities/photo', { spy: true })

const mockedFetch = vi.mocked(fetchPhotoPage)

function renderPage() {
  renderWithStore(<PhotosPage />)
}

describe('PhotosPage: поиск и сброс', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockedFetch.mockResolvedValue({ photos: createPhotos(3), totalCount: 3 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows every record again after the search is reset', async () => {
    renderPage()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'photo 1' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(screen.getByText('Найдено записей: 1 из 3')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Сбросить поиск' }))
    })

    expect(screen.getByText('Найдено записей: 3 из 3')).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('shows every record again after the native clear event', async () => {
    renderPage()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    const input = screen.getByRole('searchbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'photo 1' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(screen.getByText('Найдено записей: 1 из 3')).toBeInTheDocument()

    input.value = ''
    await act(async () => {
      fireEvent(input, new Event('search'))
    })

    expect(screen.getByText('Найдено записей: 3 из 3')).toBeInTheDocument()
  })
})
