import type { ReactNode } from 'react'
import { Button } from '@/shared/ui'
import styles from './LoadPhotosFeature.module.css'

interface StateNoticeProps {
  icon: ReactNode
  title: string
  description?: string
  tone?: 'neutral' | 'error'
  actionLabel: string
  onAction: () => void
}

/**
 * Блок состояния загрузки: иконка, заголовок, пояснение и одно основное действие.
 *
 * @param {StateNoticeProps} props - Свойства компонента.
 * @returns {JSX.Element} Элемент состояния.
 */
export function StateNotice({
  icon,
  title,
  description,
  tone = 'neutral',
  actionLabel,
  onAction,
}: StateNoticeProps) {
  return (
    <div
      className={`${styles.notice} ${tone === 'error' ? styles.noticeError : ''}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <span className={styles.noticeIcon}>{icon}</span>
      <p className={styles.noticeTitle}>{title}</p>
      {description && <p className={styles.noticeText}>{description}</p>}
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  )
}
