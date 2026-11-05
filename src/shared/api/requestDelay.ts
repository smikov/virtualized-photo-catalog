import axios from 'axios'

/**
 * Ожидание, прерываемое отменой: при abort промис отклоняется сразу,
 * не дожидаясь конца таймера.
 *
 * @param {number} ms - Время ожидания в миллисекундах.
 * @param {AbortSignal} [signal] - Сигнал отмены.
 * @returns {Promise<void>} Промис, который разрешается по истечении времени.
 */
export function delayWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Ожидание отменено'))
      return
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    function onAbort() {
      clearTimeout(timer)
      reject(new Error('Ожидание отменено'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Устанавливает искусственную задержку перед каждым HTTP-запросом.
 *
 * Назначение — демонстрация и ручная проверка сценариев прогресса и отмены загрузки.
 * Бизнес-логика о задержке не знает: подключается в composition root (`app/index.tsx`)
 * и работает только если `VITE_API_ARTIFICIAL_DELAY_MS > 0`. При нуле перехватчик не ставится.
 *
 * @param {number} delayMs - Задержка в миллисекундах.
 * @returns {number | null} Идентификатор перехватчика или null, если задержка выключена.
 */
export function installRequestDelay(delayMs: number): number | null {
  if (delayMs <= 0) return null

  return axios.interceptors.request.use(async (config) => {
    const signal = config.signal as unknown as AbortSignal | undefined
    try {
      await delayWithAbort(delayMs, signal)
    } catch (error) {
      throw new axios.CanceledError('Запрос отменён во время искусственной задержки', undefined, {
        cause: error,
      })
    }
    return config
  })
}
