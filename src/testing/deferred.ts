/**
 * Отложенные обещания и «вечные» запросы для тестов.
 *
 * Почему так: сценарии загрузки зависят от порядка ответов и отмены. Управлять ими
 * можно только вручную — тест сам решает, когда и в каком порядке ответить серверу.
 * Поэтому промиc создаётся здесь, а разрешается из тела теста.
 */

import { REQUEST_CANCELLED_MESSAGE } from '@/shared/api'

export interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
}

/** Создаёт обещание вместе с функциями его завершения */
export function createDeferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => {}
  let reject: (error: unknown) => void = () => {}

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

/**
 * Запрос, который сам не завершится — только по отмене.
 *
 * Так воспроизводится «зависшая» загрузка: тест успевает нажать «Отменить», не гоняясь
 * с таймером, а отмена приходит тем же путём, что и в реальном HTTP-клиенте.
 */
export function pendingUntilAbort<T>(signal?: AbortSignal): Promise<T> {
  return new Promise<T>((_resolve, reject) => {
    signal?.addEventListener('abort', () => reject(new Error(REQUEST_CANCELLED_MESSAGE)))
  })
}
