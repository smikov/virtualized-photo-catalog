import { photosListSchema, type Photo } from '../model/photoSchema'
import { fetchWithRetryResponse, type FetchOptions } from '@/shared/api'

/**
 * Информация о странице фотографий.
 */
export interface PhotoPage {
  photos: Photo[]
  /** Общее число записей по данным сервера (заголовок X-Total-Count), null — сервер не сообщил */
  totalCount: number | null
}

/**
 * Параметры загрузки страницы фотографий.
 */
export interface FetchPhotoPageParams extends FetchOptions {
  url: string
  /** Смещение первой записи страницы */
  start: number
  /** Размер страницы */
  limit: number
}

/**
 * Загружает одну страницу фотографий.
 *
 * @param {FetchPhotoPageParams} params - Параметры запроса.
 * @returns {Promise<PhotoPage>} Результат загрузки страницы.
 */
export async function fetchPhotoPage({
  url,
  start,
  limit,
  ...options
}: FetchPhotoPageParams): Promise<PhotoPage> {
  let pageUrl: URL
  try {
    pageUrl = new URL(url)
  } catch (error) {
    throw new Error(
      `Некорректный адрес API "${url}": ожидается абсолютный URL (см. VITE_API_URL в .env)`,
      { cause: error }
    )
  }
  pageUrl.searchParams.set('_start', String(start))
  pageUrl.searchParams.set('_limit', String(limit))

  const { data, headers } = await fetchWithRetryResponse<unknown>(pageUrl.toString(), options)

  const parsed = photosListSchema.safeParse(data)
  if (!parsed.success) {
    const details = parsed.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')
    throw new Error(`Некорректные данные от сервера: ${details}`, { cause: parsed.error })
  }

  const totalHeader = headers['x-total-count']
  const totalCount = totalHeader ? Number(totalHeader) : null

  return {
    photos: parsed.data,
    totalCount: totalCount !== null && Number.isFinite(totalCount) ? totalCount : null,
  }
}
