/** Иконки состояний загрузки: инлайн-SVG, чтобы не тянуть UI-библиотеку */

const commonProps = {
  width: 40,
  height: 40,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** Каталог ещё не загружен */
export function ImagesIcon() {
  return (
    <svg {...commonProps} aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="M4 16.5l4.5-4 3 2.5 3-3.5L20 16" />
    </svg>
  )
}

/** Загрузка отменена */
export function CancelledIcon() {
  return (
    <svg {...commonProps} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  )
}

/** Загрузка завершилась ошибкой */
export function AlertIcon() {
  return (
    <svg {...commonProps} aria-hidden="true" focusable="false">
      <path d="M12 4.5l8 14H4l8-14z" />
      <path d="M12 10v4M12 16.5v.01" />
    </svg>
  )
}
