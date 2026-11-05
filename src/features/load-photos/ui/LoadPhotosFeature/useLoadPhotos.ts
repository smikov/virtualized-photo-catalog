import { useAppDispatch, useAppSelector } from '@/app/store'
import { loadPhotos, cancelLoad } from '../../model/loadPhotosSlice'
import {
  selectLoadStatus,
  selectPhotos,
  selectLoadProgress,
  selectLoadedPages,
  selectTotalPages,
  selectLoadedCount,
  selectLoadError,
} from '../../model/selectors'

export function useLoadPhotos() {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectLoadStatus)
  const data = useAppSelector(selectPhotos)
  const progress = useAppSelector(selectLoadProgress)
  const loadedPages = useAppSelector(selectLoadedPages)
  const totalPages = useAppSelector(selectTotalPages)
  const loadedCount = useAppSelector(selectLoadedCount)
  const error = useAppSelector(selectLoadError)

  const progressIsKnown = totalPages !== null
  const waitingForFirstPage = loadedPages === 0
  const showIndeterminate = !progressIsKnown && !waitingForFirstPage

  return {
    status,
    data,
    progress,
    loadedPages,
    totalPages,
    loadedCount,
    error,
    progressIsKnown,
    waitingForFirstPage,
    showIndeterminate,
    handleLoad: () => void dispatch(loadPhotos()),
    handleCancel: () => void dispatch(cancelLoad()),
  }
}

export type LoadPhotosController = ReturnType<typeof useLoadPhotos>
