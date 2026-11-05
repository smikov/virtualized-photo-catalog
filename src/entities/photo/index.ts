/**
 * Public API сущности «Фотография».
 *
 * Снаружи доступны только модель (тип и Zod-схема) и загрузка одной страницы.
 * Внутреннее устройство (пути к файлам) скрыто за barrel-файлом — см. ADR 013.
 */
export { photoSchema, photosListSchema } from './model/photoSchema'
export type { Photo } from './model/photoSchema'
export { fetchPhotoPage } from './api'
export type { PhotoPage, FetchPhotoPageParams } from './api'
