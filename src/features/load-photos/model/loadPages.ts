import { LoadedPage, createPagePlan } from './pagePlan'
import { runPagePool } from './pagePool'
import { fetchPhotoPage } from '@/entities/photo'
import { env } from '@/shared/config/env'

/**
 * Контекст загрузки страниц.
 */
export interface LoadPagesContext {
  url: string
  pageSize: number
  signal: AbortSignal
  abort: () => void
}

/**
 * Колбэки для отслеживания прогресса.
 */
export interface ProgressCallbacks {
  onPageLoaded: (page: LoadedPage, totalPages: number | null) => void
}

/**
 * Оркестрация загрузки: выбор стратегии (последовательно или пул) и выполнение.
 *
 * @param {LoadPagesContext} context - Контекст загрузки.
 * @param {ProgressCallbacks} callbacks - Колбэки прогресса.
 * @returns {Promise<{ pages: LoadedPage[]; totalPages: number | null }>} Результат загрузки страниц.
 */
export async function loadAllPages(
  context: LoadPagesContext,
  callbacks: ProgressCallbacks
): Promise<{ pages: LoadedPage[]; totalPages: number | null }> {
  const allPages: LoadedPage[] = []

  const loadPage = async (pageIndex: number): Promise<LoadedPage> => {
    const page = await fetchPhotoPage({
      url: context.url,
      start: pageIndex * context.pageSize,
      limit: context.pageSize,
      retries: env.VITE_API_RETRIES,
      retryDelay: env.VITE_API_RETRY_DELAY,
      timeout: env.VITE_API_TIMEOUT_MS,
      signal: context.signal,
    })
    return { index: pageIndex, photos: page.photos }
  }

  const firstPage = await fetchPhotoPage({
    url: context.url,
    start: 0,
    limit: context.pageSize,
    retries: env.VITE_API_RETRIES,
    retryDelay: env.VITE_API_RETRY_DELAY,
    timeout: env.VITE_API_TIMEOUT_MS,
    signal: context.signal,
  })
  const firstLoaded: LoadedPage = { index: 0, photos: firstPage.photos }
  allPages.push(firstLoaded)

  const totalCount = firstPage.totalCount ?? env.VITE_API_TOTAL_PHOTOS ?? null
  const plan = createPagePlan(totalCount, context.pageSize)
  callbacks.onPageLoaded(firstLoaded, plan.totalPages)

  if (plan.totalPages === null) {
    let pageIndex = 1
    while (true) {
      const page = await loadPage(pageIndex)
      allPages.push(page)
      callbacks.onPageLoaded(page, null)
      if (page.photos.length < context.pageSize) break
      pageIndex++
    }
  } else if (plan.totalPages > 1) {
    const pages = await runPagePool(
      plan.totalPages,
      env.VITE_API_MAX_CONCURRENCY,
      async (pageIndex) => {
        const loaded = await loadPage(pageIndex)
        callbacks.onPageLoaded(loaded, plan.totalPages)
        return loaded
      },
      context.abort
    )
    allPages.push(...pages)
  }

  return { pages: allPages, totalPages: plan.totalPages }
}
