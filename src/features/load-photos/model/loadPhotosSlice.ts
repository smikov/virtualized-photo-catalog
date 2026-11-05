import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { type Photo } from '@/entities/photo'
import { AbortError } from '@/shared/lib/errors'
import { env } from '@/shared/config/env'
import { reportError } from '@/shared/lib/errorReporter'
import type { RequestsExtra } from '@/shared/lib/requestRegistry'
import { mergePages, calculateProgress } from './pagePlan'
import { loadAllPages } from './loadPages'

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed' | 'cancelled'

export interface LoadPhotosState {
  data: Photo[]
  status: LoadStatus
  progress: number
  loadedPages: number
  totalPages: number | null
  loadedCount: number
  error: string | null
  currentRequestId: string | null
}

const initialState: LoadPhotosState = {
  data: [],
  status: 'idle',
  progress: 0,
  loadedPages: 0,
  totalPages: null,
  loadedCount: 0,
  error: null,
  currentRequestId: null,
}

interface LoadPhotosThunkConfig {
  rejectValue: string
  extra: RequestsExtra
}

export const loadPhotos = createAsyncThunk<Photo[], void, LoadPhotosThunkConfig>(
  'loadPhotos/fetch',
  async (_arg, { dispatch, signal, rejectWithValue, extra }) => {
    const controller = extra.requests.start()
    const onReduxAbort = () => controller.abort()
    signal.addEventListener('abort', onReduxAbort, { once: true })

    const context = {
      url: env.VITE_API_URL,
      pageSize: env.VITE_API_PAGE_SIZE,
      signal: controller.signal,
      abort: () => controller.abort('failed'),
    }

    let loadedPages = 0
    let loadedCount = 0

    try {
      const result = await loadAllPages(context, {
        onPageLoaded: (page, totalPages) => {
          loadedPages += 1
          loadedCount += page.photos.length
          dispatch(setPageStats({ loadedPages, totalPages, loadedCount }))
        },
      })

      dispatch(setProgress(100))
      return mergePages(result.pages)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)

      if (error instanceof AbortError) {
        return rejectWithValue('Загрузка была отменена пользователем')
      }

      reportError(error, { scope: 'loadPhotos', url: env.VITE_API_URL })
      return rejectWithValue(message)
    } finally {
      signal.removeEventListener('abort', onReduxAbort)
      extra.requests.finish(controller)
    }
  }
)

/** Отмена загрузки: прерывает HTTP-запросы всех страниц, состояние 'cancelled' выставит rejected-обработчик */
export const cancelLoad = createAsyncThunk<void, void, { extra: RequestsExtra }>(
  'loadPhotos/cancel',
  async (_arg, { extra }) => {
    extra.requests.abortCurrent()
  }
)

const loadPhotosSlice = createSlice({
  name: 'loadPhotos',
  initialState,
  reducers: {
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload
    },
    setPageStats: (
      state,
      action: PayloadAction<{ loadedPages: number; totalPages: number | null; loadedCount: number }>
    ) => {
      state.loadedPages = action.payload.loadedPages
      state.totalPages = action.payload.totalPages
      state.loadedCount = action.payload.loadedCount
      state.progress = calculateProgress(action.payload.loadedPages, action.payload.totalPages)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPhotos.pending, (state, action) => {
        state.status = 'loading'
        state.progress = 0
        state.loadedPages = 0
        state.totalPages = null
        state.loadedCount = 0
        state.error = null
        state.currentRequestId = action.meta.requestId
      })
      .addCase(loadPhotos.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return
        state.status = 'succeeded'
        state.data = action.payload
        state.loadedCount = action.payload.length
        state.progress = 100
        state.currentRequestId = null
      })
      .addCase(loadPhotos.rejected, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return
        state.currentRequestId = null

        if (action.payload === 'Загрузка была отменена пользователем') {
          state.status = 'cancelled'
          state.error = null
          state.progress = 0
          return
        }

        state.status = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Произошла неизвестная ошибка'
      })
  },
})

export const { setProgress, setPageStats } = loadPhotosSlice.actions
export default loadPhotosSlice.reducer
