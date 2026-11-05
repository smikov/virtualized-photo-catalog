/**
 * Проверяем демонстрационную задержку запросов.
 *
 * Почему так: она нужна только для ручной проверки отмены, но ошибиться в ней легко —
 * пауза, которую нельзя прервать, делает кнопку «Отменить» бесполезной. Поэтому
 * проверяется, что отмена прерывает ожидание сразу, а при нуле задержки перехватчик
 * вообще не ставится.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import axios from 'axios'
import { delayWithAbort, installRequestDelay } from './requestDelay'

describe('delayWithAbort', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves after the delay', async () => {
    vi.useFakeTimers()
    const promise = delayWithAbort(1000)
    const spy = vi.fn()
    void promise.then(spy)

    await vi.advanceTimersByTimeAsync(999)
    expect(spy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    await promise
    expect(spy).toHaveBeenCalled()
  })

  it('rejects immediately when aborted during the delay', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const promise = delayWithAbort(10_000, controller.signal)
    const assertion = expect(promise).rejects.toThrow('Ожидание отменено')

    controller.abort()

    await assertion
  })

  it('rejects immediately when the signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(delayWithAbort(10_000, controller.signal)).rejects.toThrow('Ожидание отменено')
  })

  it('delays real axios requests when installed', async () => {
    vi.useFakeTimers()
    const interceptorId = installRequestDelay(500)
    const adapter = vi.fn(async (config) => ({
      data: 'ok',
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }))

    const request = axios.get('http://test.local/photos', { adapter })

    await vi.advanceTimersByTimeAsync(499)
    expect(adapter).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    await request
    expect(adapter).toHaveBeenCalled()

    if (interceptorId !== null) axios.interceptors.request.eject(interceptorId)
  })

  it('does not install an interceptor for zero delay', () => {
    expect(installRequestDelay(0)).toBeNull()
  })
})
