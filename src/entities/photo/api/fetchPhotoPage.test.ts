/**
 * Проверяем загрузку одной страницы: параметры запроса и чтение метаданных.
 *
 * Почему так: именно здесь формируются `_start`/`_limit` и читается `X-Total-Count`,
 * от которых зависит весь прогресс. Сеть мокается частично (fetchWithRetryResponse),
 * поэтому тест проверяет наш контракт, а не axios.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPhotoPage } from './fetchPhotoPage'
import { fetchWithRetryResponse } from '@/shared/api'
import { createPhoto } from '@/testing/fixtures'

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return { ...actual, fetchWithRetryResponse: vi.fn() }
})

const mockedRequest = vi.mocked(fetchWithRetryResponse)

describe('fetchPhotoPage', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  // Проверяем: страница запрашивается с параметрами _start и _limit
  it('requests the page with pagination parameters', async () => {
    mockedRequest.mockResolvedValue({ data: [createPhoto({ id: 1 })], headers: {} })

    await fetchPhotoPage({ url: 'https://api.test/photos', start: 500, limit: 500 })

    const requestedUrl = new URL(mockedRequest.mock.calls[0][0])
    expect(requestedUrl.searchParams.get('_start')).toBe('500')
    expect(requestedUrl.searchParams.get('_limit')).toBe('500')
  })

  // Проверяем: общее число записей берётся из заголовка X-Total-Count
  it('reads the total count from the response header', async () => {
    mockedRequest.mockResolvedValue({
      data: [createPhoto({ id: 1 })],
      headers: { 'x-total-count': '5000' },
    })

    const page = await fetchPhotoPage({ url: 'https://api.test/photos', start: 0, limit: 500 })

    expect(page.totalCount).toBe(5000)
  })

  // Проверяем: без заголовка общее число остаётся неизвестным
  it('returns null total count when the header is missing', async () => {
    mockedRequest.mockResolvedValue({ data: [createPhoto({ id: 1 })], headers: {} })

    const page = await fetchPhotoPage({ url: 'https://api.test/photos', start: 0, limit: 500 })

    expect(page.totalCount).toBeNull()
  })

  // Проверяем: невалидный ответ сервера не проходит дальше — ошибка с описанием проблемы
  it('rejects a response that does not match the schema', async () => {
    mockedRequest.mockResolvedValue({ data: [{ id: 'not-a-number' }], headers: {} })

    await expect(
      fetchPhotoPage({ url: 'https://api.test/photos', start: 0, limit: 500 })
    ).rejects.toThrow('Некорректные данные от сервера')
  })
})
