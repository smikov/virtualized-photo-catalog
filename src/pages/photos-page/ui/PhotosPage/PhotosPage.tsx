import { useAppSelector } from '@/app/store'
import { LoadPhotosFeature, selectLoadStatus } from '@/features/load-photos'
import { PhotosTableSkeleton } from '@/widgets/photos-table'
import { PhotosCatalogWidget } from '@/widgets/photos-catalog/ui/PhotosCatalogWidget/PhotosCatalogWidget'
import styles from './PhotosPage.module.css'

/**
 * Страница каталога фотографий, объединяющая загрузку, поиск и виртуализированную таблицу
 */
export function PhotosPage() {
  const status = useAppSelector(selectLoadStatus)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Фотокаталог (JSONPlaceholder)</h1>
        <p className={styles.subtitle}>
          Демонстрация FSD архитектуры, виртуализированной таблицы TanStack и эффективного поиска.
        </p>
      </header>

      <LoadPhotosFeature />

      {status === 'loading' && <PhotosTableSkeleton />}

      {status === 'succeeded' && <PhotosCatalogWidget />}
    </main>
  )
}

export default PhotosPage
