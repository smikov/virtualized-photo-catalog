/**
 * Public API общего UI-слоя.
 *
 * Здесь только примитивы, переиспользуемые в двух и более местах. Компонент,
 * который нужен одной фиче, живёт в папке этой фичи — см. ADR 023.
 */
export { VisuallyHidden } from './VisuallyHidden/VisuallyHidden'
export { Button } from './Button/Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button/Button'
