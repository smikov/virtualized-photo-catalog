/**
 * Проверяем реестр запросов — основу отмены.
 *
 * Почему так: реестр решает две задачи: новый запрос отменяет предыдущий и отмена
 * доходит до актуального запроса, а не до уже завершённого. Обе ломаются незаметно,
 * поэтому проверяются отдельно от стора.
 */
import { describe, it, expect, vi } from 'vitest'
import { createRequestRegistry } from './requestRegistry'

describe('requestRegistry', () => {
  // Проверяем: новый запрос прерывает предыдущий, чтобы тот не влиял на прогресс
  it('aborts the previous request when a new one starts', () => {
    const registry = createRequestRegistry()

    const first = registry.start()
    const second = registry.start()

    expect(first.signal.aborted).toBe(true)
    expect(second.signal.aborted).toBe(false)
  })

  // Проверяем: отмена прерывает текущий запрос
  it('aborts the current request', () => {
    const registry = createRequestRegistry()
    const controller = registry.start()

    registry.abortCurrent()

    expect(controller.signal.aborted).toBe(true)
  })

  // Проверяем: завершение устаревшего запроса не сбрасывает ссылку на актуальный
  it('ignores finish calls from a superseded request', () => {
    const registry = createRequestRegistry()
    const first = registry.start()
    const second = registry.start()

    registry.finish(first)
    registry.abortCurrent()

    expect(second.signal.aborted).toBe(true)
  })

  // Проверяем: реестры независимы — состояние не разделяется между экземплярами
  it('keeps registries independent', () => {
    const aborted = vi.fn()
    const first = createRequestRegistry()
    const second = createRequestRegistry()

    second.start()
    first.start().signal.addEventListener('abort', aborted)
    second.abortCurrent()

    expect(aborted).not.toHaveBeenCalled()
  })
})
