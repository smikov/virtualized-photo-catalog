import type { store } from './store'

/**
 * Тип состояния корневого Redux-хранилища.
 */
export type RootState = ReturnType<typeof store.getState>

/**
 * Тип для отправки экшенов в Redux-хранилище.
 */
export type AppDispatch = typeof store.dispatch
