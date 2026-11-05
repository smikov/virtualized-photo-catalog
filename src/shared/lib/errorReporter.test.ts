/**
 * Проверяем шов для отчётности об ошибках.
 *
 * Почему так: приёмник должен подменяться без правок компонентов, а по умолчанию —
 * не терять ошибку. Эти два свойства и проверяются, чтобы подключение Sentry позже
 * не потребовало переписывать ErrorBoundary.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { reportError, setErrorSink, resetErrorSink } from './errorReporter'

describe('errorReporter', () => {
  afterEach(() => {
    resetErrorSink()
    vi.restoreAllMocks()
  })

  // Проверяем: подменённый приёмник получает ошибку вместе с контекстом
  it('forwards the error and context to the configured sink', () => {
    const sink = vi.fn()
    setErrorSink(sink)

    const error = new Error('boom')
    reportError(error, { component: 'ErrorBoundary' })

    expect(sink).toHaveBeenCalledWith(error, { component: 'ErrorBoundary' })
  })

  // Проверяем: по умолчанию ошибка попадает в консоль, а не теряется
  it('logs to console by default', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    reportError(new Error('boom'), { scope: 'default' })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[app] Необработанная ошибка',
      { scope: 'default' },
      expect.any(Error)
    )
  })

  // Проверяем: после сброса снова используется приёмник по умолчанию
  it('restores the default sink after reset', () => {
    const sink = vi.fn()
    setErrorSink(sink)
    resetErrorSink()

    reportError(new Error('boom'))

    expect(sink).not.toHaveBeenCalled()
  })
})
