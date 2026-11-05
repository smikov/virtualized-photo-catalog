/**
 * Реестр активных HTTP-запросов.
 */
export interface RequestRegistry {
  /**
   * Начинает запрос, прерывая предыдущий.
   * @returns {AbortController} Контроллер нового запроса.
   */
  start(): AbortController
  /**
   * Освобождает ссылку, если она всё ещё указывает на завершившийся запрос.
   * @param {AbortController} controller - Контроллер запроса.
   */
  finish(controller: AbortController): void
  /**
   * Прерывает текущий запрос.
   * @param {string} [reason] - Причина отмены.
   */
  abortCurrent(reason?: string): void
}

/**
 * Структура, которую приложение кладёт в `extra` для thunk'ов.
 */
export interface RequestsExtra {
  requests: RequestRegistry
}

/**
 * Создаёт реестр активных HTTP-запросов.
 *
 * @returns {RequestRegistry} Реестр запросов.
 */
export function createRequestRegistry(): RequestRegistry {
  let currentController: AbortController | null = null

  return {
    start() {
      currentController?.abort('superseded')
      currentController = new AbortController()
      return currentController
    },

    finish(controller) {
      if (currentController === controller) {
        currentController = null
      }
    },

    abortCurrent(reason = 'cancelled') {
      currentController?.abort(reason)
      currentController = null
    },
  }
}
