/**
 * Public API виджета таблицы.
 *
 * Таблица и её скелетон экспортируются вместе: странице нужны оба состояния,
 * а знать про внутренние файлы ей не обязательно.
 * Thumbnail наружу не отдаётся — это деталь ячейки таблицы.
 */
// Public API виджета таблицы фотографий
export { PhotosTableWidget } from './ui/PhotosTableWidget/PhotosTableWidget'
export { PhotosTableSkeleton } from './ui/PhotosTableSkeleton/PhotosTableSkeleton'
