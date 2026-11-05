import styles from './HighlightText.module.css'

interface HighlightTextProps {
  text: string
  query: string
}

/** Экранирует спецсимволы регулярного выражения */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Компонент для подсветки поискового запроса цветом в строке
 */
export function HighlightText({ text, query }: HighlightTextProps) {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return <>{text}</>
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'gi'))
  const lowerQuery = normalizedQuery.toLowerCase()

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === lowerQuery ? (
          <mark className={styles.mark} key={index}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}
