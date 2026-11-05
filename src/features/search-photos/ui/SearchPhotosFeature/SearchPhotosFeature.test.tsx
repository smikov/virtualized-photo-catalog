/**
 * Проверяем поиск с точки зрения пользователя: ввод, debounce и сброс.
 *
 * Почему так: сброс поиска — место, где легко ошибиться незаметно (поле очистилось, а фильтр
 * остался). Поэтому проверяются оба пути очистки: своя кнопка и нативное событие `search`,
 * которое браузер присылает при использовании встроенной кнопки очистки.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SearchPhotosFeature } from './SearchPhotosFeature'

describe('SearchPhotosFeature', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Проверяем: запрос уходит наружу только после паузы ввода, а не на каждое нажатие
  it('debounces the query before reporting it', async () => {
    const onSearch = vi.fn()
    render(<SearchPhotosFeature onSearch={onSearch} />)

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cats' } })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(299)
    })
    expect(onSearch).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(onSearch).toHaveBeenCalledWith('cats')
  })

  // Проверяем: кнопка очистки сбрасывает фильтр сразу, без ожидания debounce
  it('clears the query immediately when the reset button is pressed', () => {
    const onSearch = vi.fn()
    render(<SearchPhotosFeature onSearch={onSearch} />)

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cats' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сбросить поиск' }))

    expect(onSearch).toHaveBeenLastCalledWith('')
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  // Проверяем: нативное событие search (встроенная очистка в браузере) тоже сбрасывает фильтр —
  // иначе поле пустое, а таблица остаётся отфильтрованной
  it('resets the query on the native search event', () => {
    const onSearch = vi.fn()
    render(<SearchPhotosFeature onSearch={onSearch} />)

    const input = screen.getByRole('searchbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'cats' } })

    // Браузер очищает поле и присылает событие search, не порождая input/change
    input.value = ''
    fireEvent(input, new Event('search'))

    expect(onSearch).toHaveBeenLastCalledWith('')
  })

  // Проверяем: Esc очищает поле и снимает фильтр (браузер делает это без события input)
  it('clears the query on Escape', () => {
    const onSearch = vi.fn()
    render(<SearchPhotosFeature onSearch={onSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'cats' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onSearch).toHaveBeenLastCalledWith('')
    expect(input).toHaveValue('')
  })

  // Проверяем: кнопка очистки появляется только когда есть что очищать
  it('shows the reset button only for a non-empty query', () => {
    render(<SearchPhotosFeature onSearch={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Сбросить поиск' })).not.toBeInTheDocument()
  })
})
