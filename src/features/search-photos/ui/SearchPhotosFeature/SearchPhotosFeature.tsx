import { useState, useEffect, useId, useRef, useCallback } from 'react'
import { VisuallyHidden } from '@/shared/ui'
import styles from './SearchPhotosFeature.module.css'

interface SearchPhotosFeatureProps {
  value?: string
  onChange?: (query: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  label?: string
}

/**
 * Компонент поиска по таблице с поддержкой debounce.
 *
 * @param {SearchPhotosFeatureProps} props - Свойства компонента.
 * @returns {JSX.Element} Поле поиска.
 */
export function SearchPhotosFeature({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Поиск по названию...',
  label = 'Поиск по названию фотографии',
}: SearchPhotosFeatureProps) {
  const [internalValue, setInternalValue] = useState('')
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const update = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    },
    [isControlled, onChange]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(value.trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [value, onSearch])

  useEffect(() => {
    const element = inputRef.current
    if (!element) return

    const handleNativeSearch = () => {
      update(element.value)
      onSearch?.(element.value.trim())
    }

    element.addEventListener('search', handleNativeSearch)
    return () => element.removeEventListener('search', handleNativeSearch)
  }, [onSearch, update])

  const handleClear = () => {
    update('')
    onSearch?.('')
    inputRef.current?.focus()
  }

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId}>
        <VisuallyHidden>{label}</VisuallyHidden>
      </label>
      <div className={styles.field}>
        <input
          id={inputId}
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => update(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && value) {
              event.preventDefault()
              handleClear()
            }
          }}
          placeholder={placeholder}
          className={styles.input}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className={styles.clear}
            onClick={handleClear}
            aria-label="Сбросить поиск"
            title="Сбросить поиск"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
