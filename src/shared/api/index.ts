/**
 * Public API сетевого слоя.
 */
export { fetchWithRetry, fetchWithRetryResponse, REQUEST_CANCELLED_MESSAGE } from './httpClient'
export { installRequestDelay, delayWithAbort } from './requestDelay'
export type { FetchOptions, FetchResult } from './httpClient'
