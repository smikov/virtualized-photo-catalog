import styles from './PhotosTableSkeleton.module.css'

interface PhotosTableSkeletonProps {
  rows?: number
}

/**
 * Скелетон таблицы на время загрузки: сохраняет высоту блока,
 * чтобы интерфейс не «прыгал» после появления данных
 */
export function PhotosTableSkeleton({ rows = 6 }: PhotosTableSkeletonProps) {
  return (
    <div className={styles.container} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div className={styles.row} key={index}>
          <span className={styles.cellShort} />
          <span className={styles.thumbnail} />
          <span className={styles.cellLong} />
        </div>
      ))}
    </div>
  )
}
