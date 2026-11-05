import type { Photo } from '@/entities/photo'

/**
 * Данные одной страницы загрузки.
 */
export interface LoadedPage {
  index: number
  photos: Photo[]
}

/**
 * План загрузки страниц.
 */
export interface PagePlan {
  pageSize: number
  totalPages: number | null
}

/**
 * Вычисляет план загрузки по общему числу записей.
 * Возвращает null, если число записей неизвестно — тогда загрузка идёт последовательно до короткой страницы.
 *
 * @param {number | null} totalCount - Общее число записей от сервера.
 * @param {number} pageSize - Количество записей на страницу.
 * @returns {PagePlan} План загрузки страниц.
 */
export function createPagePlan(totalCount: number | null, pageSize: number): PagePlan {
  if (!totalCount || totalCount <= 0) {
    return { pageSize, totalPages: null }
  }

  return { pageSize, totalPages: Math.ceil(totalCount / pageSize) }
}

/**
 * Собирает страницы в единый список в порядке номеров страниц, независимо от порядка их получения.
 *
 * @param {LoadedPage[]} pages - Загруженные страницы.
 * @returns {Photo[]} Объединённый список фотографий.
 */
export function mergePages(pages: LoadedPage[]): Photo[] {
  return [...pages].sort((left, right) => left.index - right.index).flatMap((page) => page.photos)
}

/**
 * Вычисляет процент загрузки по числу полученных страниц. До финального склеивания не более 99%.
 *
 * @param {number} loadedPages - Количество уже полученных страниц.
 * @param {number | null} totalPages - Общее количество страниц.
 * @returns {number} Процент загрузки (0–100).
 */
export function calculateProgress(loadedPages: number, totalPages: number | null): number {
  if (!totalPages || totalPages <= 0) return 0
  const percent = Math.floor((loadedPages / totalPages) * 100)
  return Math.min(99, percent)
}
