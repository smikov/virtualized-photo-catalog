/**
 * Проверяем контракт данных с сервера.
 *
 * Почему так: схема — единственная защита от изменения формата API. Тесты фиксируют
 * три вещи: валидная запись проходит, невалидный URL отбрасывается, список проверяется
 * целиком. Без этого Zod можно «починить» так, что он перестанет ловить ошибки.
 */
import { describe, it, expect } from 'vitest'
import { photoSchema, photosListSchema } from './photoSchema'

describe('photoSchema validation', () => {
  // Test that valid photo object successfully validates
  it('should validate a correct photo object', () => {
    const validPhoto = {
      albumId: 1,
      id: 1,
      title: 'accusamus beatae ad facilis cum similique qui sunt',
      url: 'https://via.placeholder.com/600/92c952',
      thumbnailUrl: 'https://via.placeholder.com/150/92c952',
    }

    const result = photoSchema.safeParse(validPhoto)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validPhoto)
    }
  })

  // Test that invalid photo object (e.g. invalid URL) fails validation
  it('should fail validation when URL is invalid', () => {
    const invalidPhoto = {
      albumId: 1,
      id: 1,
      title: 'test title',
      url: 'not-a-url',
      thumbnailUrl: 'https://via.placeholder.com/150/92c952',
    }

    const result = photoSchema.safeParse(invalidPhoto)
    expect(result.success).toBe(false)
  })

  // Test that list of photos validates correctly
  it('should validate an array of photos', () => {
    const validList = [
      {
        albumId: 1,
        id: 1,
        title: 'title one',
        url: 'https://via.placeholder.com/600/1',
        thumbnailUrl: 'https://via.placeholder.com/150/1',
      },
      {
        albumId: 1,
        id: 2,
        title: 'title two',
        url: 'https://via.placeholder.com/600/2',
        thumbnailUrl: 'https://via.placeholder.com/150/2',
      },
    ]

    const result = photosListSchema.safeParse(validList)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(2)
    }
  })
})
