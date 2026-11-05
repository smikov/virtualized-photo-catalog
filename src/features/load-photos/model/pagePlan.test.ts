/**
 * Проверяем чистую математику загрузки: страницы, склейку и процент.
 *
 * Почему так: это функции без зависимостей — их дешевле и надёжнее тестировать
 * напрямую, чем через стор. Границы (неполная последняя страница, неизвестное число
 * записей, ограничение 99%) — типичные источники ошибок «на единицу».
 */
import { describe, it, expect } from 'vitest'
import { calculateProgress, createPagePlan, mergePages } from './pagePlan'
import { createPhoto } from '@/testing/fixtures'

describe('createPagePlan', () => {
  it('calculates the number of pages', () => {
    expect(createPagePlan(5000, 500)).toEqual({ pageSize: 500, totalPages: 10 })
  })

  it('rounds up a partial last page', () => {
    expect(createPagePlan(1200, 500)).toEqual({ pageSize: 500, totalPages: 3 })
  })

  it('returns null total pages when the total is unknown', () => {
    expect(createPagePlan(null, 500)).toEqual({ pageSize: 500, totalPages: null })
  })
})

describe('mergePages', () => {
  it('merges pages in page order regardless of arrival order', () => {
    const merged = mergePages([
      { index: 2, photos: [createPhoto({ id: 5 })] },
      { index: 0, photos: [createPhoto({ id: 1 }), createPhoto({ id: 2 })] },
      { index: 1, photos: [createPhoto({ id: 3 })] },
    ])

    expect(merged.map((photo) => photo.id)).toEqual([1, 2, 3, 5])
  })
})

describe('calculateProgress', () => {
  it('calculates percent from loaded pages', () => {
    expect(calculateProgress(3, 10)).toBe(30)
  })

  it('never reports 100 percent while pages are still being assembled', () => {
    expect(calculateProgress(10, 10)).toBe(99)
  })

  it('returns zero when the total is unknown', () => {
    expect(calculateProgress(4, null)).toBe(0)
  })
})
