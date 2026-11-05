import { configureStore } from '@reduxjs/toolkit'
import { createRequestRegistry } from '@/shared/lib/requestRegistry'
import loadPhotosReducer from '@/features/load-photos/model/loadPhotosSlice'

/**
 * Redux-хранилище приложения.
 */
export const store = configureStore({
  reducer: {
    loadPhotos: loadPhotosReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: { requests: createRequestRegistry() } },
    }),
})
