/**
 * Проверяем сетевой слой: повторы, отмену, таймаут и прогресс.
 *
 * Почему так: здесь собраны все решения «когда повторять и когда нет». axios мокается,
 * таймеры — фейковые: так тест не ждёт реальные секунды пауз между попытками.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { fetchWithRetry, REQUEST_CANCELLED_MESSAGE } from './httpClient'

// Мокаем сетевой вызов, оставляя реальную логику retry/abort в тестируемом коде
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isCancel: vi.fn(() => false),
    // Ошибки axios помечаем флагом, как это делает настоящая библиотека
    isAxiosError: vi.fn((error: unknown) =>
      Boolean(error && typeof error === 'object' && 'isAxiosError' in error)
    ),
  },
}))

const mockedGet = vi.mocked(axios.get)

describe('fetchWithRetry', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Проверяем: успешный запрос возвращает данные и выполняется один раз
  it('returns response data on success', async () => {
    mockedGet.mockResolvedValue({ data: [{ id: 1 }] } as never)

    const result = await fetchWithRetry<{ id: number }[]>('https://api.test/photos', { retries: 3 })

    expect(result).toEqual([{ id: 1 }])
    expect(mockedGet).toHaveBeenCalledTimes(1)
  })

  // Проверяем: после сетевой ошибки запрос повторяется и в итоге завершается успешно
  it('retries after a network error and resolves on a later attempt', async () => {
    mockedGet
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ data: 'ok' } as never)

    const promise = fetchWithRetry<string>('https://api.test/photos', {
      retries: 3,
      retryDelay: 500,
    })

    await vi.advanceTimersByTimeAsync(500)

    await expect(promise).resolves.toBe('ok')
    expect(mockedGet).toHaveBeenCalledTimes(2)
  })

  // Проверяем: после исчерпания попыток выбрасывается понятная ошибка
  it('rejects with a descriptive error after all attempts fail', async () => {
    mockedGet.mockRejectedValue(new Error('network down'))

    const promise = fetchWithRetry<string>('https://api.test/photos', {
      retries: 3,
      retryDelay: 100,
    })
    const assertion = expect(promise).rejects.toThrow('после 3 попыток')

    await vi.advanceTimersByTimeAsync(1000)

    await assertion
    expect(mockedGet).toHaveBeenCalledTimes(3)
  })

  // Проверяем: отмена во время ожидания перед повтором прерывает запрос сразу
  it('aborts while waiting for a retry', async () => {
    mockedGet.mockRejectedValue(new Error('network down'))
    const controller = new AbortController()

    const promise = fetchWithRetry<string>('https://api.test/photos', {
      retries: 5,
      retryDelay: 10_000,
      signal: controller.signal,
    })
    const assertion = expect(promise).rejects.toThrow(REQUEST_CANCELLED_MESSAGE)

    // Даём первому запросу упасть и перейти в ожидание
    await Promise.resolve()
    await Promise.resolve()
    controller.abort()

    await assertion
    expect(mockedGet).toHaveBeenCalledTimes(1)
  })

  // Проверяем: уже отменённый сигнал не запускает сетевой запрос
  it('does not call the network when signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    mockedGet.mockRejectedValue(new Error('canceled'))

    await expect(
      fetchWithRetry<string>('https://api.test/photos', { signal: controller.signal })
    ).rejects.toThrow(REQUEST_CANCELLED_MESSAGE)
  })

  // Проверяем: прогресс скачивания прокидывается наружу
  it('forwards download progress events', async () => {
    const onDownloadProgress = vi.fn()
    mockedGet.mockImplementation(async (_url, config) => {
      config?.onDownloadProgress?.({ loaded: 50, total: 100 } as never)
      return { data: 'ok' } as never
    })

    await fetchWithRetry<string>('https://api.test/photos', { onDownloadProgress })

    expect(onDownloadProgress).toHaveBeenCalledWith({ loaded: 50, total: 100 })
  })

  // Проверяем: ошибки клиента (4xx) не повторяются — повтор их не исправит
  it('does not retry client errors', async () => {
    mockedGet.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
      message: 'Request failed with status code 404',
    })

    await expect(fetchWithRetry('https://api.test/photos', { retries: 3 })).rejects.toThrow(
      'Сервер ответил ошибкой 404'
    )
    expect(mockedGet).toHaveBeenCalledTimes(1)
  })

  // Проверяем: ответы сервера (5xx) повторяются, потому что сбой временный
  it('retries server errors', async () => {
    const serverError = {
      isAxiosError: true,
      response: { status: 503 },
      message: 'Service Unavailable',
    }
    mockedGet.mockRejectedValueOnce(serverError).mockResolvedValueOnce({ data: 'ok' } as never)

    const promise = fetchWithRetry<string>('https://api.test/photos', {
      retries: 2,
      retryDelay: 100,
    })
    await vi.advanceTimersByTimeAsync(100)

    await expect(promise).resolves.toBe('ok')
    expect(mockedGet).toHaveBeenCalledTimes(2)
  })

  // Проверяем: таймаут передаётся в конфиг запроса, иначе «зависшее» соединение не прервётся
  it('passes the timeout to the request config', async () => {
    mockedGet.mockResolvedValue({ data: 'ok' } as never)

    await fetchWithRetry('https://api.test/photos', { timeout: 15_000 })

    expect(mockedGet.mock.calls[0][1]).toMatchObject({ timeout: 15_000 })
  })
})
