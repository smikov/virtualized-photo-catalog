import { z } from 'zod'

/**
 * Схема валидации объекта фотографии.
 */
export const photoSchema = z.object({
  albumId: z.number(),
  id: z.number(),
  title: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url(),
})

/**
 * Схема валидации массива фотографий.
 */
export const photosListSchema = z.array(photoSchema)

/**
 * Тип фотографии.
 */
export type Photo = z.infer<typeof photoSchema>
