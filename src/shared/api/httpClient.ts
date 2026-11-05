import axios, { AxiosRequestConfig } from 'axios'
import { delayWithAbort } from './requestDelay'

export const REQUEST_CANCELLED_MESSAGE = 'Загрузка была отменена пользователем'

/**
 * Опции для выполнения сетевого запроса.
 */
export interface FetchOptions {
  signal?: AbortSignal
  onDownloadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  retries?: number
  retryDelay?: number
  /**
   * Таймаут запроса в миллисекундах.
   */
  timeout?: number
}

/**
 * Результат выполнения сетевого запроса.
 */
export interface FetchResult<T> {
  data: T
  headers: Record<string, string | undefined>
}

/**
 * Проверяет, можно ли повторить запрос при ошибке.
 *
 * @param {unknown} error - Объект ошибки.
 * @returns {boolean} True, если запрос можно повторить, иначе false.
 */
function isRetryableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return true

  const status = error.response?.status
  if (status === undefined) return true

  return status >= 500 || status === 408 || status === 429
}

/**
 * Возвращает понятное пользователю сообщение об ошибке.
 *
 * @param {unknown} error - Объект ошибки.
 * @returns {string} Текст ошибки.
 */
function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status !== undefined) return `Сервер ответил ошибкой ${status}`
    if (error.code === 'ECONNABORTED') return 'Превышено время ожидания ответа от сервера'
  }
  return error instanceof Error ? error.message : String(error)
}

/**
 * Выполняет сетевой запрос с поддержкой повторных попыток, отмены и прогресса.
 *
 * @template T - Тип данных ответа.
 * @param {string} url - URL для запроса.
 * @param {FetchOptions} [options={}] - Опции запроса.
 * @returns {Promise<FetchResult<T>>} Результат выполнения запроса.
 */
export async function fetchWithRetryResponse<T>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const { signal, onDownloadProgress, retries = 3, retryDelay = 1000, timeout } = options

  let attempt = 0

  for (;;) {
    try {
      const config: AxiosRequestConfig = {
        signal,
        timeout,
        onDownloadProgress: (progressEvent) => {
          onDownloadProgress?.({
            loaded: progressEvent.loaded,
            total: progressEvent.total ?? undefined,
          })
        },
      }

      const response = await axios.get<T>(url, config)
      return { data: response.data, headers: response.headers as Record<string, string> }
    } catch (error: unknown) {
      if (axios.isCancel(error) || signal?.aborted) {
        throw new Error(REQUEST_CANCELLED_MESSAGE, { cause: error })
      }

      if (!isRetryableError(error)) {
        throw new Error(describeError(error), { cause: error })
      }

      attempt++
      if (attempt >= retries) {
        throw new Error(
          `Не удалось загрузить данные после ${retries} попыток. ${describeError(error)}`,
          {
            cause: error,
          }
        )
      }

      try {
        await delayWithAbort(retryDelay, signal)
      } catch (error) {
        throw new Error(REQUEST_CANCELLED_MESSAGE, { cause: error })
      }
    }
  }
}

/**
 * Выполняет сетевой запрос с поддержкой повторных попыток.
 *
 * @template T - Тип данных ответа.
 * @param {string} url - URL для запроса.
 * @param {FetchOptions} [options={}] - Опции запроса.
 * @returns {Promise<T>} Данные ответа.
 */
export async function fetchWithRetry<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { data } = await fetchWithRetryResponse<T>(url, options)
  return data
}
