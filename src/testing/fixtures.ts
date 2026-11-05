import type { Photo, PhotoPage } from '@/entities/photo'

/**
 * Фабрика тестовых фото.
 *
 * Каталог `src/testing` намеренно находится вне слоёв FSD: это тестовая обвязка,
 * ей разрешено импортировать `entities`. Продакшн-код сюда не импортирует.
 */
export function createPhoto(overrides: Partial<Photo> = {}): Photo {
  const id = overrides.id ?? 1

  return {
    albumId: 1,
    id,
    title: `photo ${id}`,
    url: `https://example.com/600/${id}.jpg`,
    thumbnailUrl: `https://example.com/150/${id}.jpg`,
    ...overrides,
  }
}

/** Создаёт список фото с последовательными id */
export function createPhotos(count: number, overrides: Partial<Photo> = {}): Photo[] {
  return Array.from({ length: count }, (_, index) => createPhoto({ id: index + 1, ...overrides }))
}

/**
 * Страница ответа сервера: `size` записей начиная со смещения `start`.
 * `totalCount: null` — сервер не сообщил общее число записей.
 */
export function createPhotoPage(start: number, size: number, totalCount: number | null): PhotoPage {
  return {
    photos: Array.from({ length: size }, (_, index) => createPhoto({ id: start + index + 1 })),
    totalCount,
  }
}
