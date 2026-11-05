import type { LoadPhotosState } from './loadPhotosSlice'

/**
 * Селекторы среза загрузки.
 */

interface LoadPhotosRootState {
  loadPhotos: LoadPhotosState
}

export const selectLoadStatus = (state: LoadPhotosRootState) => state.loadPhotos.status
export const selectPhotos = (state: LoadPhotosRootState) => state.loadPhotos.data
export const selectLoadProgress = (state: LoadPhotosRootState) => state.loadPhotos.progress
export const selectLoadedPages = (state: LoadPhotosRootState) => state.loadPhotos.loadedPages
export const selectTotalPages = (state: LoadPhotosRootState) => state.loadPhotos.totalPages
export const selectLoadedCount = (state: LoadPhotosRootState) => state.loadPhotos.loadedCount
export const selectLoadError = (state: LoadPhotosRootState) => state.loadPhotos.error
