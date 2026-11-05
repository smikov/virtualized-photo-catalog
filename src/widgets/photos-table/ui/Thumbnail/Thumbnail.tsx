import { useState } from 'react'
import styles from './Thumbnail.module.css'

interface ThumbnailProps {
  src: string
  originalUrl: string
  alt: string
}

type ThumbnailStatus = 'loading' | 'loaded' | 'failed'

/**
 * Миниатюра со ссылкой на оригинал.
 *
 * Пока картинка грузится, на её месте показывается шиммер той же высоты —
 * иначе в виртуализированных строках видны пустые области.
 */
export function Thumbnail({ src, originalUrl, alt }: ThumbnailProps) {
  const [status, setStatus] = useState<ThumbnailStatus>('loading')

  // Битая картинка не должна оставлять пустую ячейку: показываем заглушку
  if (status === 'failed') {
    return (
      <span
        className={styles.thumbnailFallback}
        title="Изображение недоступно"
        aria-label="Изображение недоступно"
      >
        нет фото
      </span>
    )
  }

  return (
    // Ссылка, а не обработчик клика: работает клавиатура, средняя кнопка и «открыть в новой вкладке»
    <a
      href={originalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.thumbnailLink}
      title="Открыть оригинал в новой вкладке"
    >
      {status === 'loading' && <span className={styles.thumbnailSkeleton} aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        width={50}
        height={50}
        loading="lazy"
        decoding="async"
        className={status === 'loaded' ? styles.thumbnail : styles.thumbnailPending}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('failed')}
      />
    </a>
  )
}
