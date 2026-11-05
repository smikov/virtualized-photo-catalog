import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'danger' | 'secondary'
export type ButtonSize = 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

/**
 * Кнопка с вариантами оформления.
 *
 * `secondary` — действие второго плана (обводка вместо заливки), `danger` — необратимое
 * или прерывающее действие. Внешние классы разрешены: конкретный экран может добавлять
 * отступы, не переписывая оформление.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [styles[variant], size === 'lg' ? styles.lg : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return <button type={type} className={classes} {...rest} />
}
