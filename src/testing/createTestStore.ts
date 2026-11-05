/**
 * Собранный стор для тестов.
 *
 * Почему так: компонентам и thunk'ам нужен реальный Redux с реестром запросов в `extra`.
 * Каждый вызов создаёт свой реестр, иначе состояние отмены перетекало бы между кейсами,
 * а глобальный стор из `app` тащил бы за собой данные одного теста в другой.
 */
import { configureStore } from '@reduxjs/toolkit'
import loadPhotosReducer from '@/features/load-photos/model/loadPhotosSlice'
import { createRequestRegistry } from '@/shared/lib/requestRegistry'

export function createTestStore() {
  return configureStore({
    reducer: { loadPhotos: loadPhotosReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: { requests: createRequestRegistry() } } }),
  })
}

export type TestStore = ReturnType<typeof createTestStore>
