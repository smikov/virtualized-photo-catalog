/**
 * Ошибка отмены запроса.
 */
export class AbortError extends Error {
  /**
   * Создаёт ошибку отмены.
   * @param {string} [message] - Сообщение об ошибке.
   * @param {ErrorOptions} [options] - Опции ошибки.
   */
  constructor(message = 'Загрузка была отменена пользователем', options?: ErrorOptions) {
    super(message, options)
    this.name = 'AbortError'
  }
}
