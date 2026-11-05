export type ErrorSink = (error: unknown, context: Record<string, unknown>) => void

const defaultSink: ErrorSink = (error, context) => {
  console.error('[app] Необработанная ошибка', context, error)
}

let currentSink: ErrorSink = defaultSink

/**
 * Устанавливает кастомный обработчик (приёмник) ошибок.
 * Используется для инициализации приложения или в тестах.
 *
 * @param {ErrorSink} sink - Функция-обработчик ошибок.
 */
export function setErrorSink(sink: ErrorSink): void {
  currentSink = sink
}

/**
 * Сбрасывает приёмник ошибок до значения по умолчанию.
 */
export function resetErrorSink(): void {
  currentSink = defaultSink
}

/**
 * Отправляет ошибку в текущий приёмник с дополнительным контекстом.
 *
 * @param {unknown} error - Объект ошибки.
 * @param {Record<string, unknown>} [context={}] - Контекстные данные об ошибке.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}): void {
  currentSink(error, context)
}
