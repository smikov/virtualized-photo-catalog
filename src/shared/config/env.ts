import { z } from 'zod'

const DEFAULT_API_URL = 'https://jsonplaceholder.typicode.com/photos'

const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .url()
    .default(DEFAULT_API_URL)
    .refine(
      (url) => !import.meta.env.PROD || url.startsWith('https://'),
      'В production VITE_API_URL должен использовать HTTPS'
    ),
  VITE_API_RETRIES: z.coerce.number().int().min(0).default(3),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().min(0).default(15_000),
  VITE_API_RETRY_DELAY: z.coerce.number().int().min(0).default(1000),
  VITE_API_PAGE_SIZE: z.coerce.number().int().positive().max(5000).default(500),
  VITE_API_MAX_CONCURRENCY: z.coerce.number().int().positive().max(10).default(3),
  VITE_API_TOTAL_PHOTOS: z.coerce.number().int().positive().optional(),
  VITE_API_ARTIFICIAL_DELAY_MS: z.coerce.number().int().min(0).max(60_000).default(300),
  VITE_PHOTOS_AUTOLOAD: z
    .string()
    .toLowerCase()
    .pipe(z.enum(['on', 'off', 'true', 'false', '1', '0']))
    .default('off')
    .transform((value) => value === 'on' || value === 'true' || value === '1'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `• ${i.path.join('.')}: ${i.message}`).join('\n')
  throw new Error(`Некорректные переменные окружения:\n${issues}`)
}

export const env = parsed.data
export type Env = typeof env
