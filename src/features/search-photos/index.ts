/**
 * Public API фичи поиска.
 *
 * SearchPhotosFeature — управляемый инпут с debounce, HighlightText — подсветка
 * совпадений; они используются вместе, но живут отдельными компонентами,
 * чтобы подсветку можно было применять и без инпута.
 */
// Public API фичи поиска фотографий
export { SearchPhotosFeature } from './ui/SearchPhotosFeature/SearchPhotosFeature'
export { HighlightText } from './ui/HighlightText/HighlightText'
