import type { ReactNode } from 'react'
import styles from './VisuallyHidden.module.css'

interface VisuallyHiddenProps {
  children: ReactNode
}

/**
 * Текст для скринридера, невидимый на экране.
 *
 * Нужен там, где визуальная подпись избыточна (поле поиска с плейсхолдером),
 * но программа чтения с экрана без неё не назовёт элемент.
 */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className={styles.visuallyHidden}>{children}</span>
}
