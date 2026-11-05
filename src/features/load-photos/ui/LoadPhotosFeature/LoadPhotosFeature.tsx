import { useEffect } from 'react'
import { useAppDispatch } from '@/app/store'
import { env } from '@/shared/config/env'
import { Button } from '@/shared/ui'
import { loadPhotos, cancelLoad, type LoadStatus } from '../../model/loadPhotosSlice'
import { useLoadPhotos } from './useLoadPhotos'
import { StateNotice } from './StateNotice'
import { AlertIcon, CancelledIcon, ImagesIcon } from './icons'
import styles from './LoadPhotosFeature.module.css'

const STATUS_LABELS: Record<LoadStatus, string> = {
  idle: 'Ожидание',
  loading: 'Загрузка',
  succeeded: 'Готово',
  failed: 'Ошибка',
  cancelled: 'Отменено',
}

interface LoadPhotosFeatureProps {
  autoLoad?: boolean
}

/**
 * Компонент управления загрузкой данных с прогресс-баром и кнопками отмены/повтора.
 *
 * @param {LoadPhotosFeatureProps} props - Свойства компонента.
 * @returns {JSX.Element} Компонент управления загрузкой.
 */
export function LoadPhotosFeature({
  autoLoad = env.VITE_PHOTOS_AUTOLOAD,
}: LoadPhotosFeatureProps = {}) {
  const dispatch = useAppDispatch()
  const {
    status,
    data,
    progress,
    loadedCount,
    error,
    progressIsKnown,
    waitingForFirstPage,
    showIndeterminate,
    handleLoad,
    handleCancel,
  } = useLoadPhotos()

  useEffect(() => {
    if (autoLoad) {
      void dispatch(loadPhotos())
    }

    return () => {
      void dispatch(cancelLoad())
    }
  }, [autoLoad, dispatch])

  return (
    <section
      className={styles.panel}
      aria-label="Загрузка фотографий"
      aria-busy={status === 'loading'}
    >
      {(status === 'loading' || status === 'succeeded') && (
        <div className={styles.header}>
          <span>
            Статус загрузки: <strong className={styles.value}>{STATUS_LABELS[status]}</strong>
          </span>
          {status === 'loading' && (
            <span aria-live="polite">
              {progressIsKnown
                ? `Загружено: ${progress}%`
                : waitingForFirstPage
                  ? 'Соединяемся с сервером…'
                  : `Загружено записей: ${loadedCount}`}
            </span>
          )}
        </div>
      )}

      {status === 'loading' && (
        <>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={showIndeterminate ? undefined : progress}
            aria-label="Прогресс загрузки фотографий"
            className={styles.progressTrack}
          >
            <div
              className={showIndeterminate ? styles.progressFillIndeterminate : styles.progressFill}
              style={showIndeterminate ? undefined : { width: `${progress}%` }}
            />
          </div>
          <Button variant="danger" onClick={handleCancel}>
            Отменить загрузку
          </Button>
        </>
      )}

      {status === 'idle' && (
        <StateNotice
          icon={<ImagesIcon />}
          title="Данные ещё не загружены"
          description="Загрузите каталог фотографий с сервера — загрузку можно будет прервать в любой момент"
          actionLabel="Загрузить данные"
          onAction={handleLoad}
        />
      )}

      {status === 'cancelled' && (
        <StateNotice
          icon={<CancelledIcon />}
          title="Загрузка отменена"
          description="Данные не получены полностью. Можно начать заново — загрузка начнётся сначала"
          actionLabel="Повторить загрузку"
          onAction={handleLoad}
        />
      )}

      {status === 'failed' && (
        <StateNotice
          icon={<AlertIcon />}
          title="Не удалось загрузить данные"
          description={error ?? 'Произошла неизвестная ошибка.'}
          tone="error"
          actionLabel="Повторить загрузку"
          onAction={handleLoad}
        />
      )}

      {status === 'succeeded' && (
        <p className={styles.successMessage}>Успешно загружено записей: {data.length}</p>
      )}
    </section>
  )
}
