import { LoadedPage } from './pagePlan'

export interface PageLoader {
  (pageIndex: number): Promise<LoadedPage>
}

/**
 * Пул воркеров: параллельная загрузка страниц.
 * Первая ошибка прерывает пул и возвращается наружу.
 *
 * @param {number} totalPages - Общее количество страниц.
 * @param {number} concurrency - Максимальное количество параллельных запросов.
 * @param {PageLoader} loadPage - Функция загрузки одной страницы.
 * @param {() => void} [abort] - Функция прерывания.
 * @returns {Promise<LoadedPage[]>} Список загруженных страниц.
 */
export async function runPagePool(
  totalPages: number,
  concurrency: number,
  loadPage: PageLoader,
  abort?: () => void
): Promise<LoadedPage[]> {
  const pages: LoadedPage[] = []
  let nextPage = 1
  let failure: unknown = null

  const loadNextPages = async () => {
    while (nextPage < totalPages && !failure) {
      const pageIndex = nextPage++
      try {
        const page = await loadPage(pageIndex)
        pages.push(page)
      } catch (error) {
        if (!failure) {
          failure = error
          abort?.()
        }
      }
    }
  }

  const workers = Math.min(concurrency, totalPages - 1)
  await Promise.all(Array.from({ length: workers }, loadNextPages))

  if (failure) throw failure
  return pages
}
